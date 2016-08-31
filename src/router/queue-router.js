export default function (deps) {
  const {
    batchController,
    fetchAllController,
    usersController,
    syncController
  } = deps;

  return function QueueRouter(queueApp) {
    queueApp.attach("handleBatchExtractJob", batchController.handleBatchExtractJob.bind(batchController));
    queueApp.attach("fetchAllJob", fetchAllController.fetchAllJob.bind(fetchAllController));
    queueApp.attach("saveContactsJob", usersController.saveContactsJob.bind(usersController));
    queueApp.attach("sendUsersJob", usersController.sendUsersJob.bind(usersController));
    queueApp.attach("syncJob", syncController.syncJob.bind(syncController));
    return queueApp;
  };
}
