var firebaseTools = require('firebase-tools');

function deployFirebase(config) {
    var cwd = config.cwd, project = config.project, token = config.token;
    process.chdir(cwd);
    return firebaseTools.deploy({
        project: project,
        token: token,
        cwd: cwd
    });
}

exports.deployFirebase = deployFirebase;
//# sourceMappingURL=hyperdeploy.js.map
