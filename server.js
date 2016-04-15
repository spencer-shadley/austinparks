#!/bin/env node
var express = require('express');
var fs      = require('fs');
var request = require('request');

var poolData;
var PoolApp = function() {

    var self = this;

    self.setupVariables = function() {
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 8080;

        if (typeof self.ipaddress === "undefined") {
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            self.ipaddress = "127.0.0.1";
        }
    };

    /** Populate the cache **/
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' };
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./index.html');
    };
    self.cache_get = function(key) { return self.zcache[key]; };

    /** Handle server termination **/
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       new Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', new Date(Date.now()) );
    };
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element) {
            process.on(element, function() { self.terminator(element); });
        });
    };

    /** Routing table entries and handlers **/
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
            res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('index.html') );
        };
    };

    /** Initialize server **/
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();

        self.app.use(express.static(__dirname + '/'));

        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            //noinspection JSUnfilteredForInLoop
            self.app.get(r, self.routes[r]);
        }
    };
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();
        self.initializeServer();

        // parse JSON
        request(poolDataUrl, function(err, pools, body) {
            if(err)                          console.err(err);
            else if(pools.statusCode != 200) console.err(pools.statusCode + ' in pool request');
            else {
                poolData = JSON.parse(body);
            }
        });
    };

    /** Start the server **/
    self.start = function() {
        self.app.listen(self.port, self.ipaddress, function() {
            console.log('%s: Node server started on %s:%d ...',
                        new Date(Date.now() ), self.ipaddress, self.port);
        });
    };
};

/** JSON stuff **/
var poolDataUrl = "https://data.austintexas.gov/resource/jfqh-bqzu.json";

var poolApp = new PoolApp();
poolApp.initialize();
poolApp.start();

poolApp.app.get('/poolnames', function(req, res) {
    var poolNames = [];
    poolData.forEach(function(pool) {
        poolNames.push(pool.pool_name);
    });
    res.send(poolNames);
});

poolApp.app.get('/pooldata/:poolname', function(req, res) {
    poolData.forEach(function(pool) {
        if(pool.pool_name === req.params.poolname)
            res.json(pool);
    });
});