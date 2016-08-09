"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (_ref, _ref2, _ref3) {
  var clientID = _ref.clientID;
  var clientSecret = _ref.clientSecret;
  var _ref2$message = _ref2.message;
  var message = _ref2$message === undefined ? {} : _ref2$message;
  var _ref3$hull = _ref3.hull;
  var hull = _ref3$hull === undefined ? {} : _ref3$hull;
  var _ref3$ship = _ref3.ship;
  var ship = _ref3$ship === undefined ? {} : _ref3$ship;

  var hubspot = new _hubspot2.default({ clientID: clientID, clientSecret: clientSecret, ship: ship, hull: hull });
  hubspot.syncHullGroup();
  return true;
};

var _hubspot = require("./lib/hubspot");

var _hubspot2 = _interopRequireDefault(_hubspot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }