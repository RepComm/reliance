import { Method } from "../../method";
export default class WgetMethod extends Method {
  constructor() {
    super("wget-package");
  }

  getPackage(src) {
    var _this = this;

    return new Promise(async function (resolve, reject) {
      let url = await _this.resolve(src);
      let response = await fetch(url);
      let result = await response.json();
      resolve(result);
    });
  }

  resolve(src) {
    return new Promise(async function (resolve, reject) {
      if (!src) reject(`Cannot resolve package source "${src}"`);
      resolve(src.toLowerCase());
    });
  }

}