import express from "express";
import path from "path";
import { renderFile } from "ejs";
import { Strategy as HubspotStrategy } from "passport-hubspot";
import updateUser from "./update-user";
import updateSegment from "./update-segment";
import updateShip from "./update-ship";

function save(hull, ship, settings) {
  return hull.put(ship.id, {
    private_settings: {
      ...ship.private_settings,
      ...settings
    }
  });
}
module.exports = function Server(options = {}) {
  const { port, hostSecret, clientID, clientSecret, Hull /* , devMode: dev */ } = options;
  const { NotifHandler, OAuthHandler, Routes } = Hull;
  const { Readme, Manifest } = Routes;

  const app = express();

  app.set("views", `${__dirname}/../views`);
  app.set("view engine", "ejs");
  app.engine("html", renderFile);
  app.use(express.static(path.resolve(__dirname, "..", "dist")));
  app.use(express.static(path.resolve(__dirname, "..", "assets")));

  app.use("/auth", OAuthHandler({
    hostSecret,
    name: "Hubspot",
    Strategy: HubspotStrategy,
    options: {
      clientID,
      clientSecret,
      scope: ["offline", "contacts-rw", "events-rw"],
      skipUserProfile: true
    },
    isSetup(req, { /* hull,*/ ship }) {
      return Promise.reject();
      if (!!req.query.reset) return Promise.reject();
      const { token } = ship.private_settings || {};
      return (!!token) ? Promise.resolve() : Promise.reject();
    },
    onLogin: (req, { hull, ship }) => {
      req.authParams = { ...req.body, ...req.query };
      return save(hull, ship, {
        portalId: req.authParams.portalId
      });
    },
    onAuthorize: (req, { hull, ship }) => {
      const { refreshToken, accessToken } = (req.account || {});
      return save(hull, ship, {
        refresh_token: refreshToken,
        token: accessToken
      });
    },
    views: {
      login: "login.html",
      home: "home.html",
      failure: "failure.html",
      success: "success.html"
    },
  }));

  app.get("/manifest.json", Manifest(__dirname));
  app.get("/", Readme);
  app.get("/readme", Readme);

  app.post("/notify", NotifHandler({
    groupTraits: false,
    hostSecret,
    handlers: {
      "user:update": updateUser.bind(undefined, { clientID, clientSecret }),
      "segment:update": updateSegment.bind(undefined, { clientID, clientSecret }),
      "ship:update": updateShip.bind(undefined, { clientID, clientSecret })
    }
  }));

  app.listen(port);

  Hull.logger.info("started", { port });

  return app;
};
