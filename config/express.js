/**
 * Module dependencies.
 */
var express = require('express'),
    mongoStore = require('connect-mongo')(express),
    flash = require('connect-flash'),
    helpers = require('view-helpers'),
    // cors = require('cors'),
    config = require('./config');

// simplified CSRF version does away with this csrfValue
// CSRF error appears during POST operations and not during GET


var csrfValue = function(req) {
  var token = (req.body && req.body._csrf) || (req.query && req.csrfToken()) || (req.headers['x-csrf-token']) || (req.headers['x-xsrf-token']);
  return token;
};

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type');

    next();
};


module.exports = function(app, passport) {
    app.set('showStackError', true);

    //Should be placed before express.static
    app.use(express.compress({
        filter: function(req, res) {
            return (/json|text|javascript|css/).test(res.getHeader('Content-Type'));
        },
        level: 9
    }));

    //Setting the fav icon and static folder
    app.use(express.favicon(config.root + '/public/img/icons/favicon.ico'));
    //app.use(express.favicon());
    app.use(express.static(config.root + '/public'));
    app.use('/lib', express.static(config.root + '/app/components'));

    //Don't use logger for test env
    if (process.env.NODE_ENV !== 'test') {
        app.use(express.logger('dev'));
    }

    //Set views path, template engine and default layout
    app.set('views', config.root + '/app/views');
    app.set('view engine', 'jade');

    //Enable jsonp
    app.enable("jsonp callback");

    app.configure(function() {
        //bodyParser should be above methodOverride
        // app.use(express.bodyParser()); replaced by the next two lines

        app.use(express.json());
        app.use(express.urlencoded());

        app.use(express.methodOverride());

        //cookieParser should be above session
        app.use(express.cookieParser('your secret here'));
        app.use(express.cookieSession());

        //bodyParser should be before express.csrf
        // more complicated version, saves cookies
        app.use(express.csrf({value: csrfValue}));
        app.use(function(req, res, next) {
          res.cookie('XSRF-TOKEN', req.csrfToken());
          res.locals.token = req.csrfToken();
          next();
        });

        //enable CORS requests
        //app.use(cors());

        //app.use(allowCrossDomain);
        app.use(function(req, res, next) {
            var oneof = false;
            if(req.headers.origin) {
                console.log('Req.Headers.Origin ' + req.headers.origin);

                res.header('Access-Control-Allow-Origin', req.headers.origin);
                oneof = true;
            }
            if(req.headers['access-control-request-method']) {
                res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
                oneof = true;
            }
            if(req.headers['access-control-request-headers']) {
                res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
                oneof = true;
            }
            if(oneof) {
                res.header('Access-Control-Max-Age', 60 * 60 * 24 * 365);
            }

            // intercept OPTIONS method
            if (oneof && req.method == 'OPTIONS') {
                res.send(200);
            }
            else {
                next();
            }
        });


        //express/mongo session storage
        app.use(express.session({
            secret: 'MEAN',
            store: new mongoStore({
                url: config.db,
                collection: 'sessions'
            })
        }));

        //connect flash for flash messages
        app.use(flash());

        //dynamic helpers
        app.use(helpers(config.app.name));

        //use passport session
        app.use(passport.initialize());
        app.use(passport.session());

        //routes should be at the last
        app.use(app.router);

        //Assume "not found" in the error msgs is a 404. this is somewhat silly,
        // but valid, you can do whatever you like, set properties, use instanceof etc.

        app.use(function(err, req, res, next) {
            //Treat as 404
            if (~err.message.indexOf('not found')) return next();

            //Log it
            console.error(err.stack);

            //Error page
            res.status(500).render('500', {
                error: err.stack
            });
        });

        //Assume 404 since no middleware responded
        app.use(function(req, res, next) {
            res.status(404).render('404', {
                url: req.originalUrl,
                error: 'Not found'
            });
        });

    });
};
