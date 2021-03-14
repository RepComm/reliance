import { readFileSync, writeFileSync } from "fs"; // import { resolve } from "path";

const decoder = new TextDecoder();

function log(...args) {
  console.log("[reliance]", ...args);
}

function error(...args) {
  console.error("[reliance] error:", ...args);
}

function readFileSyncJson(fpath) {
  let buffer = readFileSync(fpath);
  let text = decoder.decode(buffer);
  let json = JSON.parse(text);
  return json;
}

function terminate(...msgs) {
  error(...msgs);
  process.exit(-1);
}

function getMethod(name) {
  return new Promise(async (resolve, reject) => {
    let dirPkg = `./build/methods/${name}`;
    let pkg = readFileSyncJson(`${dirPkg}/method.json`);
    let dirMain = `./methods/${name}`;
    let imports = await import(`${dirMain}/${pkg.main}`);
    let methodClass = imports.default;
    let methodInstance = new methodClass();
    resolve(methodInstance);
  });
}

function getRelianceJson() {
  return new Promise(async (_resolve, reject) => {
    let result = undefined;
    let fpath = "./reliance.json"; // fpath = resolve(fpath);

    let buffer;

    try {
      buffer = readFileSync(fpath);
    } catch (ex) {
      reject(`Could not read file reliance.json : ${ex}`);
      return;
    }

    let text;

    try {
      text = decoder.decode(buffer);
    } catch (ex) {
      reject(`Could not decode text of reliance.json : ${ex}`);
      return;
    }

    try {
      result = JSON.parse(text);
    } catch (ex) {
      reject(`Could not decode json of reliance.json ${ex}`);
      return;
    }

    _resolve(result);
  });
}

function setRelianceJson(json) {
  let fpath = "./reliance.json";
  let text = JSON.stringify(json, undefined, 2);
  writeFileSync(fpath, text);
}

function isDependencyInstalled(pkg, depname) {
  let dep = pkg.dependencies[depname];
  return dep != undefined || dep != null;
}

function getSettings() {
  return new Promise(async (resolve, reject) => {
    let settings = readFileSyncJson("./settings.json");
    resolve(settings);
  });
}

async function main() {
  let args = process.argv;
  if (args.length < 3) terminate("Not enough arguments to run anything");
  let primaryCommand = args[2];
  log("Loading settings");
  const settings = await getSettings();
  const method = await getMethod(settings.defaultMethod);
  log("Loading local reliance.json");
  getRelianceJson().then(async targetPackage => {
    if (!targetPackage.dependencies) targetPackage.dependencies = {};
    let depsList = Object.keys(targetPackage.dependencies);
    log(`Found package ${targetPackage.name} with ${depsList.length} dependencies`);

    switch (primaryCommand) {
      case "install":
      case "i":
        if (args.length < 4) terminate(`Not enough arguments for install`);
        let packageName = args[3];
        log(`installing ${packageName}`);

        if (isDependencyInstalled(targetPackage, packageName)) {
          terminate(`Package "${packageName}" is already installed`);
          return;
        }

        if (!method) {
          terminate("Cannot install package, no method specified and no default method is set");
          return;
        }

        let installPackage = await method.getPackage(packageName);
        log("Installing", installPackage);
        targetPackage.dependencies[packageName] = {
          method: method.getMethodName()
        };
        setRelianceJson(targetPackage);
        break;

      default:
        log(`Unkown command "${primaryCommand}"`);
        break;
    }
  }).catch(reason => {
    error(reason);
    return;
  });
}

main();