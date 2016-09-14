export default function (deps) {
  const {
    batchController,
    fetchAllController,
    usersController,
    syncController,
    monitorController
  } = deps;

  return function QueueRouter(workerApp) {
    workerApp.attach("handleBatchExtractJob", batchController.handleBatchExtractJob.bind(batchController));
    workerApp.attach("fetchAllJob", fetchAllController.fetchAllJob.bind(fetchAllController));
    workerApp.attach("saveContactsJob", usersController.saveContactsJob.bind(usersController));
    workerApp.attach("sendUsersJob", usersController.sendUsersJob.bind(usersController));
    workerApp.attach("syncJob", syncController.syncJob.bind(syncController));
    workerApp.attach("startSyncJob", syncController.startSyncJob.bind(syncController));
    workerApp.attach("checkTokenJob", monitorController.checkTokenJob.bind(monitorController));
    return workerApp;
  };
}
