"use strict";

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _hubspot = require("hubspot");

var _hubspot2 = _interopRequireDefault(_hubspot);

var _lodash = require("lodash");

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var HULL_GROUP_DEFINITION = {
  name: "hull",
  displayName: "Hull Properties",
  displayOrder: 1
};
var HULL_SEGMENTS_PROPERTY_DEFINITION = {
  name: "hull_segments",
  label: "Hull Segments",
  description: "All the Segments the User belongs to in Hull"
};

function buildOptionHash(name, i) {
  return {
    hidden: false,
    description: null,
    value: name,
    readOnly: false,
    doubleData: 0.0,
    label: name,
    displayOrder: i
  };
}

function buildEnumProperty(_ref) {
  var label = _ref.label;
  var name = _ref.name;
  var description = _ref.description;
  var options = _ref.options;

  return {
    description: description,
    label: label,
    name: name,
    options: options,
    type: "enumeration",
    groupName: "hull",
    fieldType: "text",
    formField: false,
    displayOrder: 0,
    readOnlyValue: false,
    readOnlyDefinition: false,
    mutableDefinitionNotDeletable: false
    // calculated: false,
    // externalOptions: false,
    // displayMode: "current_value",
    // formField: true,
    // updatedUserId: 215482
  };
}

module.exports = function () {
  function Hubspot(_ref2) {
    var clientID = _ref2.clientID;
    var _ref2$ship = _ref2.ship;
    var /* clientSecret, */ship = _ref2$ship === undefined ? {} : _ref2$ship;
    var hull = _ref2.hull;

    _classCallCheck(this, Hubspot);

    var _ship$private_setting = ship.private_settings;
    var private_settings = _ship$private_setting === undefined ? {} : _ship$private_setting;
    var token = private_settings.token;
    var refresh_token = private_settings.refresh_token;
    var portal_id = private_settings.portal_id;

    this.ship = ship;
    this.token = token;
    this.refresh_token = refresh_token;
    this.portal_id = portal_id;
    this.hull = hull;
    var hubspot = new _hubspot2.default();
    this.hubspot = hubspot;

    hubspot.setAccessToken(token);
    hubspot.setRefreshToken(refresh_token);
    hubspot.setClientId(clientID);
  }

  _createClass(Hubspot, [{
    key: "refreshToken",
    value: function refreshToken() {
      var _this = this;

      return new Promise(function (resolve, reject) {
        _this.hubspot.refreshAccessToken(function (err, token) {
          if (err) return reject(err);
          _this.token = token;
          _this.hubspot.setAccessToken(token);
          return _this.saveSettings({ token: token }).then(function () {
            return resolve(token);
          });
        });
      });
    }
  }, {
    key: "saveSettings",
    value: function saveSettings() {
      var settings = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

      return this.hull.put(this.ship.id, {
        private_settings: _extends({}, this.ship.private_settings, settings)
      });
    }
  }, {
    key: "perform",
    value: function perform(obj, method) {
      for (var _len = arguments.length, args = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        args[_key - 2] = arguments[_key];
      }

      var _this2 = this;

      return new Promise(function (resolve, reject) {
        var o = _this2.hubspot[obj] || {};
        var methodCall = o[method];
        if (!methodCall) {
          reject({ error: "no such method", obj: obj, method: method });
          return;
        }
        _this2.hull.utils.info("hubspot.perform", { obj: obj, method: method });
        method.apply(undefined, args.concat([function (error, response) {
          _this2.hull.utils.info(obj + "." + method + ".response", { error: error });
          console.log(error);
          if (error) {
            // Token expired: refresh
            return _this2.refreshToken().then(method.apply(undefined, args.concat([function (err, res) {
              if (err) return reject(error);
              return resolve(res);
            }])));
          }
          return resolve(response);
        }]));
        methodCall.apply(undefined, args.concat([function (error, response /* , req */) {
          return resolve(response);
        }]));
      });
    }
  }, {
    key: "updateUser",
    value: function updateUser(_ref3) {
      var _this3 = this;

      var user = _ref3.user;
      var segments = _ref3.segments;
      var email = user.email;

      if (email) {
        var properties = [{
          property: "hull_segments",
          value: _lodash2.default.map(segments, "name").join(", ")
        }];
        return this.perform("contacts", "createOrUpdate", { properties: properties }, email).then(function (res) {
          _this3.hull.as(user.id).traits({ id: res.vid }, { source: "hubspot" });
        }, function (err) {
          return _this3.hull.logger.error("hubspot.user.update", err);
        });
      }
      return Promise.reject({ error: "no_email " });
    }
  }, {
    key: "syncHullGroup",
    value: function syncHullGroup() {
      var _this4 = this;

      var props = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];

      return Promise.all([this.getHullSegments(), this.perform("contactPropertiesGroups", "get", { includeProperties: true })]).then(function (_ref4) {
        var _ref5 = _slicedToArray(_ref4, 2);

        var _ref5$ = _ref5[0];
        var segments = _ref5$ === undefined ? [] : _ref5$;
        var hubspotGroups = _ref5[1];

        var hullHubspotGroup = _lodash2.default.find(hubspotGroups, function (g) {
          return g.name === "hull";
        });
        var hullSegmentsProp = buildEnumProperty(_extends({}, HULL_SEGMENTS_PROPERTY_DEFINITION, {
          options: _lodash2.default.map(segments, function (s, i) {
            return buildOptionHash(s.name, i);
          })
        }));
        var properties = [].concat(_toConsumableArray(props), [hullSegmentsProp]);
        if (hullHubspotGroup) {
          return _this4.perform("contactPropertiesGroups", "update", _extends({}, HULL_GROUP_DEFINITION, { properties: properties }), "hull");
        }
        return _this4.perform("contactPropertiesGroups", "create", _extends({}, HULL_GROUP_DEFINITION, { properties: properties }));
      }, function (err) {
        return _this4.hull.utils.error("hubspot.group.sync.failed", err);
      });
    }
  }, {
    key: "getHullSegments",
    value: function getHullSegments() {
      return this.hull.get("segments", { limit: 500 });
    }
  }]);

  return Hubspot;
}();