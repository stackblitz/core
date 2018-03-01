const router = require('express').Router();
const request = require('superagent');
const semver = require('semver');
const { normalizePath } = require('typescript');
const stringify = require('json-stable-stringify');
const {
  fetchChildDefinitions,
  fetchChildDependencies,
  fetchDirList,
  fetchPackageJson,
  JSDELIVR_URL
} = require('./fetchers');

router.use(require('./packageURLMiddleware'));

function turboHandler(req, res, next) {
  if (req.packageVersion === 'latest' || !semver.valid(req.packageVersion)) {
    return res.status(400).send({ error: 'Must specify exact version' });
  }

  const { packageSlug } = req;

  const vendorFiles = {};

  Promise.all([fetchDirList(packageSlug), fetchPackageJson(packageSlug)])
    .then(([fileList, packageJson]) => {
      const entryPoint = packageJson.main || 'index.js';
      const typesEntry =
        packageJson.types || packageJson.typings || 'index.d.ts';

      return Promise.all([
        fetchChildDependencies(
          `${JSDELIVR_URL}/${packageSlug}`,
          normalizePath(entryPoint),
          fileList.concat(), // Pass a copy since fetchChildDependencies will mutate fileList
          vendorFiles
        ),
        fetchChildDefinitions(
          `${JSDELIVR_URL}/${packageSlug}`,
          normalizePath(typesEntry),
          fileList.concat(), // Pass a copy since fetchChildDefinitions will mutate fileList
          vendorFiles
        )
      ]).then(() => {
        res.setHeader('Cache-Control', 'public, max-age=31557600, immutable');
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.send(
          stringify({ vendorFiles, dirCache: { [packageSlug]: fileList } })
        );
      });
    })
    .catch(error => {
      console.error(error);
      res.sendStatus(400);
    });
}

router.get('/:package@:version', turboHandler);
router.get('/@:scoped/:package@:version', turboHandler);

module.exports = router;
