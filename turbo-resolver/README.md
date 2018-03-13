# Stackblitz - Turbo Resolver

Universal NPM dependency resolver.

Designed with support for browsers and use with Node.js.

Resolves dependencies to absolute semver-compatible versions. Entry points
listed in a dependency's package.json (e.g. `main`, `typings`) are returned in
the resolution for loaders to pick up proper file mappings.

A `new Resolver()` will need to be constructed for each set of dependencies
to be resolved. You may need a promise polyfill for the browser, and an npm
registry with CORS enabled.

```javascript
import { Resolver, NpmHttpRegistry } from '@stackblitz/turbo-resolver';

function resolve(dependencies){
  // const resolver = new Resolver(); // For server-side usage, uses https://registry.npmjs.org which doesn't have CORS enabled

  const resolver = new Resolver({
    registry: new NpmHttpRegistry({ registryUrl: 'https://registry.npmjs.cf/' })
  });

  return resolver.resolve(dependencies);
}

resolve({
  "rxjs": "~5.5.0",
  "left-pad": "*",
  "zone.js": "latest",
  "@angular/core": "~5.2.0"
}).then(results => console.log(results))
```

Possible options:
- `registry` - An object that implements `fetch` and `batchFetch` that can
return NPM registry data. A custom registry source can be provided to read from
your own database or private NPM registry.
- `validatePeers` - boolean - turns on/off `peerDependencies` validation,
defaults to `true`.
- `packageJsonProps` - `string[]` - list of properties to retain from
`package.json` for resolved versions.
- `timeout` - number - Number of milliseconds to attempt resolution before
timing out.
- `concurrency` - number - Maximum number of concurrent registry operations,
default value `4`.


Example dependencies payload:
```json
`{
  "rxjs": "~5.5.0",
  "left-pad": "*",
  "zone.js": "latest",
  "@angular/core": "~5.2.0"
}`
```

Resulting output:
```json
{
  "appDependencies": {
    "rxjs": {
      "version": "5.5.6",
      "dependencies": {
        "symbol-observable": "symbol-observable@1.0.1"
      },
      "main": "./Rx.js",
      "typings": "./Rx.d.ts"
    },
    "left-pad": {
      "version": "1.2.0",
      "dependencies": {},
      "main": "index.js",
      "types": "index.d.ts"
    },
    "zone.js": {
      "version": "0.8.20",
      "dependencies": {},
      "main": "dist/zone-node.js",
      "browser": "dist/zone.js",
      "typings": "dist/zone.js.d.ts",
      "unpkg": "dist/zone.js"
    },
    "@angular/core": {
      "version": "5.2.6",
      "dependencies": {
        "rxjs": "rxjs@5.5.6",
        "zone.js": "zone.js@0.8.20",
        "tslib": "tslib@1.9.0"
      },
      "main": "./bundles/core.umd.js",
      "module": "./esm5/core.js",
      "typings": "./core.d.ts"
    }
  },
  "resDependencies": {
    "symbol-observable@1.0.1": {
      "dependencies": {},
      "typings": "index.d.ts"
    },
    "tslib@1.9.0": {
      "dependencies": {},
      "main": "tslib.js",
      "module": "tslib.es6.js",
      "typings": "tslib.d.ts"
    }
  },
  "warnings": {}
}
```


`appDependencies` includes resolutions and mappings for top-level dependencies requested.

`resDependencies` includes resolutions and mappings for sub-dependencies and their dependencies.

## Warnings

Warning responses will still contain a valid resolution, users should be
notified of any warnings.

## Invalid Peers

Example request:

```json
{
  "zone.js": "^0.8.4",
  "rxjs": "*",
  "@angular/core": "5.2.6",
  "@angular/common": "5.2.5",
  "@angular/platform-browser": "5.2.6"
}
```

A requested peer dependency was installed as a top level dependency, so it
isn't missing, but its resolved version doesn't satisfy one or more top-level
dependencies.

```
{
  "warnings": {
    "invalidPeers": {
      "@angular/common@5.2.5": {
        "@angular/core": "5.2.5"
      },
      "@angular/platform-browser@5.2.6": {
        "@angular/common": "5.2.6"
      }
    }
  }
}
```

`@angular/common@5.2.5` requests `@angular/core@5.2.5` but `@angular/core@5.2.6` was installed.
`@angular/platform-browser@5.2.6` requests `@angular/common@5.2.6` but `@angular/common@5.2.5` was installed.

# Errors

## Missing Peer dependencies:

Example request:

```json
{"@angular/common": "5.2.6"}
```

A Peer dependency was missing from the top-level dependency. Includes which
dependencies are missing, along with what top-level dependencies requested that
peer, along with the semver range requested by the top-level dependency.

```json
{
    "error": "MISSING_PEERS",
    "data": {
        "rxjs": {
            "@angular/common@5.2.6": "^5.5.0"
        },
        "@angular/core": {
            "@angular/common@5.2.6": "5.2.6"
        }
    }
}
```

## Package Not Found

Example request:

```json
{"mmnt": "2.20.1"}
```

The request contains a package not found in the registry.

```json
{
  "error": "PACKAGE_NOT_FOUND",
  "data": {
      "name": "mmnt"
  }
}
```

## Unsatisfied Range

Example request:

```json
{"moment": "~1337.0.0"}
```

The request contains a valid package with an invalid range. Includes
which package was requested along with the improper range.

```json
{
  "error": "UNSATISFIED_RANGE",
  "data": {
      "name": "moment",
      "range": "~1337.0.0"
  }
}
```

## Timeout

The request has timed out:
```json
{ "error": "TIMEOUT" }
```
