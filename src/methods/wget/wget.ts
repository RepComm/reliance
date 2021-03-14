
import { Method, RelianceJson } from "../../method.js";

export default class WgetMethod extends Method {
  constructor () {
    super("wget-package");
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
      _resolve(src.toLowerCase());
    });
  }
}
