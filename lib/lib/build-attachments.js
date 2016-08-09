"use strict";

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

var _moment = require("moment");

var _moment2 = _interopRequireDefault(_moment);

var _humanize = require("./humanize");

var _humanize2 = _interopRequireDefault(_humanize);

var _flags = require("./flags");

var _flags2 = _interopRequireDefault(_flags);

var _getUserName = require("./get-user-name");

var _getUserName2 = _interopRequireDefault(_getUserName);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MOMENT_FORMAT = "MMMM Do YYYY, h:mm:ss a";

function fieldsFromObject(ob) {
  if (_lodash2.default.isArray(ob)) {
    return _lodash2.default.map(ob, function (title) {
      return { title: (0, _humanize2.default)(title), short: true };
    });
  }
  return _lodash2.default.map(ob, function (v, title) {
    var value = _lodash2.default.isBoolean(v) ? (0, _humanize2.default)(v.toString()) : v;
    value = _lodash2.default.endsWith(title, "_at") ? (0, _moment2.default)(value).format(MOMENT_FORMAT) : value;
    return { title: (0, _humanize2.default)(title), value: value, short: true };
  });
}

function colorFactory() {
  var COLORS = ["#83D586", "#49A2E1", "#FF625A", "#E57831", "#4BC2B8"];
  var i = -1;
  var l = COLORS.length;
  return function cycle() {
    i++;
    return COLORS[i % l];
  };
}

function getUserAttachment(user, color) {
  var name = (0, _getUserName2.default)(user);
  return [{
    title: ":bust_in_silhouette: " + name,
    fallback: name,
    color: color(),
    fields: [{
      value: ":love_letter: " + user.email,
      short: true
    }, {
      value: ":telephone_receiver: " + user.phone,
      short: true
    }, {
      value: (0, _flags2.default)(user.address_country) + " " + [user.address_country, user.address_state, user.address_city].join(", "),
      short: false
    }, {
      title: "First Seen",
      value: ":stopwatch: " + (0, _moment2.default)(user.first_seen_at).format(MOMENT_FORMAT),
      short: true
    }, {
      title: "Signup",
      value: ":stopwatch: " + (0, _moment2.default)(user.created_at).format(MOMENT_FORMAT),
      short: true
    }],
    footer: ":desktop_computer: " + user.sessions_count + " :eyeglasses: " + (0, _moment2.default)(user.last_seen_at).format(MOMENT_FORMAT),
    thumb_url: user.picture
  }];
}

function getChangesAttachment(changes, color) {
  return !_lodash2.default.size(changes.user) ? [] : [{
    title: ":chart_with_upwards_trend: Changes",
    color: color(),
    fallback: "Changes: " + _lodash2.default.keys(changes.user || {}).join(", "),
    fields: fieldsFromObject(_lodash2.default.mapValues(changes.user, function (v) {
      return v[0] + " → " + v[1];
    }))
  }];
}

function getTraitsAttachments(user, color) {
  return _lodash2.default.reduce(_lodash2.default.pickBy(user, _lodash2.default.isPlainObject), function (atts, value, key) {
    if (_lodash2.default.isObject(value)) {
      atts.push({
        title: ":bell: " + (0, _humanize2.default)(key),
        color: color(),
        fallback: key,
        fields: fieldsFromObject(value)
      });
    }
    return atts;
  }, []);
}

function getSegmentAttachments() {
  var changes = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
  var segments = arguments[1];
  var color = arguments[2];

  var segmentString = (_lodash2.default.map(segments, "name") || []).join(", ");
  return [{
    title: ":busts_in_silhouette: Segments",
    text: segmentString,
    fallback: "Segments: " + segmentString,
    color: color(),
    fields: _lodash2.default.map(changes.segments, function (segs, action) {
      var names = _lodash2.default.map(segs, "name");
      var emoji = ":" + (action === "left" ? "outbox" : "inbox") + "_tray:";
      return {
        title: emoji + " " + (0, _humanize2.default)(action) + " segment" + (names.length > 1 ? "s" : ""),
        value: names.join(", ")
      };
    })
  }];
}

module.exports = function buildAttachments(_ref) {
  var user = _ref.user;
  var segments = _ref.segments;
  var changes = _ref.changes;

  var color = colorFactory();
  return getUserAttachment(user, color).concat(getSegmentAttachments(changes, segments, color)).concat(getChangesAttachment(changes, color)).concat(getTraitsAttachments(user, color));
};