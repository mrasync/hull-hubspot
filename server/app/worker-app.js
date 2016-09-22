import Supply from "supply";
import Promise from "bluebird";
import Hull from "hull";

import AppMiddleware from "../lib/middleware/app";

export default class WorkerApp {
  constructor({ queueAdapter, hostSecret }) {
    this.hostSecret = hostSecret;
    this.queueAdapter = queueAdapter;
    this.handlers = {};
    this.supply = new Supply()
      // FIXME: the cached ship doesn't expire and won't be updated when
      // access token changes as result of a "start over" operation in
      // admin dashboard. The refresh token operation would update also the cached
      // version with new data.
      .use(Hull.Middleware({ hostSecret: this.hostSecret, cacheShip: false }))
      .use(AppMiddleware(this.queueAdapter));
  }

  attach(jobName, worker) {
    this.handlers[jobName] = worker;
  }

  process() {
    // FIXME: move queue name to dependencies
    this.queueAdapter.process("queueApp", (job) => {
      return this.dispatch(job.data.name, job.data.context, job.data.payload);
    });
  }

  dispatch(jobName, req, jobData) {
    console.log("dispatch", jobName);
    req.payload = jobData;
    const res = {};

    if (!this.handlers[jobName]) {
      return Promise.reject(new Error(`No such job registered ${jobName}`));
    }

    return Promise.fromCallback((callback) => {
      this.supply
        .each(req, res, callback);
    })
    .then(() => {
      return this.handlers[jobName](req, res);
    });
  }

  use(router) {
    return router(this);
  }
}
