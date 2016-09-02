import express from "express";
import bodyParser from "body-parser";
import { renderFile } from "ejs";
import Hull from "hull";
import hullClientMiddleware from "../lib/middleware/hull-client";

import AppMiddleware from "../lib/middleware/app";

export default function ({ queueAdapter, hostSecret }) {
  const app = express();
  const middleware = hullClientMiddleware(Hull, { hostSecret });
  app
    .use(bodyParser.json())
    .use((req, res, next) => {
      middleware(req, res, () => {
        next();
      });
    })
    .use(AppMiddleware(queueAdapter));
  app.engine("html", renderFile);
  app.set("views", `${__dirname}/../../views`);
  app.set("view engine", "ejs");

  return app;
}
