
import { Method, MethodResolve, RelianceJson } from "../../method.js";

export default class WgetMethod extends Method {
  constructor () {
    super("wget-package");
  }
  getPackageJson (src: string): Promise<RelianceJson> {
    return new Promise(async(_resolve, _reject)=>{
      let url = await this.resolve(src);

      let response = await fetch(
        url.remoteSrcDir + "/" + url.remoteSrcPkgFname
      );

      let result = await response.json();

      _resolve(result);
    });
  }
  resolve (src: string): Promise<MethodResolve> {
    return new Promise(async (_resolve, _reject)=>{
      if (!src) _reject(`Cannot resolve package source "${src}"`);
      
      let result: MethodResolve = {
        name: src,
        remoteSrcDir: undefined,//TODO
        remoteSrcPkgFname: undefined //TODO
      };
      
      _resolve(result);
    });
  }
}
