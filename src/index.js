import kue from "kue";
import Hull from "hull";

import KueAdapter from "./Lib/Adapter/Kue";
import BatchController from "./Controller/Batch";
import MonitorController from "./Controller/Monitor";
import ExportController from "./Controller/Export";
import FetchAllController from "./Controller/FetchAll";
import ImportController from "./Controller/Import";
import SyncController from "./Controller/Sync";
import NotifyController from "./Controller/Notify";
import WebApp from "./App/WebApp";
import QueueApp from "./App/QueueApp";
import WebRoutes from "./App/WebRoutes";
import QueueRoutes from "./App/QueueRoutes";

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
const webRoutes = new WebRoutes({
  batchController,
  monitorController,
  fetchAllController,
  importController,
  exportController,
  notifyController,
  syncController,
  Hull
});

const queueRoutes = new QueueRoutes({
  batchController,
  monitorController,
  fetchAllController,
  importController,
  exportController,
  notifyController,
  syncController
});

webRoutes.setup(webApp);
queueRoutes.setup(queueApp);

webApp.listen(process.env.PORT || 8082, () => {
  Hull.logger.info("webApp.listen");
});
queueApp.process();
