
import { readFileSync, writeFileSync } from "fs";
import * as path from "path";

import { Method, MethodJson, RelianceJson } from "./method.js";

//binary to text
const decoder = new TextDecoder();

//__dirname fix for node es module mode
const moduleURL = new URL(import.meta.url);
const __dirname = path.dirname(moduleURL.pathname);
const _cwdname = path.resolve(".");

/**Get the reliance install directory*/
function getRelianceDir (): string {
  return __dirname;
}
/**Get the current working dir where we execute commands from*/
function getWorkspaceDir (): string {
  return _cwdname;
}

//A log function
function log(...args: any[]) {
  console.log("[reliance]", ...args);
}

//An error log function
function error(...args: any[]) {
  console.error("[reliance] error:", ...args);
}

/**Read a json file with type generics*/
function readFileSyncJson<T> (fpath: string): T {
  let buffer = readFileSync(fpath);
  let text = decoder.decode(buffer);
  let json: T = JSON.parse(text);
  return json;
}
/**Write a json file*/
function writeFileSyncJson (fpath: string, json: any) {
  let text = JSON.stringify(json, undefined, 2);
  writeFileSync(fpath, text);
}

/**process.exit with an error message*/
function terminate(...msgs: any[]) {
  error(...msgs);
  process.exit(-1);
}

/**Get the directory where methods are installed to*/
function getMethodsDir (): string {
  return path.join( getRelianceDir(), "methods" );
}
/**Get the directory where a specify method is installed*/
function getMethodDir (name: string): string {
  return path.join( getMethodsDir(), name );
}
/**Load a method by its name id*/
function getMethod(name: string): Promise<Method> {
  return new Promise(async (_resolve, _reject)=>{
    let dir = getMethodDir(name);
    let pkg = readFileSyncJson<MethodJson> (path.join(dir, "method.json"));
    
    let imports = await import (path.join(dir, pkg.main));
    let methodClass = imports.default;
    let methodInstance = new methodClass();
    _resolve(methodInstance);
  })
}

/**Get the workspace reliance.json file path*/
function getRelianceJsonFile (): string {
  return path.join( getWorkspaceDir(), "reliance.json");
}
/**Load the workspace reliance.json file as json*/
function getRelianceJson(): Promise<RelianceJson> {
  return new Promise(async (_resolve, _reject) => {
    let result: RelianceJson;
    try {
      result = readFileSyncJson<RelianceJson>(getRelianceJsonFile());
    } catch (ex) {
      _reject(ex);
      return;
    }
    _resolve(result);
  });
}
/**Save the workspace reliance.json file*/
function setRelianceJson (json: RelianceJson): Promise<boolean> {
  return new Promise(async (_resolve, _reject)=>{
    try {
      writeFileSyncJson (getRelianceJsonFile(), json);
    } catch (ex) {
      _reject(ex);
      return;
    }
    _resolve(true);
  })
}
/**Checks if a dependency is present in package reliance.json*/
function isDependencyInstalled (pkg: RelianceJson, depname: string): boolean {
  let dep = pkg.dependencies[depname];
  return dep != undefined || dep != null;
}

/**A settings interface for reliance cli program*/
interface Settings {
  /**The global default method for fetching sources*/
  defaultMethod: string;
}
/**Get the settings file string*/
function getSettingsFile (): string {
  return path.join(getRelianceDir(), "..", "settings.json");
}
/**Load settings as json*/
function getSettings (): Promise<Settings> {
  return new Promise(async (_resolve, _reject)=>{
    let settings = readFileSyncJson<Settings>(getSettingsFile());
    _resolve(settings);
  });
}
/**Save settings*/
function setSettings (settings: Settings): Promise<boolean> {
  return new Promise(async (_resolve, _reject)=>{
    writeFileSyncJson(getSettingsFile(), settings);
  });
}

/**Main program*/
async function main() {
  //Get command line arguments
  let args = process.argv;

  //Let user know where things are
  log("Reliance installed at", getRelianceDir());
  log("Running at workspace", getWorkspaceDir());

  //We need at least 3 arguments, where 3rd is the actual command we process
  if (args.length < 3) terminate("Not enough arguments to run anything");
  let primaryCommand = args[2];

  //Let user know we're loading the settings, then do it
  log("Loading settings");
  const settings = await getSettings();

  //Grab the default method (overwrite if they specify another)
  const method = await getMethod(settings.defaultMethod);

  //Load up the user's reliance.json package file
  log("Loading local reliance.json");
  getRelianceJson().then(async (targetPackage) => {
    if (!targetPackage.dependencies) targetPackage.dependencies = {};

    let depsList = Object.keys(targetPackage.dependencies);
    log(`Found package ${targetPackage.name} with ${depsList.length} dependencies`);

    //Handle the user's command
    switch (primaryCommand) {
      //for either `install` or `i`
      case "i":
      case "install":
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
  }).catch((reason) => {
    error(reason);
    return;
  });
}

main();
