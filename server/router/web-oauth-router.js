import { Router } from "express";
import { Strategy as HubspotStrategy } from "passport-hubspot";
import moment from "moment";

import AppMiddleware from "../lib/middleware/app";

export default function (deps) {
  const router = Router();

  const {
    Hull,
    hostSecret,
    clientID,
    clientSecret,
    queueAdapter,
    shipCache
  } = deps;

  const { OAuthHandler } = Hull;

  router.use("/auth", OAuthHandler({
    hostSecret,
    shipCache,
    name: "Hubspot",
    Strategy: HubspotStrategy,
    options: {
      clientID,
      clientSecret,
      scope: ["offline", "contacts-rw", "events-rw"],
      skipUserProfile: true
    },
    isSetup(req, { hull, ship }) {
      if (req.query.reset) return Promise.reject();
      const { token } = ship.private_settings || {};
      if (token) {
        // TODO: we have notices problems with syncing hull segments property
        // after a Hubspot resync, there may be a problem with notification
        // subscription. Following two lines fixes that problem.
        AppMiddleware({ queueAdapter, shipCache })(req, {}, () => {});
        req.shipApp.hubspotAgent.syncHullGroup();

        return hull.get(ship.id).then(s => {
          return { settings: s.private_settings };
        });
      }
      return Promise.reject();
    },
    onLogin: (req, { hull, ship }) => {
      req.authParams = { ...req.body, ...req.query };
      const newShip = {
        private_settings: {
          ...ship.private_settings,
          portal_id: req.authParams.portalId
        }
      };
      return hull.put(ship.id, newShip)
        .then(() => {
          return shipCache.del(ship.id);
        });
    },
    onAuthorize: (req, { hull, ship }) => {
      const { refreshToken, accessToken, expiresIn } = (req.account || {});
      // TODO: save `expires_at` property to ease token refresh
      const newShip = {
        private_settings: {
          ...ship.private_settings,
          refresh_token: refreshToken,
          token: accessToken,
          expires_in: expiresIn,
          token_fetched_at: moment().utc().format("x"),
        }
      };
      return hull.put(ship.id, newShip)
        .then(() => {
          return shipCache.del(ship.id);
        });
    },
    views: {
      login: "login.html",
      home: "home.html",
      failure: "failure.html",
      success: "success.html"
    },
  }));

  return router;
}
