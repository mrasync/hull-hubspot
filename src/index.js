import path from "path";
import kue from "kue";
import { NotifHandler } from "hull";
import BatchController from "./Controller/Batch";
import MonitorController from "./Controller/Monitor";
import ExportController from "./Controller/Export";
import FetchAllController from "./Controller/FetchAll";
import ImportController from "./Controller/Import";
import SyncController from "./Controller/Sync";
import NotifyController from "./Controller/Notify";

import KueAdapter from "./Lib/Adapter/Kue";

import WebApp from "./App/WebApp";
import QueueApp from "./App/QueueApp";

const queueAdapter = new KueAdapter(kue.createQueue({
  redis: process.env.REDIS_URL
}));

const batchController = new BatchController();
const monitorController = new MonitorController();
const fetchAllController = new FetchAllController();
const importController = new ImportController();
const exportController = new ExportController();
const notifyController = new NotifyController();
const syncController = new SyncController();

const webApp = new WebApp(queueAdapter);
const queueApp = new QueueApp(queueAdapter);

webApp.get("/manifest.json", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "manifest.json"));
});

webApp.post("/batch", batchController.handleBatchExtractAction.bind(batchController));
webApp.post("/fetchAll", fetchAllController.fetchAllAction.bind(fetchAllController));
webApp.post("/sync", syncController.syncAction.bind(syncController));
webApp.get("/notify", NotifHandler({
    hostSecret: "test",
    groupTraits: false,
    handlers: {
      "user:update": notifyController.handleUserUpdate.bind(notifyController),
      // "ship:update": MailchimpAgent.handle("handleShipUpdate", MailchimpClient),
    }
  }));

webApp.get("/monitor/checkToken", monitorController.checkTokenAction.bind(MonitorController));

queueApp.process("handleBatchExtractJob", batchController.handleBatchExtractJob.bind(batchController));
queueApp.process("fetchAllJob", fetchAllController.fetchAllJob.bind(fetchAllController));
queueApp.process("importContactsJob", importController.importContactsJob.bind(importController));
queueApp.process("exportUsersJob", exportController.exportUsersJob.bind(exportController));
queueApp.process("syncJob", syncController.syncJob.bind(syncController));

webApp.listen(8082);
