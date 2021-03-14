# package

A package is an install-able source

## Minimal example
Given name id `somepackage`:

File structure:<br/>
```bash
somepackage/
 +- reliance.json  #necessary
 +- src/           #optional
    +- somefile.c  #optional
```

## Reliance Json
`reliance.json` describes the package to reliance package manager, it is the only required component.

A basic example:
```json
{
  "name": "somepackage",

  "files":[
    "src/somefile.c"
  ]
}
```
Which will tell the method to also fetch `somefile.c`

Reliance will keep the directory structure<br/>
of the remote package, but will only copy files specified by `reliance.json`'s "files" field.

To include an entire directory, use wildcard `*`<br/>
Example: `"files": [ "src/*" ]`
<br/>This is recursive, so subdirectories will also be included.

## Methods
A method describes how the source is fetched, which is deterministic.

This enables reliance to handle different kinds of packaging, such as git urls, specific apis such as github, or plain http resources.

Methods is an extendible feature by default,
so if you want to add your own kind of repository fetching mechanism you can create a method. See [method.md specs](./method.md)

Pre-shipped methods include:
- wget
- github

Dependencies will look like

```json
{
  "dependencies": {
    
    "user/repo/branch": {
      "method": "github"
    },

    "www.example.com" : {
      "method": "wget"
    }

  }
}
```

For the `user/repo` dependency, it will fetch from https://raw.githubusercontent.com/user/repo/branch/reliance.json

If branch is not included, it will query github API for default branch and try that.

For the `www.example.com` dependency, it will fetch from https://www.example.com/reliance.json`

The `reliance.json` part is inferred, however it can be overridden by specifying a direct file:

```json
{
  "dependencies": {
    
    "user/repo/branch/specificfile.json": {
      "method": "github"
    },

    "www.example.com/specificfile.json" : {
      "method": "wget"
    }

  }
}
```

This method is intended for storing many packages that may share resources in the same directory, but not intended for version control.

To reference a specific commit on github, you can use:
```json
{
  "dependencies": {
    "user/repo/commithash":{
    "method": "github"
  }
}
```
Again you can specify a specific `json`:
```json
{
  "dependencies": {
    "user/repo/commithash/specificfile.json":{
    "method": "github"
  }
}
```
