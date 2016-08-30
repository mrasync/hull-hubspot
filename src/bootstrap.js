import BatchController from "./controller/batch";
import MonitorController from "./controller/monitor";
import ExportController from "./controller/export";
import FetchAllController from "./controller/fetch-all";
import ImportController from "./controller/import";
import SyncController from "./controller/sync";
import NotifyController from "./controller/notify";

export default {
  batchController: new BatchController(),
  monitorController: new MonitorController(),
  fetchAllController: new FetchAllController(),
  importController: new ImportController(),
  exportController: new ExportController(),
  notifyController: new NotifyController(),
  syncController: new SyncController(),
};
