import BatchController from "./controller/batch";
import MonitorController from "./controller/monitor";
import UsersController from "./controller/users";
import FetchAllController from "./controller/fetch-all";
import SyncController from "./controller/sync";
import NotifyController from "./controller/notify";

import KueAdapter from "./lib/adapter/kue";

const queueAdapter = new KueAdapter(({
  prefix: process.env.KUE_PREFIX || "hull-hubspot",
  redis: process.env.REDIS_URL
}));

const controllers = {
  batchController: new BatchController(),
  monitorController: new MonitorController(),
  fetchAllController: new FetchAllController(),
  usersController: new UsersController(),
  notifyController: new NotifyController(),
  syncController: new SyncController()
};

export default { queueAdapter, controllers };
