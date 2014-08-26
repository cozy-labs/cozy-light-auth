var auth = require('http-auth');
var fs = require('fs');
var read = require('read');
var passwordHash = require('password-hash');


var basic = auth.basic({
  realm: "Cozy Light"
  }, function (username, password, callback) {
    callback(username === "me"
             && passwordHash.verify(password, module.exports.hashedPassword));
  }
);


var setPassword = function() {
  var config = module.exports.config;
  var configPath = module.exports.configPath;
  var promptMsg = 'Set your new Password: ';
  read({ prompt: promptMsg, silent: true }, function(err, password) {
    module.exports.hashedPassword = passwordHash.generate(password);
    config.password = module.exports.hashedPassword;
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Password properly stored');
  });
}


module.exports.configureAppServer = function(app, config, routes, callback) {
  app.use(auth.connect(basic));
  callback();
};


module.exports.configure = function(options, config, program) {
  module.exports.config = config;
  module.exports.configPath = options.config_path;
  module.exports.hashedPassword = config.password;

  program
    .command('set-password')
    .description(
        'Set basic password for the current Cozy Light instance (username ' +
        'is always me)')
    .action(setPassword);
};
