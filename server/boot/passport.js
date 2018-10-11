'use strict';

module.exports = function(app) {

    const router = app.loopback.Router();
    const strategies = require('../../strategies.json');
    const AppUser = app.models.appUser;
    const UserIdentityModel = app.models.userIdentity;
    const passport = require('passport');
    const utils = require('../utils');

    // TODO: change to user.id
    passport.serializeUser(function(user, cb) {
        cb(null, user);
    });
      
    // TODO: change to user.id
    passport.deserializeUser(function(obj, cb) {
        cb(null, obj);
        // User.findById(id).then(user => {
        //     done(err, user);
        // });
    });

    const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
    passport.use(new GoogleStrategy({
        tokenURL        : strategies.googleAuth.tokenURL,
        clientID        : strategies.googleAuth.clientID,
        clientSecret    : strategies.googleAuth.clientSecret,
        callbackURL     : strategies.googleAuth.callbackURL,
        passReqToCallback: true
    }, (req, accessToken, refreshToken, profile, done) => {

        var provider = 'google';
        var authSchema = 'oAuth 2.0';
        var credentials = {};
        credentials.externalId = profile.id;
        credentials.refreshToken = refreshToken;

        UserIdentityModel.login(provider, authSchema, profile, credentials, 
            {autoLogin:true}, function(err, loopbackUser, identity, token) {
                req.accessToken = token;
                const email = profile.emails[0].value;
                process.nextTick(function() {
                    AppUser.findOne({ where: { email: email } }).then((existingUser) => {
                        if (existingUser) {
                            existingUser.token = token;
                            console.log('existingUser');
                            done(null, existingUser);
                        } else {
                            console.log('there is no existingUser');
                            const newUser        = new AppUser();
                            newUser.token = token;
                            // TODO: need ID ???
                            // TODO: need auth provide type??
                            newUser.email           = newUser.google.email;
                            newUser.firstname       = profile.name.givenName;
                            newUser.lastname        = profile.name.familyName;
                            newUser.password        = utils.generateKey('hashcash');
                            // Google info
                            newUser.google          = {};
                            newUser.google.id       = profile.id;
                            newUser.google.token    = accessToken;
                            newUser.google.name     = profile.displayName;
                            newUser.google.email    = profile.emails[0].value; // pull only the first email
                            newUser.save(function(err) {
                                if (err) throw err;
                                done(null, newUser);
                            });
                    }
                });
            });
        });
    }));

    router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    router.get('/auth/google/callback', 
        passport.authenticate('google', { 
            failureRedirect: '/login' 
        }),
        function(req, res) {
            const accessToken = req.accessToken;
            // console.log(req.session.passport.user);
            res.cookie('accessToken', accessToken, { signed: true , maxAge: 300000, httpOnly:true });
            res.redirect('/cookie');
        }
    );

    app.use(router);
}