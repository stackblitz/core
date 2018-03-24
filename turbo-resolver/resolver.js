const async = require('async');
const semver = require('semver');
const { Graph } = require('graphlib');
const NpmHttpRegistry = require('./registries/npm-http');
const packageJsonProps = ['main', 'browser', 'module', 'types', 'typings', 'js:next', 'unpkg'];

module.exports = class Resolver {
  constructor(options){
    Object.assign(this, {
      validatePeers: true,
      registry: new NpmHttpRegistry(),
      packageJsonProps,
      timeout: 10000,
      concurrency: 4
    }, options);

    this.graph = new Graph();
    this.invalidPeers = {};
    this.missingPeers = {};
    this.requestedPeers = {};
    this.jpack = {
      appDependencies: {},
      resDependencies: {},
      warnings: {}
    };
    this.error = null;
    this.queue = async.queue((task, done) => {
      if(Date.now() - this.startTime > this.timeout || this.error){
        if(!this.error){
          this.error = { error: 'TIMEOUT' };
        }
        return done();
      }

      this.loadRegistryPackage(task, done);
    }, this.concurrency);


    this.queue.pause();
  }

  loadRegistryPackage(task, done){
    const name = task.name;

    this.registry.fetch(name, (err, registryPackage) => {
      if(err){
        this.error = {
          error: 'PACKAGE_NOT_FOUND',
          data: { name }
        };

        return done();
      }

      this.resolveDependencies(task, registryPackage, done);
    });
  }

  // Resolution & Iteration
  resolveDependencies(task, registryPackage, done){
    const version = this.resolveVersion(task.version, registryPackage);

    if(this.error || !version) { return done(); }

    const fullName = `${registryPackage.name}@${version}`;
    const versionPackageJson = registryPackage.versions[version];
    const isRootDependency = task.parentNode === 'root';
    const subDepsResolved = this.graph.hasNode(fullName);

    if(isRootDependency){
      this.graph.setNode(registryPackage.name, { version, fullName });
      this.graph.setNode(fullName);
      this.graph.setEdge(task.parentNode, registryPackage.name);
    } else {
      this.graph.setEdge(task.parentNode, fullName);
    }

    if(subDepsResolved){ return done(); }

    const dependencies = Object.assign({}, versionPackageJson.dependencies,
      isRootDependency ? {}  : versionPackageJson.peerDependencies
    );

    if(isRootDependency && versionPackageJson.hasOwnProperty('peerDependencies') && Object.keys(versionPackageJson.peerDependencies).length){
      this.requestedPeers[fullName] = Object.assign({}, versionPackageJson.peerDependencies);
      Object.keys(versionPackageJson.peerDependencies).forEach(peerName => this.graph.setEdge(fullName, peerName));
    }

    const depNames = Object.keys(dependencies);

    this.registry.batchFetch(depNames, () => {
      depNames.forEach(name => this.queue.push({
        name,
        version: dependencies[name],
        parentNode: fullName
      }));

      done();
    });
  }

  resolveVersion(requestedVersion, registryPackage){
    if(registryPackage['dist-tags'] && registryPackage['dist-tags'].hasOwnProperty(requestedVersion)){
      return registryPackage['dist-tags'][requestedVersion];
    }

    const availableVersions = Object.keys(registryPackage.versions || {});

    if(requestedVersion === ''){
      requestedVersion = '*';
    }

    let version = semver.maxSatisfying(availableVersions, requestedVersion, true);

    if(!version && requestedVersion === '*' && availableVersions.every(availableVersion => !!semver(availableVersion, true).prerelease.length)){
      version = registryPackage['dist-tags'] && registryPackage['dist-tags'].latest;
    }

    if(!version){
      this.error = {
        error: 'UNSATISFIED_RANGE',
        data: { name: registryPackage.name, range: requestedVersion }
      };
    } else {
      return version;
    }
  }

  validatePeerDependencies(){
    const topDeps = this.graph.successors('root');

    Object.keys(this.requestedPeers).forEach(fullName => {
      const peers = this.requestedPeers[fullName];

      Object.keys(peers).forEach(peerName => {
        const requestedPeerVersion = peers[peerName];

        if(!topDeps.some(name => name === peerName)){
          if(!this.missingPeers[peerName]){
            this.missingPeers[peerName] = {};
          }

          this.missingPeers[peerName][fullName] = requestedPeerVersion;
        } else if(!semver.satisfies(this.graph.node(peerName).version, requestedPeerVersion)){
          if(!this.invalidPeers[fullName]){
            this.invalidPeers[fullName] = {};
          }

          this.invalidPeers[fullName][peerName] = requestedPeerVersion;
        }
      });
    });

    if(Object.keys(this.missingPeers).length){
      this.error = {
        error: 'MISSING_PEERS',
        data: this.missingPeers
      };
    }
  }

  // Jpack Rendering
  fillJpackDep(fullName, versionPkg, dep){
    this.graph.successors(fullName).forEach(name => {
      if(name.substr(1).indexOf('@') === -1){ // dependency is a peer
        const peerDep = this.graph.node(name);

        if(peerDep){
          dep.dependencies[name] = `${name}@${peerDep.version}`;
        }
      } else {
        dep.dependencies[name.substr(0, name.lastIndexOf('@'))] = name;
        this.addJpackResDep(name);
      }
    });

    if(versionPkg){
      this.packageJsonProps.forEach(prop => {
        if(versionPkg.hasOwnProperty(prop)){
          dep[prop] = versionPkg[prop];
        }
      });
    }
  }

  addJpackResDep(fullName){
    if(!this.jpack.resDependencies.hasOwnProperty(fullName)){
      // TODO: encode this information in nodes instead of using string ops
      const atIndex = fullName.lastIndexOf('@');

      if(atIndex <= 0){ // No '@' in string, or only '@' is first character (dependency is a peer)
        this.fillJpackDep(fullName, null, this.jpack.appDependencies[fullName])
      } else {
        const depName = fullName.substr(0, atIndex);
        const version = fullName.substr(atIndex + 1);
        const versionPkg = this.registry.cache[depName].versions[version];
        const resDep = this.jpack.resDependencies[fullName] = { dependencies: {} };

        this.fillJpackDep(fullName, versionPkg, resDep);
      }
    }
  }

  renderJpack(){
    this.graph.successors('root').forEach(depName => {
      const { version, fullName } = this.graph.node(depName);
      const versionPkg = this.registry.cache[depName].versions[version];
      const appDep = this.jpack.appDependencies[depName] = { version, dependencies: {} };

      this.fillJpackDep(fullName, versionPkg, appDep);
    });

    if(Object.keys(this.invalidPeers).length){
      this.jpack.warnings.invalidPeers = this.invalidPeers;
    }
  }

  resolve(dependencies){
    return new Promise((resolve, reject) => {
      const depNames = Object.keys(dependencies);

      if(depNames.length === 0){
        return resolve(this.jpack);
      }

      depNames.forEach(name => this.queue.push({
        name,
        version: dependencies[name],
        parentNode: 'root'
      }));

      this.queue.drain = () => {
        if(this.error){
          return reject(this.error);
        }

        if(this.validatePeers){
          this.validatePeerDependencies();
        }

        if(this.error){
          return reject(this.error);
        } else {
          this.renderJpack();

          return resolve(this.jpack);
        }
      };

      this.startTime = Date.now();
      this.registry.batchFetch(depNames, this.queue.resume);
    });
  }
};
