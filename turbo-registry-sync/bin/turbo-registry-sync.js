#!/usr/bin/env node

const follower = require('concurrent-couch-follower');
const Redis = require('ioredis');
const request = require('request-promise');
const npa = require('npm-package-arg');

const REDIS_URL = process.env.REDIS_URL;
const REGISTRY_URL = 'https://registry.npmjs.org';
const COUCH_URL = 'https://replicate.npmjs.com/_changes';

const redis = new Redis(REDIS_URL);

const SEQ_KEY = 'seq';
const PKG_KEY_PREFIX = 'p/';
const STALE_SET_KEY = 'srq';
const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

function getLastSeq(){
  return redis.get(SEQ_KEY);
}

function setLastSeq(seq){
  return redis.set(SEQ_KEY, seq);
}

function getPackage(name){
  return redis.get(PKG_KEY_PREFIX + name).then(pkg => JSON.parse(pkg));
}

function setPackage(name, value){
  return redis.set(PKG_KEY_PREFIX + name, JSON.stringify(value));
}

function deletePackage(name){
  return redis.del(PKG_KEY_PREFIX + name);
}

function getRegPackage(name){
  const escapedName = npa(name).escapedName;

  return request.get({
    url: `${REGISTRY_URL}/${escapedName}`,
    json: true
  }).catch(error => {
    if(error && error.statusCode === 503){
      console.log(`503 Registry response fetching ${name}, retrying in 5s`);

      return new Promise((resolve, reject) => setTimeout(() => resolve(getRegPackage(name)), 5000));
    }

    throw error;
  });
}

function enqueueStaleRetry(name){
  return redis.sadd(STALE_SET_KEY, name);
}

function dequeueStaleRetry(name){
  return redis.srem(STALE_SET_KEY, name);
}

function retryStalePackages(){
  return redis.smembers(STALE_SET_KEY).then(pkgs => {
    console.log('Refetching potentially stale packages', pkgs)

    return Promise.all(pkgs.map(pkgName => {
      return getRegPackage(pkgName).then(pkg => {
        console.log('ADDING:', pkgName);

        return setPackage(pkgName, slimPackage(pkg));
      }).then(() => dequeueStaleRetry(pkgName))
      .catch((error) => {
        if(error && error.statusCode !== 404){
          console.warn('SKIP:', change, error.message, error.stack);
        } else {
          return dequeueStaleRetry(pkgName);
        }
      });
    }));
  });
}

function getLastRegSeq(){
  return request.get({
    url: `${COUCH_URL}?descending=true&limit=1`,
    json: true
  }).then(r => r.last_seq);
}

const packageKeys = ['_rev', 'name', 'dist-tags', 'versions'];

const versionKeys = ['name', 'version', 'main', 'browser', 'unpkg',
  'dependencies', 'devDependencies', 'optionalDependencies',
  'peerDependencies', 'module', 'jsnext:main', 'types', 'typings'
];

function slimPackage(pkg){
  let newPkg = {};

  packageKeys.forEach((key) => {
    if(pkg.hasOwnProperty(key)){
      newPkg[key] = pkg[key];
    }
  });

  if(pkg.hasOwnProperty('versions')){
    newPkg.versions = {};

    Object.keys(pkg.versions).forEach((version) => {
      newPkg.versions[version] = {};

      versionKeys.forEach((key) => {
        if(pkg.versions[version].hasOwnProperty(key)){
          newPkg.versions[version][key] = pkg.versions[version][key];
        }
      });
    });
  }

  return newPkg;
}

let lastTouch = new Date();

function touchTimeout(){
  lastTouch = new Date();
}

function checkTimeout(){
  if(new Date() - lastTouch > 10 * MINUTE_MS){
    console.log("Haven't received data from registry in 10 minutes, exiting");
    process.exit(1);
  }
}

setInterval(checkTimeout, MINUTE_MS);

Promise.all([getLastSeq(), getLastRegSeq()]).then(([since, bootRegSeq])=>{
  return [Number(since) || 0, Number(bootRegSeq) || 0];
}).then(([since, bootRegSeq]) => {
  console.log('RESUMING SINCE', since);

  setInterval(retryStalePackages, 6 * MINUTE_MS);

  follower(function (change, done){
    touchTimeout();

    if(!change){
      console.warn('WARNING: invalid change');
      return done();
    }
    if(!change.id){
      console.log('SKIP:', change);
      return done();
    }

    const caughtUp = change.seq > bootRegSeq;
    const promise = !caughtUp ? Promise.resolve() : new Promise((resolve, reject) => setTimeout(resolve, 7500));

    promise.then(() => getRegPackage(change.id).then((pkg) => {
      console.log('ADDING:', change.id);

      if(caughtUp){
        const pkgMod = new Date(pkg.time.modified);

        if((new Date() - pkgMod) > HOUR_MS){
          console.warn(`WARNING: Registry data for ${change.id} may be stale, will retry later.`);
          enqueueStaleRetry(change.id);
        }
      }

      return setPackage(change.id, slimPackage(pkg));
    }).catch(error => {
      if(error && error.statusCode !== 404){
        console.warn('ERROR:', change, error.message, error.stack);
        console.warn(`Queueing ${change.id} for retry.`);
        return enqueueStaleRetry(change.id);
      }
    }).finally(() => {
      done();
    }));
  }, {
    db: COUCH_URL,
    include_docs: false,
    since,
    sequence: (seq, done) => setLastSeq(seq).then(done),
    concurrency: 8
  });
});
