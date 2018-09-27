'use strict';

module.exports = function(app) {

    const router = app.loopback.Router();

    const strategies = require('../../strategies.json');

    const AppUser = app.models.appUser;

    const passport = require('passport');
    const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
    passport.use(new GoogleStrategy({
        clientID        : strategies.googleAuth.clientID,
        clientSecret    : strategies.googleAuth.clientSecret,
        callbackURL     : strategies.googleAuth.callbackURL,
    }, (accessToken, refreshToken, profile, done) => {
        console.log(accessToken);
        console.log(refreshToken);
        console.log(profile);
        done(null)
        // User.findOne({ googleId: profile.id }).then((existingUser) => {
        //         if (existingUser) {
        //         // don't create a new user
        //         done(null, existingUser);

        //         } else {
        //         // create a new user    
        //         new User ({ googleId: profile.id }).save()
        //         .then(user => (null, user));

        //         }
        //     })
    }));

    router.get('/auth/google', passport.authenticate('google', { scope : ['profile', 'email'] }));

    router.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect : '/',
            failureRedirect : '/'
    }));

    router.get('/login', function(req, res, next) {

        // send back the token from appUsers/getToken
        // const user = {
        //     "email": "tcitrin@iu.edu",
        //     "password": "tyler"
        // }
        const user = req.user;
        // {
            //   email: req.body.email,
            //   accessToken: token.id
        // }

        AppUser.login(user, 'appUser', function(err, token) {
            if (err) {
              res.render('response', { //render view named 'response.ejs'
                title: 'Login failed',
                content: err,
                redirectTo: '/',
                redirectToLinkText: 'Try again'
              });
              return;
            }
        
            // res.render('home', { //login user and render 'home' view
            //   email: req.body.email,
            //   accessToken: token.id
            // });
            res.send(token.id);
          });
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