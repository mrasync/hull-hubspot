import kue from "kue";
import Hull from "hull";
import Promise from "bluebird";

import BatchSyncHandler from "./lib/batch-sync-handler";
import KueAdapter from "./lib/adapter/kue";
import controllers from "./bootstrap";

import WebApp from "./app/web-app";
import WebAppRouter from "./router/web-app-router";
import WebStaticRouter from "./router/web-static-router";
import WebOauthRouter from "./router/web-oauth-router";

const queueAdapter = new KueAdapter(kue.createQueue({
  redis: process.env.REDIS_URL
}));

WebApp({ queueAdapter })
  .use("/", WebAppRouter({ ...controllers, Hull }))
  .use("/", WebStaticRouter({ Hull }))
  .use("/", WebOauthRouter({ Hull }))
  .listen(process.env.PORT || 8082, () => {
    Hull.logger.info("webApp.listen");
  });

function exitNow() {
  console.warn("Exiting now !");
  process.exit(0);
}

function handleExit() {
  console.log("Exiting... waiting 30 seconds workers to flush");
  setTimeout(exitNow, 30000);
  BatchSyncHandler.exit()
    .then(exitNow);
}

process.on("SIGINT", handleExit);
process.on("SIGTERM", handleExit);
