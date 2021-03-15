import fetch from "node-fetch";
import { Method } from "../../method.js";
export default class Github extends Method {
  constructor() {
    super("Github");
  }

  getPackage(src) {
    var _this = this;

    return new Promise(async function (_resolve, _reject) {
      let url = await _this.resolve(src);
      let response = await fetch(url); // let text = await response.text();
      // console.log(text);
      // let result = JSON.parse(text);

      let result = await response.json();

      _resolve(result);
    });
  }

  resolve(src) {
    return new Promise(async function (_resolve, _reject) {
      if (!src) _reject(`Cannot resolve package source "${src}"`);
      let parts = src.split("/");

      if (parts.length < 2) {
        _reject("Not enough / char to specify user/repo");
      }

      let user = parts[0];
      let repo = parts[1];
      let branch = "master";
      if (parts.length > 2) branch = parts[2];
      let file = "reliance.json";

      if (parts.length > 3) {
        let fileparts = parts.slice(3);
        file = fileparts.join("/");
      } //https://raw.githubusercontent.com/${user}/${repo}/${branch}/demodependency/reliance.json


      let url = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${file}`;
      console.log(url);

      _resolve(url);
    });
  }

}