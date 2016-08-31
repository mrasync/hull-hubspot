import Promise from "bluebird";

/**
 * Kue Adapter for queue
 */
export default class KueAdapter {

  /**
   * @param {Object} queue Kue instance
   */
  constructor(queue) {
    this.queue = queue;
    this.queue.watchStuckJobs();
  }

  /**
   * @param {String} jobName queue name
   * @param {Object} jobPayload
   * @return {Promise}
   */
  create(jobName, jobPayload, ttl = 0) {
    return Promise.fromCallback((callback) => {
      return this.queue.create(jobName, jobPayload)
        .ttl(ttl)
        .removeOnComplete(true)
        .save(callback);
    });
  }

  /**
   * @param {String} jobName
   * @param {Function -> Promise} jobCallback
   * @return {Object} this
   */
  process(jobName, jobCallback) {
    return this.queue.process(jobName, (job, done) => {
      jobCallback(job)
        .then((res) => {
          done(null, res);
        }, (err) => {
          done(err);
        })
        .catch((err) => {
          console.err("err", err);
          done(err);
        });
    });
  }

  exit() {
    return Promise.fromCallback((callback) => {
      this.queue.shutdown(5000, callback);
    });
  }
}
