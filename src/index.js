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

const webApp = WebApp({ queueAdapter })
  .use("/", WebAppRouter({ ...controllers, Hull }))
  .use("/", WebStaticRouter({ Hull }))
  .use("/", WebOauthRouter({ Hull }))
  .listen(process.env.PORT || 8082, () => {
    Hull.logger.info("webApp.listen");
  });


const queueApp = new QueueApp(queueAdapter)
  .use(QueueRouter(controllers))
  .process();
