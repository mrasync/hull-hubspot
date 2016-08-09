"use strict";

var _hull = require("hull");

var _hull2 = _interopRequireDefault(_hull);

var _winstonLogzio = require("winston-logzio");

var _winstonLogzio2 = _interopRequireDefault(_winstonLogzio);

var _server = require("./server");

var _server2 = _interopRequireDefault(_server);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require("dotenv").config();
// import winstonSlacker from "winston-slacker";


if (process.env.NODE_ENV === "development") _hull2.default.logger.transports.console.level = "debug";

// Post to Slack Channel directly.
// Hull.logger.add(winstonSlacker,  { webhook, channel, username, iconUrl, iconImoji, customFormatter });

if (process.env.LOGZIO_TOKEN) _hull2.default.logger.add(_winstonLogzio2.default, { token: process.env.LOGZIO_TOKEN });

(0, _server2.default)({
  Hull: _hull2.default,
  clientID: process.env.HUBSPOT_CLIENT_ID,
  clientSecret: process.env.HUBSPOT_CLIENT_SECRET,
  hostSecret: process.env.SECRET || "1234",
  devMode: process.env.NODE_ENV === "development",
  port: process.env.PORT || 8082
});