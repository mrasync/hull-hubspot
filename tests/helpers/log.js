import {assert} from 'chai';

import {log, warn, info, getLogger} from '../../server/helpers/log';

function makeFakeRequest(logger=null) {
  return {
    hull: {
      client: {
        logger: logger || makeFakeLogger()
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

describe("getLogger()", () => {
  it ('returns logger', () => {
    const logger = makeFakeLogger();
    const req = makeFakeRequest(logger);
    assert.equal(getLogger(req), logger);
  });
});

describe('log()', () => {
  it('works with one arg', () => {
    const req = makeFakeRequest();
    log(req, 'Test message');
    assert.deepEqual(getLogger(req).logCalls[0], ['Test message']);
  });

  it('works with many args', () => {
    const req = makeFakeRequest();
    log(req, 'Test message', 10, 20);
    assert.deepEqual(getLogger(req).logCalls[0], ['Test message', 10, 20]);
  });
});

describe('warn()', () => {
  it('works with one arg', () => {
    const req = makeFakeRequest();
    warn(req, 'Test message');
    assert.deepEqual(getLogger(req).warnCalls[0], ['Test message']);
  });

  it('works with many args', () => {
    const req = makeFakeRequest();
    warn(req, 'Test message', 10, 20);
    assert.deepEqual(getLogger(req).warnCalls[0], ['Test message', 10, 20]);
  });
});

describe('info()', () => {
  it('works with one arg', () => {
    const req = makeFakeRequest();
    info(req, 'Test message');
    assert.deepEqual(getLogger(req).infoCalls[0], ['Test message']);
  });

  it('works with many args', () => {
    const req = makeFakeRequest();
    info(req, 'Test message', 10, 20);
    assert.deepEqual(getLogger(req).infoCalls[0], ['Test message', 10, 20]);
  });
});
