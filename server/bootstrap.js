import BatchController from "./controller/batch";
import MonitorController from "./controller/monitor";
import UsersController from "./controller/users";
import FetchAllController from "./controller/fetch-all";
import SyncController from "./controller/sync";
import NotifyController from "./controller/notify";

export default {
  batchController: new BatchController(),
  monitorController: new MonitorController(),
  fetchAllController: new FetchAllController(),
  usersController: new UsersController(),
  notifyController: new NotifyController(),
  syncController: new SyncController(),
};
