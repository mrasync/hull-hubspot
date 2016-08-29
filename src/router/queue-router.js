export default function (deps) {

  const {
    batchController,
    monitorController,
    fetchAllController,
    importController,
    exportController,
    notifyController,
    syncController
  } = deps;

  return function(queueApp) {
    queueApp.attach("handleBatchExtractJob", batchController.handleBatchExtractJob.bind(batchController));
    queueApp.attach("fetchAllJob", fetchAllController.fetchAllJob.bind(fetchAllController));
    queueApp.attach("importContactsJob", importController.importContactsJob.bind(importController));
    queueApp.attach("exportUsersJob", exportController.exportUsersJob.bind(exportController));
    queueApp.attach("syncJob", syncController.syncJob.bind(syncController));
    return queueApp;
  }
}
