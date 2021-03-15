
export interface RelianceDependencyJson {
  method: string;
}

export interface RelianceJson {
  name: string;
  dependencies: {
    [key: string]: RelianceDependencyJson
  };
  files: string[];
}

export interface MethodJson {
  name: string;
  main: string;
}

/**A downloaded package in RAM to be saved on disk*/
export interface ReliancePackage {
  /**The name of the package*/
  name: string;
  /**The filename of package file (reliance.json)*/
  pkgfname: string;
  /**A map of filenames to file binary contents*/
  files: {
    [key: string]: Uint8Array
  },
  pkgjson: RelianceJson
}

export interface MethodResolve {
  /**The original name as specified by user command*/
  name: string;
  /**The remote source directory containing package json*/
  remoteSrcDir: string;
  /**The remote source file name of package json
   * such that remoteSrcDir joined with remoteSrcPkgFname will give the
   * full remote path to reliance.json package file
   */
  remoteSrcPkgFname: string;
}

export class Method {
  protected name: string;

  constructor (name: string) {
    if (!name) throw `Name must be specified, got "${name}"`;
    this.name = name.toLowerCase();
  }
  getMethodName (): string {
    return this.name;
  }
  getPackage (srcPackageFileName: string): Promise<ReliancePackage> {
    throw `Method.getPackage was not implemented on subclass! ${this}`;
  }
  getPackageJson (srcPackageName: string): Promise<RelianceJson> {
    throw `Method.getPackageJson was not implemented on subclass! ${this}`;
  }
  /**Override this method in your subclass, do not call super.resolve
   * 
   * An implementation for a specific use case such as github might be:
   * 
   * ```
   * resolve ("namespace/mypackage");
   * //returns "https://www.github.com/namespace/mypackage/reliance.json"
   * ```
   * 
   * @param srcPackageName the name of the package as passed by command argument
   */
  resolve (srcPackageName: string): Promise<MethodResolve> {
    throw `Method.resolve was not implemented on subclass! ${this}`;
  }
}
