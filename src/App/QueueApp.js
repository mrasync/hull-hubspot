import Supply from "supply";
import Promise from "bluebird";

import AppMiddleware from "../Lib/Middleware/App";
import ShipMiddleware from "../Lib/Middleware/Ship";
import HullClientMiddleware from "../Lib/Middleware/HullClient";

export default class QueueApp {
  constructor(queueAdapter) {
    this.queueAdapter = queueAdapter;

    this.queueAdapter.process("queueApp", (job) => {
      console.log("PROCESS", job.data.name);
      return this.dispatch(job.data.name, job.data.context, job.data.payload);
    });

    this.handlers = {};

    this.supply = new Supply();

  }

  process(jobName, worker) {
    this.handlers[jobName] = worker;
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
          .use(HullClientMiddleware)
          .use(ShipMiddleware)
          .use(AppMiddleware(this.queueAdapter))
          .each(req, res, callback);
    })
    .then(() => {
      return this.handlers[jobName](req, res);
    });
  }
}
