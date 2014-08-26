var auth = require('http-auth');
var fs = require('fs');
var read = require('read');
var bcrypt = require('bcryptjs');


var basic = auth.basic({
  realm: "Cozy Light"
  }, function (username, password, callback) {
    bcrypt.compare(password, module.exports.hash, function(err, res) {
      callback(username === "me" && res);
    });
  }
);


var setPassword = function() {
  var config = module.exports.config;
  var configPath = module.exports.configPath;
  var promptMsg = 'Set your new Password: ';
  read({ prompt: promptMsg, silent: true }, function(err, password) {
    var salt = bcrypt.genSaltSync(10);
    module.exports.hash = bcrypt.hashSync(password, salt);
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
