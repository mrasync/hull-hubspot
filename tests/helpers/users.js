import {assert} from 'chai';

import {
  collectValidUsers,
  collectUsersProperties
} from '../../server/helpers/users';


const invalidUsers = [
  {name: 'Mike', email: ''},
  {name: 'Bob', email: null},
  {name: 'Jhon'}
];

const users = [
  {name: 'Mike', email: ''},
  {name: 'Bob', email: null},
  {name: 'Jhon'},
  {name: 'Rich', email: 'rich@example.com'},
  {name: 'Joe', email: 'joe@example.com'}
];

const validUsers = [
  {name: 'Rich', email: 'rich@example.com'},
  {name: 'Joe', email: 'joe@example.com'}
];

describe("collectValidUsers()", () => {
  it ('returns empty array when called without users', () => {
    assert.deepEqual(collectValidUsers([]), []);
  });

  it ('returns empty array when all users are without emails', () => {
    assert.deepEqual(collectValidUsers(invalidUsers), []);
  });

  it ('returns user with email', () => {
    assert.deepEqual(collectValidUsers(users), validUsers);
  });
});


function getProperties(user) {
  return {
    login: user.name.toLowerCase()
  }
}

const propertiesResult = [
  {email: 'rich@example.com', properties: {login: 'rich'}},
  {email: 'joe@example.com', properties: {login: 'joe'}},
];

describe("collectUsersProperties()", () => {

  it ('returns empty array when called without users', () => {
    assert.deepEqual(collectUsersProperties([], getProperties), []);
  });

  it ('returns properties', () => {
    assert.deepEqual(
      collectUsersProperties(validUsers, getProperties), propertiesResult);
  });
});
