import { assert } from "chai";

import { log, warn, info, getLogger } from "../../server/helpers/log";


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

function makeFakeRequest(logger = null) {
  return {
    hull: {
      client: {
        logger: logger || makeFakeLogger()
      }
    }
  };
}

describe("getLogger()", () => {
  it("returns logger", () => {
    const logger = makeFakeLogger();
    const req = makeFakeRequest(logger);
    assert.equal(getLogger(req), logger);
  });
});

describe("log()", () => {
  it("works with one arg", () => {
    const req = makeFakeRequest();
    log(req, "Test message");
    assert.deepEqual(getLogger(req).logCalls[0], ["Test message"]);
  });

  it("works with many args", () => {
    const req = makeFakeRequest();
    log(req, "Test message", 10, 20);
    assert.deepEqual(getLogger(req).logCalls[0], ["Test message", 10, 20]);
  });
});

describe("warn()", () => {
  it("works with one arg", () => {
    const req = makeFakeRequest();
    warn(req, "Test message");
    assert.deepEqual(getLogger(req).warnCalls[0], ["Test message"]);
  });

  it("works with many args", () => {
    const req = makeFakeRequest();
    warn(req, "Test message", 10, 20);
    assert.deepEqual(getLogger(req).warnCalls[0], ["Test message", 10, 20]);
  });
});

describe("info()", () => {
  it("works with one arg", () => {
    const req = makeFakeRequest();
    info(req, "Test message");
    assert.deepEqual(getLogger(req).infoCalls[0], ["Test message"]);
  });

  it("works with many args", () => {
    const req = makeFakeRequest();
    info(req, "Test message", 10, 20);
    assert.deepEqual(getLogger(req).infoCalls[0], ["Test message", 10, 20]);
  });
});
