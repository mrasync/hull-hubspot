import Hull from "hull";

import WorkerApp from "./app/worker-app";
import WorkerRouter from "./router/worker-router";
import bootstrap from "./bootstrap";

const { queueAdapter, controllers } = bootstrap;

const hostSecret = process.env.SECRET || "1234";

new WorkerApp({ queueAdapter, hostSecret })
  .use(WorkerRouter(controllers))
  .process();

Hull.logger.info("workerApp.process");

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
