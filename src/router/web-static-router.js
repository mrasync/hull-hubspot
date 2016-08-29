import express from "express";
import { Router } from "express";
import path from "path"


export default function ({ Hull }) {
  const router = Router();
  const { NotifHandler, OAuthHandler, Routes } = Hull;
  const { Readme, Manifest } = Routes;

  router.use(express.static(path.resolve(__dirname, "..", "dist")))
  router.use(express.static(path.resolve(__dirname, "..", "assets")));

  router.get("/manifest.json", Manifest(`${__dirname}/..`));
  router.get("/", Readme);
  router.get("/readme", Readme);

  return router;
}
