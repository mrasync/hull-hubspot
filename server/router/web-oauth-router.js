import { Router } from "express";
import { Strategy as HubspotStrategy } from "passport-hubspot";

export default function (deps) {
  const router = Router();

  const {
    Hull,
    hostSecret,
    clientID,
    clientSecret
  } = deps;

  const { OAuthHandler } = Hull;

  router.use("/auth", OAuthHandler({
    hostSecret,
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
        return hull.get(ship.id).then(s => {
          return { settings: s.private_settings };
        });
      }
      return Promise.reject();
    },
    onLogin: (req, { hull, ship }) => {
      req.authParams = { ...req.body, ...req.query };
      return hull.put(ship.id, {
        private_settings: {
          ...ship.private_settings,
          portal_id: req.authParams.portalId
        }
      });
    },
    onAuthorize: (req, { hull, ship }) => {
      const { refreshToken, accessToken } = (req.account || {});
      // FIXME: save `expires_in` property to ease token refresh
      return hull.put(ship.id, {
        private_settings: {
          ...ship.private_settings,
          refresh_token: refreshToken,
          token: accessToken
        }
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
