import Hull from "hull";

import QueueApp from "./app/queue-app";
import QueueRouter from "./router/queue-router";
import bootstrap from "./bootstrap";

const { queueAdapter, controllers } = bootstrap;

const hostSecret = process.env.SECRET || "1234";

new QueueApp({ queueAdapter, hostSecret })
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
