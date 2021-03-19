import { readFileSync, writeFileSync, mkdirSync } from "fs";
import * as path from "path";
import * as readline from "readline";
//binary to text
const decoder = new TextDecoder(); //__dirname fix for node es module mode

const moduleURL = new URL(import.meta.url);

const __dirname = path.dirname(moduleURL.pathname);

const _cwdname = path.resolve(".");
/**Get the reliance install directory*/


function getRelianceDir() {
  return __dirname;
}
/**Get the current working dir where we execute commands from*/


function getWorkspaceDir() {
  return _cwdname;
} //A log function


function log(...args) {
  console.log("[reliance]", ...args);
} //An error log function


function error(...args) {
  console.error("[reliance] error:", ...args);
}
/**Read a json file with type generics*/


function readFileSyncJson(fpath) {
  let buffer = readFileSync(fpath);
  let text = decoder.decode(buffer);
  let json = JSON.parse(text);
  return json;
}
/**Write a json file*/


function writeFileSyncJson(fpath, json) {
  let text = JSON.stringify(json, undefined, 2);
  writeFileSync(fpath, text);
}
/**process.exit with an error message*/


function terminate(...msgs) {
  error(...msgs);
  process.exit(-1);
}
/**Get the directory where methods are installed to*/


function getMethodsDir() {
  return path.join(getRelianceDir(), "methods");
}
/**Get the directory where a specify method is installed*/


function getMethodDir(name) {
  return path.join(getMethodsDir(), name);
}
/**Load a method by its name id*/


function getMethod(name) {
  return new Promise(async (_resolve, _reject) => {
    let dir = getMethodDir(name);
    let pkg = readFileSyncJson(path.join(dir, "method.json"));
    let imports = await import(path.join(dir, pkg.main));
    let methodClass = imports.default;
    let methodInstance = new methodClass();

    _resolve(methodInstance);
  });
}
/**Get the workspace reliance.json file path
 * If fname is not specified, it defaults to `reliance.json`
 */


function getRelianceJsonFile(fname) {
  if (!fname) fname = "reliance.json";
  return path.join(getWorkspaceDir(), fname);
}
/**Load the workspace reliance.json file as json*/


function getRelianceJson(fname) {
  return new Promise(async (_resolve, _reject) => {
    let result;

    try {
      result = readFileSyncJson(getRelianceJsonFile(fname));
    } catch (ex) {
      _reject(ex);

      return;
    }

    _resolve(result);
  });
}
/**Save the workspace reliance.json file*/


function setRelianceJson(json, fname) {
  return new Promise(async (_resolve, _reject) => {
    try {
      writeFileSyncJson(getRelianceJsonFile(fname), json);
    } catch (ex) {
      _reject(ex);

      return;
    }

    _resolve(true);
  });
}
/**Checks if a dependency is present in package reliance.json*/


function isDependencyInstalled(pkg, depname) {
  let dep = pkg.dependencies[depname];
  return dep != undefined || dep != null;
}

function getDependenciesDir() {
  return path.join(getWorkspaceDir(), "reliance");
}
/**A settings interface for reliance cli program*/


/**Get the settings file string*/
function getSettingsFile() {
  return path.join(getRelianceDir(), "..", "settings.json");
}
/**Load settings as json*/


function getSettings() {
  return new Promise(async (_resolve, _reject) => {
    let settings = readFileSyncJson(getSettingsFile());

    _resolve(settings);
  });
}
/**Save settings*/


function setSettings(settings) {
  return new Promise(async (_resolve, _reject) => {
    writeFileSyncJson(getSettingsFile(), settings);
  });
}

async function initPackage(flagArgs) {
  return new Promise(async (_resolve, _reject) => {
    let json = {
      name: "undefined",
      dependencies: {},
      files: []
    };
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    rl.question("What is the package name?\n> ", answer => {
      // TODO: Log the answer in a database
      // console.log(`set name > ${answer}`);
      json.name = answer;
      rl.question(`package file will be ${flagArgs.pkg}, you can change it or leave it (enter)\n> `, answer => {
        if (answer) flagArgs.pkg = answer;

        if (!flagArgs.pkg.endsWith(".json")) {
          flagArgs.pkg += ".json";
        }

        rl.close();
        log(`Writing ${flagArgs.pkg}`);
        setRelianceJson(json, flagArgs.pkg);
        log("Done, exiting. Have a good one!");

        _resolve();

        process.exit(0);
      });
    });
  });
}
/**Main program*/


async function main() {
  //Get command line arguments
  let args = process.argv; //Let user know we're loading the settings, then do it
  // log("Loading settings");

  const settings = await getSettings();
  let flagArgs = {
    pkg: "reliance.json",
    method: settings.defaultMethod
  };

  for (let arg of args) {
    if (arg.startsWith("-")) {
      arg = arg.substring(1); //get rid of hyphen

      let [namedArg, value] = arg.split("=");

      if (!value) {
        flagArgs[namedArg] = true;
      } else {
        flagArgs[namedArg] = value;
      }
    }
  } //Let user know where things are


  log("Reliance installed at", getRelianceDir());
  log("Running at workspace", getWorkspaceDir()); //We need at least 3 arguments, where 3rd is the actual command we process

  if (args.length < 3) terminate("Not enough arguments to run anything");
  let primaryCommand = args[2].toLowerCase();

  if (primaryCommand === "init") {
    await initPackage(flagArgs);
  } //Grab the default method (overwrite if they specify another)


  const method = await getMethod(flagArgs.method);

  if (!method) {
    terminate(`Could not load method by id ${flagArgs.method}`);
    return;
  } //Load up the user's reliance.json package file


  log(`Loading local package ${flagArgs.pkg}`);
  getRelianceJson(flagArgs.pkg).then(async targetPackage => {
    if (!targetPackage.dependencies) targetPackage.dependencies = {};
    let depsList = Object.keys(targetPackage.dependencies);
    log(`Found package ${targetPackage.name} with ${depsList.length} dependencies`); //Handle the user's command

    switch (primaryCommand) {
      //for either `install` or `i`
      case "i":
      case "install":
        if (args.length < 4) terminate(`Not enough arguments for install`);
        let packageName = args[3];

        if (isDependencyInstalled(targetPackage, packageName)) {
          terminate(`Package "${packageName}" is already installed`);
          return;
        }

        log(`installing ${packageName} with method ${flagArgs.method}`);
        /*modify package entry first incase something goes wrong while
         * downloading files, and the user wants to fix the resulting issue
         * by using `reliance uninstall <pname>`
         * 
         * something we've learned from npm's faults
         */

        log("Adding dependency entry in", flagArgs.pkg);
        targetPackage.dependencies[packageName] = {
          method: method.getMethodName()
        };
        setRelianceJson(targetPackage);
        let pkgdata = await method.getPackage(packageName);
        let writeDir = path.join(getDependenciesDir(), pkgdata.name);
        mkdirSync(writeDir, {
          recursive: true
        });
        let pkgpath = path.join(writeDir, pkgdata.pkgfname);
        writeFileSyncJson(pkgpath, pkgdata.pkgjson);
        let fnames = Object.keys(pkgdata.files);
        let absFname;
        let absDir;

        for (let fname of fnames) {
          absDir = path.join(writeDir, path.dirname(fname));
          mkdirSync(absDir, {
            recursive: true
          });
          absFname = path.join(writeDir, fname);
          let buf = Buffer.from(pkgdata.files[fname]);
          writeFileSync(absFname, buf);
        }

        log("Finished!");
        break;

      default:
        log(`Unkown command "${primaryCommand}"`);
        break;
    }
  }).catch(reason => {
    if (flagArgs.pkg) {
      error(`Could not acquire local package file specified as ${flagArgs.pkg}, does it exist?`);
    } else {
      error(`Could not acquire local package file reliance.json, do you need to specify another file name with -pkg=somefile.json ?`);
    }

    error(reason);
    return;
  });
}

main();