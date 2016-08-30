import kue from "kue";
import Hull from "hull";
import Promise from "bluebird";

import BatchSyncHandler from "./lib/batch-sync-handler";
import KueAdapter from "./lib/adapter/kue";
import BatchController from "./controller/batch";
import MonitorController from "./controller/monitor";
import ExportController from "./controller/export";
import FetchAllController from "./controller/fetch-all";
import ImportController from "./controller/import";
import SyncController from "./controller/sync";
import NotifyController from "./controller/notify";
import WebApp from "./app/web-app";
import QueueApp from "./app/queue-app";
import WebAppRouter from "./router/web-app-router";
import WebStaticRouter from "./router/web-static-router";
import WebOauthRouter from "./router/web-oauth-router";
import QueueRouter from "./router/queue-router";

const queueAdapter = new KueAdapter(kue.createQueue({
  redis: process.env.REDIS_URL
}));

const controllers = {
  batchController: new BatchController(),
  monitorController: new MonitorController(),
  fetchAllController: new FetchAllController(),
  importController: new ImportController(),
  exportController: new ExportController(),
  notifyController: new NotifyController(),
  syncController: new SyncController(),
};

WebApp({ queueAdapter })
  .use("/", WebAppRouter({ ...controllers, Hull }))
  .use("/", WebStaticRouter({ Hull }))
  .use("/", WebOauthRouter({ Hull }))
  .listen(process.env.PORT || 8082, () => {
    Hull.logger.info("webApp.listen");
  });


new QueueApp(queueAdapter)
  .use(QueueRouter(controllers))
  .process();

function exitNow() {
  console.warn("Exiting now !");
  process.exit(0);
}

function handleExit() {
  console.log("Exiting... waiting 30 seconds workers to flush");
  setTimeout(exitNow, 30000);
  Promise.all([
    queueAdapter.exit(),
    BatchSyncHandler.exit()
  ]).then(exitNow);
}

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
