# reliance

## Usage
```bash
# installing a package
reliance install <packagename> [opts]
reliance i <packagename> [opts]

# uninstalling a package
reliance uninstall <packagename> [opts]
reliance u <packagename> [opts]

# listing install methods
reliance method list

# set the global default method
reliance method default set <methodname>

# output default method onto console
reliance method default get
```

Options
```bash
# explicity use a specific source method
-method=wget

# explicity use a specific package file (instead of reliance.json)
-pkg=somefile.json
```

Install a package from github:
```bash
# create your folder
mkdir myproject

# navigate into it
cd myproject

reliance i user/repo -method=github
# or optionally specify branch
reliance i user/repo/branch -method=github
# or optionally specify branch and file
reliance i user/repo/branch/some/file.json -method=github
```

Note: `-method=github` is only required if reliance has another default method set.
