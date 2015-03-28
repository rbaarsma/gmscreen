var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var express = require('express');
var expressLess = require('express-less');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var passport = require('passport')
//    , FacebookStrategy = require('passport-facebook').Strategy;
    , OpenIDStrategy = require('passport-openid').Strategy;

var routes = require('./routes/index');
var npcs = require('./routes/npcs');
var spells = require('./routes/spells');

var User = require('./models/user');

var WEB_ADDRESS = 'http://localhost:3000';

//var FACEBOOK_APP_ID = '1020303194650999',
//    FACEBOOK_APP_SECRET = '3775bd494d0a0902e3a0847b82d7775c';

// connect to mongodb
mongoose.connect('mongodb://localhost/gm', function(err, next) {
    if(err) return next(err);
    console.log('database connected');
});

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(cookieParser);

app.use(session({
    secret: 'mysecret (should live in separate file outside git)',
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));

//app.use(session({ secret: 'keyboard cat' }));
app.use(passport.initialize());
app.use(passport.session());

passport.use(new OpenIDStrategy({
        returnURL: WEB_ADDRESS+'/auth/openid/return',
        realm: WEB_ADDRESS+'/'
        //profile: true
    },
    function(identifier, done) {
        var User = require('./models/user.js');

        User.findOne({ openId: identifier }, function (err, user) {
            if (err) return done(err, null);

            console.log('user found: ');
            console.log(user);

            // for now we don't have a registration, so we simply make an empty
            // user on the fly and store it in our session
            if (user === null) {
                User.create({ openId: identifier }, function (err, user) {
                    console.log('created new user');
                    if (err) return done(err, null);

                    user.save();
                    done(null, user);
                });
            } else {
                //user.save();
            }

            done(null, user);
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

// auto-login on development (so I can develop offline)
if (app.get('env') == 'development') {
    app.use(function (req, res, next) {
        req.user = {_id: '550ab20adacd0ae9f08d4028'};
        next();
    });
}

//app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use('/less', expressLess(path.join(__dirname, '/less'), {debug: app.get('env') == 'development', compress: app.get('env') != 'development'}));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(path.join(__dirname, '/bower_components')));
app.use('/fonts',  express.static(path.join(__dirname, '/bower_components/bootstrap/fonts')));

// OpenID routes
app.post('/auth/openid', passport.authenticate('openid'));
app.get('/auth/openid/return', passport.authenticate('openid', { successRedirect: '/', failureRedirect: '/login' }));

// gm routes
app.use('/', routes);
app.use('/npcs', npcs);
app.use('/spells', spells);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
