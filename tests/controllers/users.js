import {assert} from 'chai';

import UsersController from '../../server/controller/users';


function makeInstrumentationAgent() {
  return {
    calls: [],
    metricVal: function (...args) {
      this.calls.push(args);
    }
  }
}

function makeMapping() {
  return {
    getHubspotProperties: function (segments, user) {
      return {
        example: 123
      }
    }
  }
}

function makeHubspotAgent(res, err=null) {
  return {
    batchUsersCalled: false,
    batchUsers: function (body) {
      this.batchUsersCalled = true;
      if (err !== null) {
        return Promise.reject(err);
      }
      else if (res === undefined) {
        return Promise.resolve(makeSuccessResponse());
      }
      else if (res === null) {
        return Promise.resolve(null);
      }
      else {
        return Promise.resolve(res);
      }
    }
  }
}

function makeFakeLogger() {
  return {
    infoCalls: [],
    warnCalls: [],
    logCalls: [],
    warn: function (...args) {
      this.warnCalls.push(args);
    },
    info: function (...args) {
      this.infoCalls.push(args);
    },
    log: function (...args) {
      this.logCalls.push(args)
    }
  }
}

function makeHullAgent() {
  return {
    getSegments: function () {
      return Promise.resolve('test-segments');
    }
  }
}

function makeFakeRequest() {
  return {
    payload: {
      users: []
    },
    shipApp: {
      instrumentationAgent: makeInstrumentationAgent(),
      hubspotAgent: makeHubspotAgent(),
      mapping: makeMapping(),
      hullAgent: makeHullAgent()
    },
    hull: {
      ship: "test-ship",
      client: {
        logger: makeFakeLogger()
      }
    },
    setHubspotAgent: function (hubspotAgent) {
      this.shipApp.hubspotAgent = hubspotAgent;
    }
  }
}

function skipped(req) {
  console.log(req.shipApp.hubspotAgent);
  return !req.shipApp.hubspotAgent.batchUsersCalled;
}

function makeSuccessResponse() {
  return {
    statusCode: 202,
    body: ""
  }
}

function dontCall() {
  assert.isOk(false);
}

describe('UsersController', () => {
  const controller = new UsersController();

  describe('#sendUsersJob()', () => {
    it('skip job if no users', () => {
      const req = makeFakeRequest();
      controller.sendUsersJob(req).then(() => {
        assert.isOk(!req.shipApp.hubspotAgent.batchUsersCalled)
      });
    });

    it('skip job if no valid users', () => {
      const req = makeFakeRequest();
      req.payload = {users: [
        {name: 'roberto', email: null}
      ]};
      controller.sendUsersJob(req).then(() => {
        assert.isOk(!req.shipApp.hubspotAgent.batchUsersCalled)
      }, dontCall);
    });

    it('doesnt skip job if any valid users', () => {
      const req = makeFakeRequest();
      req.payload = {users: [
        {name: 'roberto', email: 'roberto@example.com'},
        {name: 'foo', email: null},
      ]};
      controller.sendUsersJob(req).then(() => {
        assert.isOk(req.shipApp.hubspotAgent.batchUsersCalled);
      }, dontCall);
    });

    it('analyze batch response when bad status', () => {
      const req = makeFakeRequest();
      req.payload = {users: [
        {name: 'roberto', email: 'roberto@example.com'},
        {name: 'foo', email: null},
      ]};
      req.setHubspotAgent(makeHubspotAgent({
        statusCode: 100,
        body: ''
      }));
      controller.sendUsersJob(req).then(dontCall,
        (err) => {
          assert.equal(err.message, 'Error in create/update batch');
        }
      );
    });

    it('analyze batch response when it is null', () => {
      const req = makeFakeRequest();
      req.payload = {users: [
        {name: 'roberto', email: 'roberto@example.com'},
        {name: 'foo', email: null},
      ]};
      req.setHubspotAgent(makeHubspotAgent(null));
      controller.sendUsersJob(req).then(() => {
        assert.isOk(true);
      }, dontCall);
    });

    it('analyze batch error', () => {
      const req = makeFakeRequest();
      req.payload = {users: [
        {name: 'roberto', email: 'roberto@example.com'},
        {name: 'foo', email: null},
      ]};
      req.setHubspotAgent(makeHubspotAgent(null, new Error('Error123')));
        controller.sendUsersJob(req).then(dontCall, (err) => {
        assert.equal(err.message, 'Error123');
      });
    });
  });
});
