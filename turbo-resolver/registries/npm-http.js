const npa = require('npm-package-arg');
const request = require('superagent');
const async = require('async');

module.exports = class NpmHttpRegistry {
  constructor(options = {}){
    this.registryUrl = options.registryUrl || 'https://registry.npmjs.org';
    this.cache = {};
    this.fetching = [];
  }

  fetch(name, cb){
    const escapedName = name && npa(name).escapedName;

    if(this.cache[name]){
      cb(false, this.cache[name])
    } else {
      // console.log('Miss:', name)
      request.get(`${this.registryUrl}/${escapedName}`).end((err, res) => {
        if(err || res.statusCode < 200 || res.statusCode >= 400){
          const message = res ? `Status: ${res.statusCode}` : `Error: ${err.message}`;

          console.log(`Could not load ${name}`);
          console.log(message);

          return cb(true);
        }

        this.cache[name] = res.body;

        cb(false, this.cache[name]);
      });
    }
  }

  batchFetch(keys, cb){
    const fetchKeys = keys.filter(key => !this.cache.hasOwnProperty(key) && this.fetching.indexOf(key) === -1);

    if(fetchKeys.length){
      this.fetching = this.fetching.concat(fetchKeys);
      async.parallel(fetchKeys.map((key) => {
        const escapedName = key && npa(key).escapedName;

        return done => request.get(`${this.registryUrl}/${escapedName}`).end((err, res) => {
          // if(this.cache.hasOwnProperty(key)) console.log('Double Fetch:', key)

          if(err || res.statusCode < 200 || res.statusCode >= 400){
            const message = res ? `Status: ${res.statusCode}` : `Error: ${err.message}`;

            return done();
          }

          this.cache[key] = res.body;

          done();
        });
      }), cb);
    } else {
      cb();
    }
  }
}
