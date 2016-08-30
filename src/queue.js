import kue from "kue";
import Hull from "hull";
import Promise from "bluebird";

import BatchSyncHandler from "./lib/batch-sync-handler";
import KueAdapter from "./lib/adapter/kue";
import controllers from "./bootstrap";

import QueueApp from "./app/queue-app";
import QueueRouter from "./router/queue-router";

const queueAdapter = new KueAdapter(kue.createQueue({
  redis: process.env.REDIS_URL
}));

new QueueApp(queueAdapter)
  .use(QueueRouter(controllers))
  .process();

Hull.logger.info("queueApp.process");

function exitNow() {
  console.warn("Exiting now !");
  process.exit(0);
}

function handleExit() {
  console.log("Exiting... waiting 30 seconds workers to flush");
  setTimeout(exitNow, 30000);
  queueAdapter.exit().then(exitNow);
}

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
