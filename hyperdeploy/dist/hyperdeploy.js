var firebaseTools = require('firebase-tools');

function firebaseDeploy(config) {
    var cwd = config.cwd, project = config.project, token = config.token;
    process.chdir(cwd);
    return firebaseTools.deploy({
        project: project,
        token: token,
        cwd: cwd
    });
}

exports.firebaseDeploy = firebaseDeploy;
//# sourceMappingURL=hyperdeploy.js.map
