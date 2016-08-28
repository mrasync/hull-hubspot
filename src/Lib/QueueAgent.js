import _ from "lodash";

export default class QueueAgent {
  constructor(queueAdapter, req) {
    this.queueAdapter = queueAdapter;
    this.req = req;
  }

  create(jobName, jobPayload) {
    const context = _.pick(this.req, ["query"]);
    console.log("QueueAgent", jobName, _.keys(jobPayload));
    return this.queueAdapter.create("queueApp", {
      name: jobName,
      payload: jobPayload,
      context
    });
  }
}
