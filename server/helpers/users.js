import _ from "lodash";

export function collectValidUsers(users) {
  return users.filter(u => !_.isEmpty(u.email));
}

export function collectUsersProperties(users, getProperties) {
  return users.map(u => collectUserProperties(u, getProperties));
}

function collectUserProperties(user, getProperties) {
  return {
    email: user.email,
    properties: getProperties(user)
  };
}