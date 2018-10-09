'use strict';

const loopback = require('loopback');
const boot = require('loopback-boot');
const app = module.exports = loopback();
const session = require('express-session');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
// const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

////////////////////////////////
//      Middle-Ware           //
////////////////////////////////

// to support JSON-encoded bodies
app.middleware('parse', bodyParser.json());
// to support URL-encoded bodies
app.middleware('parse', bodyParser.urlencoded({
  extended: true,
}));

// attempt to build the providers/passport config
let config = {};
try {
  config = require('../providers.json');
} catch (err) {
  console.trace(err);
  process.exit(1); // fatal
}


// Set the sesssion
app.middleware('session:before', cookieParser('cookieSecret'));
app.middleware('session', session({
  secret: 'this-is-a-secret-token',
  saveUninitialized: true,
  resave: true,
  cookie: { maxAge: 100000 }
}));
// app.use(session({ secret: 'this-is-a-secret-token', }));


app.start = function() {
  // start the web server
  return app.listen(function() {
    app.emit('started');
    const baseUrl = app.get('url').replace(/\/$/, '');
    console.log('Web server listening at: %s', baseUrl);
    if (app.get('loopback-component-explorer')) {
      // console.log(process.env.PORT);
      // const explorerPath = app.get('loopback-component-explorer').mountPath;
      // console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
    }
  });
};

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
boot(app, __dirname, function(err) {
  if (err) throw err;

  // start the server if `$ node server.js`
  if (require.main === module)
    app.start();
});


// The access token is only available after boot
app.middleware('auth', loopback.token({
  model: app.models.accessToken,
  currentUserLiteral: 'me',
  // cookies: ['access_token'],
  // headers: ['access_token', 'X-Access-Token'],
  // params: ['access_token']
}));



////////////////////////////////
//      Passport              //
////////////////////////////////

// Passport configurators..
const loopbackPassport = require('loopback-component-passport');
const PassportConfigurator = loopbackPassport.PassportConfigurator;
const passportConfigurator = new PassportConfigurator(app);

// Passport Setup
passportConfigurator.init();
passportConfigurator.setupModels({
  // TODO: check user
  userModel: app.models.user,
  userIdentityModel: app.models.userIdentity,
  userCredentialModel: app.models.userCredential,
});

for (const iter in config) {
  const provider = config[iter];
  provider.session = provider.session !== false;
  passportConfigurator.configureProvider(iter, provider);
}