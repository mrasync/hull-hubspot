import { Router } from "express";

export default function (deps) {
  const router = Router();
  const {
    Hull,
    batchController,
    monitorController,
    fetchAllController,
    notifyController,
    syncController
  } = deps;
  const { NotifHandler } = Hull;

  router.post("/batch", batchController.handleBatchExtractAction.bind(batchController));
  router.post("/fetchAll", fetchAllController.fetchAllAction.bind(fetchAllController));
  router.post("/sync", syncController.syncAction.bind(syncController));

  router.post("/notify", NotifHandler({
    hostSecret: process.env.SECRET || "1234",
    groupTraits: false,
    handlers: {
      "segment:update": notifyController.segmentUpdateHandler.bind(notifyController),
      "segment:delete": notifyController.segmentDeleteHandler.bind(notifyController),
      "user:update": notifyController.userUpdateHandler.bind(notifyController),
      "ship:update": notifyController.shipUpdateHandler.bind(notifyController),
    }
  }));

  router.get("/monitor/checkToken", monitorController.checkTokenAction.bind(monitorController));

  return router;
}
