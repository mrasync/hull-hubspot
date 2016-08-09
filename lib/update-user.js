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
  var _message$user = message.user;
  var user = _message$user === undefined ? {} : _message$user;
  var _message$segments = message.segments;
  var segments = _message$segments === undefined ? [] : _message$segments;
  var info = hull.utils.info;


  var hubspot = new _hubspot2.default({ clientID: clientID, clientSecret: clientSecret, hull: hull, ship: ship });
  hubspot.updateUser({ user: user, segments: segments });
  console.log(ship.private_settings);
  // const properties = _.reduce(traits, (m, property) => {
  //   const value = user[property];
  //   if (value !== undefined) m.push({ property, value });
  //   return m;
  // }, [{
  //   property: "hull_segments",
  //   value: _.map(segments, "name").join(", ")
  // }]);

  info("update.process");

  return true;
};

var _hubspot = require("./lib/hubspot");

var _hubspot2 = _interopRequireDefault(_hubspot);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }