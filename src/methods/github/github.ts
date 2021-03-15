
import fetch from "node-fetch";
import { Method, MethodResolve, RelianceJson, ReliancePackage } from "../../method.js";

export default class Github extends Method {
  constructor () {
    super("Github");
  }
  getPackage (src: string): Promise<ReliancePackage> {
    return new Promise(async (_resolve, _reject)=>{
      let res = await this.resolve(src);

      let pkg = await this.getPackageJson(src);

      let result: ReliancePackage = {
        name: res.name,
        files: {},
        pkgfname: res.remoteSrcPkgFname,
        pkgjson: pkg
      };

      let remoteFile: string;
      if (pkg.files) {
        for (let file of pkg.files) {
          remoteFile = `${res.remoteSrcDir}/${file}`;
          // console.log("Fetching file", file, "from", remoteFile);
          console.log("fetching", file);
          let resp = await fetch(remoteFile);
          let data = await resp.arrayBuffer();

          result.files[file] = data;
        }
      }

      _resolve(result);
    });
  }
  getPackageJson (src: string): Promise<RelianceJson> {
    return new Promise(async(_resolve, _reject)=>{
      let res = await this.resolve(src);

      let response = await fetch(`${res.remoteSrcDir}/${res.remoteSrcPkgFname}`);

      // let text = await response.text();

      // console.log(text);

      // let result = JSON.parse(text);
      let result = await response.json();

      _resolve(result);
    });
  }
  /**Resolves reliance.json file name
   * In this method's case it resolves to
   * a github url that can fetch the file
   */
  resolve (src: string): Promise<MethodResolve> {
    return new Promise(async (_resolve, _reject)=>{
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
      let fpath = undefined;

      if (parts.length > 3) {
        let fileparts = parts.slice(3, -1);
        fpath = fileparts.join("/");
        file = fileparts[fileparts.length-1];
      }
      // console.log("fpath", fpath);

      let dir: string;
      if (fpath) {
        dir = `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${fpath}`;
      } else {
        dir = `https://raw.githubusercontent.com/${user}/${repo}/${branch}`;
      }

      let result: MethodResolve = {
        name: src,
        remoteSrcDir: dir,
        remoteSrcPkgFname: file
      };
      _resolve(result);
    });
  }
}

