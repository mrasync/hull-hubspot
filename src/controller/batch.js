export default class BatchController {
  /**
   * public method which queues the handleBatchExtractJob
   * @param  {Object} req
   * @param  {Object} res
   * @return {Promise}
   */
  handleBatchExtractAction(req, res) {
    return req.shipApp.queueAgent.create("handleBatchExtractJob", {
      body: req.body,
      chunkSize: 100
    })
    .then(() => res.end("ok"));
  }

  /**
   * Parses the extract results and queues chunks for export operations
   * @param  {String} body
   * @param  {Number} chunkSize
   * @return {Promise}
   */
  handleBatchExtractJob(req) {
    return req.shipApp.hullAgent.handleExtract(req.payload.body, req.payload.chunkSize, (usersBatch) => {
      const filteredUsers = usersBatch.filter((user) => req.shipApp.hullAgent.shouldSyncUser(user));
      return req.shipApp.queueAgent.create("exportUsersJob", {
        users: filteredUsers
      });
    });
  }
}
