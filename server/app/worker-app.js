import Supply from "supply";
import Promise from "bluebird";
import Hull from "hull";
import _ from "lodash";

import AppMiddleware from "../lib/middleware/app";

export default class WorkerApp {
  constructor({ queueAdapter, hostSecret, instrumentationAgent }) {
    this.hostSecret = hostSecret;
    this.queueAdapter = queueAdapter;
    this.handlers = {};
    this.instrumentationAgent = instrumentationAgent;
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
      return this.dispatch(job);
    });
  }

  dispatch(job) {
    const jobName = job.data.name;
    const req = job.data.context;
    const jobData = job.data.payload;
    console.log("dispatch", jobName);
    req.payload = jobData;
    const res = {};

    if (!this.handlers[jobName]) {
      return Promise.reject(new Error(`No such job registered ${jobName}`));
    }
    return Promise.fromCallback((callback) => {
      this.instrumentationAgent.startTransaction(jobName, () => {
        this.runMiddleware(req, res)
          .then(() => {
            return this.handlers[jobName].call(job, req, res);
          })
          .then((jobRes) => {
            callback(null, jobRes);
          }, (err) => {
            this.instrumentationAgent.catchError(err, {
              job_id: job.id
            }, {
              job_name: job.data.name,
              organization: _.get(job.data.context, "query.organization"),
              ship: _.get(job.data.context, "query.ship")
            });
            callback(err);
          })
          .finally(() => {
            this.instrumentationAgent.endTransaction();
          });
      });
    });
  }

  runMiddleware(req, res) {
    return Promise.fromCallback((callback) => {
      this.supply
        .each(req, res, callback);
    });
  }

  use(router) {
    return router(this);
  }
}
