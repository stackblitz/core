# StackBlitz - Turbo CDN

Express.js routes used for hydrating client-side dependencies and type
definitions on StackBlitz.

These routes trace and download CommonJS entry points and type definitions for
npm dependencies and returns them with a directory listing. Any files missed by
the trace are expected to be fetched by clients on-demand.

Traces are designed to be idempotent, making them highly cachable and ideal for
being placed behind a CDN.

Roadmap:

- Add query params for excluding/including specific traces or type definitions
- Provide query parameters for tracing arbitrary entry points (e.g., subpackages)
- Support tagged dependencies on GitHub

## Requests

Requests must specify an absolute package version like `@angular/core@5.2.6` or
`rxjs@5.5.6` in the URL.

## Responses

A successful trace should return an object similar to:

```js
{
  vendorFiles: { "PATH": "FILE_CONTENTS" },
  dirCache: { "PACKAGE_NAME@VERSION": ["LIST", "OF", "FILES", "IN", "PACKAGE"] }
}
```

`vendorFiles` contains all files traced by the request
`dirCache` contains a list of all files existing in the package
