import { assert } from "chai";

import sendUsersJob from "../../server/controller/send-users-job";


function makeInstrumentationAgent() {
  return {
    calls: [],
    metricVal(...args) {
      this.calls.push(args);
    }
  };
}

function makeMapping() {
  return {
    getHubspotProperties(_segments, _user) {
      return {
        example: 123
      };
    }
  };
}

function makeSuccessResponse() {
  return {
    statusCode: 202,
    body: ""
  };
}

function makeHubspotAgent(res, err = null) {
  return {
    batchUsersCalled: false,
    batchUsers(_body) {
      this.batchUsersCalled = true;
      if (err !== null) {
        return Promise.reject(err);
      } else if (res === undefined) {
        return Promise.resolve(makeSuccessResponse());
      } else if (res === null) {
        return Promise.resolve(null);
      }
      return Promise.resolve(res);
    }
  };
}

function makeFakeLogger() {
  return {
    infoCalls: [],
    warnCalls: [],
    logCalls: [],
    warn(...args) {
      this.warnCalls.push(args);
    },
    info(...args) {
      this.infoCalls.push(args);
    },
    log(...args) {
      this.logCalls.push(args);
    }
  };
}

function makeHullAgent() {
  return {
    getSegments() {
      return Promise.resolve("test-segments");
    }
  };
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
    setHubspotAgent(hubspotAgent) {
      this.shipApp.hubspotAgent = hubspotAgent;
    }
  };
}


function dontCall() {
  assert.isOk(false);
}

describe("UsersController", () => {
  describe("#sendUsersJob()", () => {
    it("skip job if no users", () => {
      const req = makeFakeRequest();
      sendUsersJob(req).then(() => {
        assert.isOk(!req.shipApp.hubspotAgent.batchUsersCalled);
      });
    });

    it("skip job if no valid users", () => {
      const req = makeFakeRequest();
      req.payload = { users: [
        { name: "roberto", email: null }
      ] };
      sendUsersJob(req).then(() => {
        assert.isOk(!req.shipApp.hubspotAgent.batchUsersCalled);
      }, dontCall);
    });

    it("doesnt skip job if any valid users", () => {
      const req = makeFakeRequest();
      req.payload = { users: [
        { name: "roberto", email: "roberto@example.com" },
        { name: "foo", email: null },
      ] };
      sendUsersJob(req).then(() => {
        assert.isOk(req.shipApp.hubspotAgent.batchUsersCalled);
      }, dontCall);
    });

    it("analyze batch response when bad status", () => {
      const req = makeFakeRequest();
      req.payload = { users: [
        { name: "roberto", email: "roberto@example.com" },
        { name: "foo", email: null },
      ] };
      req.setHubspotAgent(makeHubspotAgent({
        statusCode: 100,
        body: ""
      }));
      sendUsersJob(req).then(dontCall,
        (err) => {
          assert.equal(err.message, "Error in create/update batch");
        }
      );
    });

    it("analyze batch response when it is null", () => {
      const req = makeFakeRequest();
      req.payload = { users: [
        { name: "roberto", email: "roberto@example.com" },
        { name: "foo", email: null },
      ] };
      req.setHubspotAgent(makeHubspotAgent(null));
      sendUsersJob(req).then(() => {
        assert.isOk(true);
      }, dontCall);
    });

    it("analyze batch error", () => {
      const req = makeFakeRequest();
      req.payload = { users: [
        { name: "roberto", email: "roberto@example.com" },
        { name: "foo", email: null },
      ] };
      req.setHubspotAgent(makeHubspotAgent(null, new Error("Error123")));
      sendUsersJob(req).then(dontCall, (err) => {
        assert.equal(err.message, "Error123");
      });
    });
  });
});
