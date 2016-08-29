export default class QueueRoutes {
  constructor(deps) {
    this.deps = deps;
  }

  setup(queueApp) {
    const {
      batchController,
      monitorController,
      fetchAllController,
      importController,
      exportController,
      notifyController,
      syncController
    } = this.deps;

    queueApp.attach("handleBatchExtractJob", batchController.handleBatchExtractJob.bind(batchController));
    queueApp.attach("fetchAllJob", fetchAllController.fetchAllJob.bind(fetchAllController));
    queueApp.attach("importContactsJob", importController.importContactsJob.bind(importController));
    queueApp.attach("exportUsersJob", exportController.exportUsersJob.bind(exportController));
    queueApp.attach("syncJob", syncController.syncJob.bind(syncController));

    return queueApp;
  }
}
