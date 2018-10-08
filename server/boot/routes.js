'use strict';

module.exports = function(app) {

    const router = app.loopback.Router();
    const strategies = require('../../strategies.json');
    const AppUser = app.models.appUser;
    const UserIdentityModel = app.models.userIdentity;
    const passport = require('passport');
    const utils = require('../utils');
    const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

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
                if(err) throw err;
                /* 
                    Seemingly meaningless user info:
                    { username: 'google.109898432929999337239',
                        password:
                        '$2a$10$QRRJr6YT0/8bswpwP5aSpOnxtqahFlXnfU7PSDeccTf5Is3dnu8Vi',
                        email: '109898432929999337239@loopback.google.com',
                        id: 12 }
                */
                console.log(loopbackUser);

                /** All info from provider 
                 * { provider: 'google',
                         authScheme: 'oAuth 2.0',
                        externalId: '109898432929999337239',
                        profile:
                        { id: '109898432929999337239',
                            displayName: 'Tyler Citrin',
                            name: { familyName: 'Citrin', givenName: 'Tyler' },
                    .... */
                console.log(identity);


                /*
                    { created: 2018-10-08T02:54:42.816Z,
                    ttl: 1209600,
                    userId: 12,
                    id:
                    'lhbcENnodEq28msURQVBVxrxMqnEIn6mnrmttxZmAN3K4Cu7DOdZ7skf033H8iBD' }
                    */
                console.log(token);
                done(null, profile)
          });


        // profile.accessToken = accessToken;
        // AppUser.findOne({ googleId: profile.id }).then((existingUser) => {
        //     if (existingUser) {
        //         console.log('existingUser');
        //         console.log(existingUser);
        //         req.login(existingUser, () => done(null, profile));
        //     } else {
        //         console.log('newUser');
        //         const newUser        = new AppUser();
        //         // TODO: need ID ... 
        //         newUser.google       = {};
        //         newUser.google.id    = profile.id;
        //         newUser.google.token = accessToken;
        //         newUser.google.name  = profile.displayName;
        //         newUser.google.email = profile.emails[0].value; // pull only the first email
        //         newUser.email = newUser.google.email;
        //         newUser.name  = profile.displayName;
        //         newUser.password = utils.generateKey('hashcash');
        //         newUser.save(function(err) {
        //             if (err) throw err;
        //             req.login(newUser, () => done(null, profile));
        //         });
        //     }
        // });
    }));

    router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    router.get('/auth/google/callback', 
        passport.authenticate('google', { 
            failureRedirect: '/login' 
        }),
        function(req, res) {
            const accessToken = req.user.accessToken;
            res.cookie('accessToken', accessToken, { signed: true , maxAge: 300000, httpOnly:true });
            res.redirect('/cookie');
        }
    );

    router.get('/cookie', ensureLoggedIn('/login'), function(req, res) {
        // console.log('Cookies: ', req.cookies)
        console.log('Signed Cookies: ', req.signedCookies)
        console.log(req.session);
        res.send('cookie');
    });

    router.get('/login', function(req, res, next) {
        console.log('unauthenticated');
        res.send('unauthenticated');

        // AppUser.login(user, 'appUser', function(err, token) {
        //     if (err) {
        //       res.render('response', { //render view named 'response.ejs'
        //         title: 'Login failed',
        //         content: err,
        //         redirectTo: '/',
        //         redirectToLinkText: 'Try again'
        //       });
        //       return;
        //     }        
    });

    router.post('/signup', function(req, res, next) {
        
        const AppUser = app.models.appUser;
        const newUser = {};
        newUser.email = req.body.email.toLowerCase();
        newUser.username = req.body.username.trim();
        newUser.password = req.body.password;
        
        console.log(newUser);

        // AppUser.create(newUser, function(err, user) {
        //   if (err) {
        //     req.flash('error', err.message);
        //     return res.redirect('back');
        //   } else {
        //     // Passport exposes a login() function on req (also aliased as logIn())
        //     // that can be used to establish a login session. This function is
        //     // primarily used when users sign up, during which req.login() can
        //     // be invoked to log in the newly registered user.
        //     req.login(user, function(err) {
        //       if (err) {
        //         req.flash('error', err.message);
        //         return res.redirect('back');
        //       }
        //       return res.redirect('/auth/account');
        //     });
        //   }
        // });
    });  
    
    app.use(router);
}