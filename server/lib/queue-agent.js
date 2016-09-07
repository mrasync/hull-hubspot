import _ from "lodash";

export default class QueueAgent {
  constructor(queueAdapter, req) {
    this.queueAdapter = queueAdapter;
    this.req = req;
    this.hullClient = req.hull.client;
  }

  create(jobName, jobPayload) {
    const context = _.pick(this.req, ["query", "hostname"]);
    this.hullClient.logger.log("queueAgent", jobName, _.keys(jobPayload));
    return this.queueAdapter.create("queueApp", {
      name: jobName,
      payload: jobPayload,
      context
    });
  }
}
