import Supply from "supply";
import Promise from "bluebird";

import AppMiddleware from "../lib/middleware/app";
import Hull from "hull";

export default class QueueApp {
  constructor(queueAdapter) {
    this.queueAdapter = queueAdapter;
    this.handlers = {};
    this.supply = new Supply();
  }

  attach(jobName, worker) {
    this.handlers[jobName] = worker;
  }

  process() {
    this.queueAdapter.process("queueApp", (job) => {
      console.log("PROCESS", job.data.name);
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
        .use(Hull.Middleware({ hostSecret: process.env.SECRET || "1234" }))
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
