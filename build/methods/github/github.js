import fetch from "node-fetch";
import { Method } from "../../method.js";
export default class Github extends Method {
  constructor() {
    super("Github");
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
      let url = `https://raw.githubusercontent.com/${src}/master/package.json`;
      resolve(url);
    });
  }

}