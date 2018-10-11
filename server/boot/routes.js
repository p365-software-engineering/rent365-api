'use strict';

module.exports = function(app) {

    const router = app.loopback.Router();
    const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;

    router.get('/cookie', ensureLoggedIn('/login'), function(req, res) {
        console.log('Signed Cookies: ', req.signedCookies)
        res.send('cookie');
    });

    // TODO: Need to hangle oAuth vs regular
    router.get('/login', function(req, res, next) {
        console.log('unauthenticated');
        res.send('unauthenticated');
    });

    router.get('/logout', function(req, res, next) {
        console.log('logging out');
        req.logout();
        // TODo: need and need to nest ???
        req.session.destroy();
        res.redirect('/');
    });

    // TODO: Depends on if oAuth or not
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
