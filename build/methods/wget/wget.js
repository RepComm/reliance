import { Method } from "../../method.js";
export default class WgetMethod extends Method {
  constructor() {
    super("wget-package");
  }

  getPackageJson(src) {
    var _this = this;

    return new Promise(async function (_resolve, _reject) {
      let url = await _this.resolve(src);
      let response = await fetch(url.remoteSrcDir + "/" + url.remoteSrcPkgFname);
      let result = await response.json();

      _resolve(result);
    });
  }

  resolve(src) {
    return new Promise(async function (_resolve, _reject) {
      if (!src) _reject(`Cannot resolve package source "${src}"`);
      let result = {
        name: src,
        remoteSrcDir: undefined,
        //TODO
        remoteSrcPkgFname: undefined //TODO

      };

      _resolve(result);
    });
  }

}