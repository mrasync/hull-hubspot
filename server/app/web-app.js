import express from "express";
import path from "path";
import { renderFile } from "ejs";
import TokenMiddleware from "../lib/middleware/token";

export default function () {
  const app = express();


  app.use(TokenMiddleware);
  app.engine("html", renderFile);
  app.use(express.static(path.resolve(__dirname, "..", "assets")));
  app.set("views", path.resolve(__dirname, "..", "..", "views"));
  app.set("view engine", "ejs");

  return app;
}
