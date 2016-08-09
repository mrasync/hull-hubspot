"use strict";

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _express = require("express");

var _express2 = _interopRequireDefault(_express);

var _path = require("path");

var _path2 = _interopRequireDefault(_path);

var _ejs = require("ejs");

var _passportHubspot = require("passport-hubspot");

var _updateUser = require("./update-user");

var _updateUser2 = _interopRequireDefault(_updateUser);

var _updateSegment = require("./update-segment");

var _updateSegment2 = _interopRequireDefault(_updateSegment);

var _updateShip = require("./update-ship");

var _updateShip2 = _interopRequireDefault(_updateShip);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function save(hull, ship, settings) {
  return hull.put(ship.id, {
    private_settings: _extends({}, ship.private_settings, settings)
  });
}
module.exports = function Server() {
  var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var port = /* , devMode: dev */options.port;
  var hostSecret = options.hostSecret;
  var clientID = options.clientID;
  var clientSecret = options.clientSecret;
  var Hull = options.Hull;
  var NotifHandler = Hull.NotifHandler;
  var OAuthHandler = Hull.OAuthHandler;
  var Routes = Hull.Routes;
  var Readme = Routes.Readme;
  var Manifest = Routes.Manifest;


  var app = (0, _express2.default)();

  app.set("views", __dirname + "/../views");
  app.set("view engine", "ejs");
  app.engine("html", _ejs.renderFile);
  app.use(_express2.default.static(_path2.default.resolve(__dirname, "..", "dist")));
  app.use(_express2.default.static(_path2.default.resolve(__dirname, "..", "assets")));

  app.use("/auth", OAuthHandler({
    hostSecret: hostSecret,
    name: "Hubspot",
    Strategy: _passportHubspot.Strategy,
    options: {
      clientID: clientID,
      clientSecret: clientSecret,
      scope: ["offline", "contacts-rw", "events-rw"],
      skipUserProfile: true
    },
    isSetup: function isSetup(req, _ref) {
      var /* hull,*/ship = _ref.ship;

      return Promise.reject();
      if (!!req.query.reset) return Promise.reject();

      var _ref2 = ship.private_settings || {};

      var token = _ref2.token;

      return !!token ? Promise.resolve() : Promise.reject();
    },

    onLogin: function onLogin(req, _ref3) {
      var hull = _ref3.hull;
      var ship = _ref3.ship;

      req.authParams = _extends({}, req.body, req.query);
      return save(hull, ship, {
        portalId: req.authParams.portalId
      });
    },
    onAuthorize: function onAuthorize(req, _ref4) {
      var hull = _ref4.hull;
      var ship = _ref4.ship;

      var _ref5 = req.account || {};

      var refreshToken = _ref5.refreshToken;
      var accessToken = _ref5.accessToken;

      return save(hull, ship, {
        refresh_token: refreshToken,
        token: accessToken
      });
    },
    views: {
      login: "login.html",
      home: "home.html",
      failure: "failure.html",
      success: "success.html"
    }
  }));

  app.get("/manifest.json", Manifest(__dirname));
  app.get("/", Readme);
  app.get("/readme", Readme);

  app.post("/notify", NotifHandler({
    groupTraits: false,
    hostSecret: hostSecret,
    handlers: {
      "user:update": _updateUser2.default.bind(undefined, { clientID: clientID, clientSecret: clientSecret }),
      "segment:update": _updateSegment2.default.bind(undefined, { clientID: clientID, clientSecret: clientSecret }),
      "ship:update": _updateShip2.default.bind(undefined, { clientID: clientID, clientSecret: clientSecret })
    }
  }));

  app.listen(port);

  Hull.logger.info("started", { port: port });

  return app;
};