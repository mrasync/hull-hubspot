"use strict";

module.exports = function getUserName() {
  var user = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  return user.name || user.email || [user.first_name, " ", user.last_name].join(" ") || "Unnamed User";
};