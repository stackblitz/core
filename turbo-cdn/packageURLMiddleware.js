const validateNPMPackageName = require('validate-npm-package-name');
const url = require('url');

const URLFormat = /^\/((?:@[^\/@]+\/)?[^\/@]+)(?:@([^\/]+))?(\/.*)?$/;

function packageURL(req, res, next) {
  const { pathname, search, query } = url.parse(req.url, true);

  const match = URLFormat.exec(pathname);

  if (match === null){
    return res
      .status(400)
      .type('text')
      .send(`Invalid URL: ${req.url}`);;
  }

  const packageName = match[1];
  const packageVersion = tryDecode(match[2]) || 'latest';
  const filename = tryDecode(match[3]);
  const errors = validateNPMPackageName(packageName).errors;

  if (errors){
    return res
      .status(400)
      .type('text')
      .send(
        `Invalid package name: ${packageName} (${errors.join(', ')})`
      );
  }

  req.packageName = packageName;
  req.packageVersion = packageVersion;
  req.packageSlug = `${packageName}@${packageVersion}`;
  req.pathname = pathname;
  req.filename = filename;
  req.search = search;
  req.query = query;

  next();
}

function tryDecode(param) {
  if (param) {
    try {
      return decodeURIComponent(param);
    } catch (error) {}
  }

  return '';
}

module.exports = packageURL;
