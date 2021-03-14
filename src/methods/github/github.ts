
import fetch from "node-fetch";
import { Method, RelianceJson } from "../../method.js";

export default class Github extends Method {
  constructor () {
    super("Github");
  }
  getPackage (src: string): Promise<RelianceJson> {
    return new Promise(async(_resolve, _reject)=>{
      let url = await this.resolve(src);

      let response = await fetch(url);

      let result = await response.json();

      _resolve(result);
    });
  }
  resolve (src: string): Promise<string> {
    return new Promise(async (_resolve, _reject)=>{
      if (!src) _reject(`Cannot resolve package source "${src}"`);
      let url = `https://raw.githubusercontent.com/${src}/master/package.json`;
      _resolve(url);
    });
  }
}

