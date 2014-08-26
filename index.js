var fs = require('fs');
var read = require('read');
var bcrypt = require('bcryptjs');
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');


passport.use(new LocalStrategy(
  function(username, password, callback) {
    bcrypt.compare(password, module.exports.hash, function(err, res) {
      callback(res);
    });
  }
));

passport.serializeUser(function(user, done) {
  done(null, 'config');
});

passport.deserializeUser(function(id, done) {
  done(err, module.exports.config);
});

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
  app.use(cookieParser(randomstring.generate());
  app.use(cookieSession({
    secret: randomstring.generate(),
    maxage: 1000 * 60 * 60 * 24 * 7
  });
  app.use(passport.initialize());
  app.use(passport.session());
  app.use(function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/login");
    }
  });

  app.get('/login', function (req, res, next) {
    res.send('
<html>
<head>
  <title>Cozy Light Log In</title>
</head>
<body> \
  <p>Please give your password to log in:</p> \
  <form action="/login" method="post"> \
    <div> \
        <label>Password:</label> \
        <input type="password" name="password"/> \
    </div> \
    <div> \
        <input type="submit" value="Log In"/> \
    </div> \
  </form> \
</body>
</html>
    ');
  });

  app.post('/login',
    passport.authenticate('local', { successRedirect: '/',
                                     failureRedirect: '/login',
                                     failureFlash: true });

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
