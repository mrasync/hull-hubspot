import Supply from "supply";
import Promise from "bluebird";
import Hull from "hull";

import AppMiddleware from "../lib/middleware/app";

export default class WorkerApp {
  constructor({ queueAdapter, hostSecret }) {
    this.hostSecret = hostSecret;
    this.queueAdapter = queueAdapter;
    this.handlers = {};
    this.supply = new Supply();
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
        .use(Hull.Middleware({ hostSecret: this.hostSecret }))
        .use(AppMiddleware(this.queueAdapter))
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
