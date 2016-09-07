import { Router } from "express";
import bodyParser from "body-parser";
import { Middleware } from "hull";

import NotifHandler from "../lib/hull/notif-handler";
import ParseMessageMiddleware from "../lib/middleware/parse-message";
import AppMiddleware from "../lib/middleware/app";


export default function (deps) {
  const router = Router();
  const {
    Hull,
    batchController,
    monitorController,
    fetchAllController,
    notifyController,
    syncController,
    hostSecret,
    queueAdapter
  } = deps;

  router
    .use("/notify", ParseMessageMiddleware)
    .use((req, res, next) => {
      if (req.query.ship || (req.hull && req.hull.token)) {
        return Middleware({ hostSecret, fetchShip: true, cacheShip: true })(req, res, next);
      }
      return next();
    })
    .use(AppMiddleware(queueAdapter));

  router.post("/batch", bodyParser.json(), batchController.handleBatchExtractAction.bind(batchController));
  router.post("/fetchAll", bodyParser.json(), fetchAllController.fetchAllAction.bind(fetchAllController));
  router.post("/sync", bodyParser.json(), syncController.syncAction.bind(syncController));

  router.post("/notify", NotifHandler(Hull, {
    hostSecret,
    groupTraits: false,
    handlers: {
      "segment:update": notifyController.segmentUpdateHandler.bind(notifyController),
      "segment:delete": notifyController.segmentDeleteHandler.bind(notifyController),
      "user:update": notifyController.userUpdateHandler.bind(notifyController),
      "ship:update": notifyController.shipUpdateHandler.bind(notifyController),
    }
  }));

  router.post("/monitor/checkToken", bodyParser.json(), monitorController.checkTokenAction.bind(monitorController));

  return router;
}
