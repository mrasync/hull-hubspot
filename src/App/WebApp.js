import path from "path";
import express from "express";
import bodyParser from "body-parser";
import { renderFile } from "ejs";

import AppMiddleware from "../Lib/Middleware/App";
import ShipMiddleware from "../Lib/Middleware/Ship";
import HullClientMiddleware from "../Lib/Middleware/HullClient";

export default class QueueApp {
  constructor(queueAdapter) {
    const app = express();

    app.use(bodyParser.json())
      .use(HullClientMiddleware)
      .use(ShipMiddleware)
      .use(AppMiddleware(queueAdapter))
      .use(express.static(path.resolve(__dirname, "..", "dist")))
      .use(express.static(path.resolve(__dirname, "..", "assets")));

    app.engine("html", renderFile);

    return app;
  }
}
