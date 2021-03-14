export class Method {
  constructor(name) {
    if (!name) throw `Name must be specified, got "${name}"`;
    this.name = name.toLowerCase();
  }

  getMethodName() {
    return this.name;
  }

  getPackage(srcPackageName) {
    throw `Method.getPackage was not implemented on subclass! ${this}`;
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


  resolve(srcPackageName) {
    throw `Method.resolve was not implemented on subclass! ${this}`;
  }

}