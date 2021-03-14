
import { Method, RelianceJson } from "../../method";

export default class WgetMethod extends Method {
  constructor () {
    super("wget-package");
  }
  getPackage (src: string): Promise<RelianceJson> {
    return new Promise(async(resolve, reject)=>{
      let url = await this.resolve(src);

      let response = await fetch(url);

      let result = await response.json();

      resolve(result);
    });
  }
  resolve (src: string): Promise<string> {
    return new Promise(async (resolve, reject)=>{
      if (!src) reject(`Cannot resolve package source "${src}"`);
      resolve(src.toLowerCase());
    });
  }
}
