import CacheManager from "cache-manager";
import { ShipCache } from "hull";

import BatchController from "./controller/batch";
import MonitorController from "./controller/monitor";
import UsersController from "./controller/users";
import FetchAllController from "./controller/fetch-all";
import SyncController from "./controller/sync";
import NotifyController from "./controller/notify";

import InstrumentationAgent from "./lib/instrumentation-agent";
import KueAdapter from "./lib/adapter/kue";

const instrumentationAgent = new InstrumentationAgent();

const queueAdapter = new KueAdapter(({
  prefix: process.env.KUE_PREFIX || "hull-hubspot",
  redis: process.env.REDIS_URL
}));

const cacheManager = CacheManager.caching({
  store: "memory",
  max: process.env.SHIP_CACHE_MAX || 100,
  ttl: process.env.SHIP_CACHE_TTL || 60
});

const shipCache = new ShipCache(cacheManager, process.env.SHIP_CACHE_PREFIX || "hull-hubspot");

const controllers = {
  batchController: new BatchController(),
  monitorController: new MonitorController(),
  fetchAllController: new FetchAllController(),
  usersController: new UsersController(),
  notifyController: new NotifyController(),
  syncController: new SyncController()
};

export default { queueAdapter, controllers, instrumentationAgent, shipCache };
