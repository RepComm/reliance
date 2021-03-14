import { Method } from "../../method";
export default class WgetMethod extends Method {
  constructor() {
    super("wget-package");
  }

  getPackage(src) {
    var _this = this;

    return new Promise(async function (_resolve, _reject) {
      let url = await _this.resolve(src);
      let response = await fetch(url);
      let result = await response.json();

      _resolve(result);
    });
  }

  resolve(src) {
    return new Promise(async function (_resolve, _reject) {
      if (!src) _reject(`Cannot resolve package source "${src}"`);

      _resolve(src.toLowerCase());
    });
  }

}