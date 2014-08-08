// config/passport.js
// Creating the Strategies
var LocalStrategy   = require('passport-local').Strategy;

// load all the things we need
var bcrypt = require('bcrypt');
var cradle = require('cradle');
var configDB = require('./database.js')

// Setting up connection with the Cloudant Database
var connection = new(cradle.Connection)(configDB.url, 443, {
    auth: { username: "hichformortheyessiodortl", password: "mB6kATWcCytgH57T1wPiehVn"}
});
var db = connection.database('homeguard_users');
// expose this function to our app using module.exports
module.exports = function(passport) {

    // =========================================================================
    // passport session setup ==================================================
    // =========================================================================
    // required for persistent login sessions
    // passport needs ability to serialize and unserialize users out of session

    // used to serialize the user for the session
    passport.serializeUser(function(user, done) {
        console.log(user);
        done(null, user.id);
    });

    // used to deserialize the user
    passport.deserializeUser(function(id, done) {
        db.get(id, function (err, user){
            done(err, user);
        });
    });


 	// =========================================================================
    // LOCAL SIGNUP ============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

    passport.use('local-signup', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) {

        // asynchronous
        // User.findOne wont fire unless data is sent back
        process.nextTick(function() {

            var first_name = req.body.first_name;
            var last_name = req.body.last_name;
            var sex = req.body.sex;
            db.get(email, function (err, user){
                if(user){
                    return done(null, false, req.flash('signupMessage', 'That email is already taken.'));
                }else{
                    bcrypt.hash(password, 10, function (err, hash){
                        db.save(email, {
                            password: hash,
                            first_name: first_name,
                            last_name: last_name,
                            sex: sex
                        });
                        setTimeout(function (){
                            db.get(email, function (err, doc){
                                console.log("newUser: "+doc);
                                return done(null, doc);
                            });    
                        }, 100); 
                    });
                }
            });

        });

    }));
    
    // =========================================================================
    // LOCAL LOGIN =============================================================
    // =========================================================================
    // we are using named strategies since we have one for login and one for signup
    // by default, if there was no name, it would just be called 'local'

    passport.use('local-login', new LocalStrategy({
        // by default, local strategy uses username and password, we will override with email
        usernameField : 'email',
        passwordField : 'password',

        passReqToCallback : true // allows us to pass back the entire request to the callback
    },
    function(req, email, password, done) { // callback with email and password from our form

        // find a user whose email is the same as the forms email
        // we are checking to see if the user trying to login already exists
        db.get(email.toString(), function (err, user){
            if (!user)
                return done(null, false, req.flash('loginMessage', 'No user found.'));
            

            bcrypt.compare(password, user.password, function (err, res){
                if(res)
                    return done(null, user);
                else
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
            });
        });

    }));

};
