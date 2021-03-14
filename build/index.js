import { readFileSync, writeFileSync } from "fs";
import * as path from "path";
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
}

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

function writeFileSyncJson(fpath, json) {
  let text = JSON.stringify(json, undefined, 2);
  writeFileSync(fpath, text);
}

function terminate(...msgs) {
  error(...msgs);
  process.exit(-1);
}

function getMethodsDir() {
  return path.join(getRelianceDir(), "methods");
}

function getMethodDir(name) {
  return path.join(getMethodsDir(), name);
}

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

function getRelianceJsonFile() {
  return path.join(getWorkspaceDir(), "reliance.json");
}

function getRelianceJson() {
  return new Promise(async (_resolve, _reject) => {
    let result;

    try {
      result = readFileSyncJson(getRelianceJsonFile());
    } catch (ex) {
      _reject(ex);

      return;
    }

    _resolve(result);
  });
}

function setRelianceJson(json) {
  return new Promise(async (_resolve, _reject) => {
    try {
      writeFileSyncJson(getRelianceJsonFile(), json);
    } catch (ex) {
      _reject(ex);

      return;
    }

    _resolve(true);
  });
}

function isDependencyInstalled(pkg, depname) {
  let dep = pkg.dependencies[depname];
  return dep != undefined || dep != null;
}

function getSettingsFile() {
  return path.join(getRelianceDir(), "..", "settings.json");
}

function getSettings() {
  return new Promise(async (_resolve, _reject) => {
    let settings = readFileSyncJson(getSettingsFile());

    _resolve(settings);
  });
}

function setSettings(settings) {
  return new Promise(async (_resolve, _reject) => {
    writeFileSyncJson(getSettingsFile(), settings);
  });
}

async function main() {
  let args = process.argv;
  log("Reliance installed at", getRelianceDir());
  log("Running at workspace", getWorkspaceDir());
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