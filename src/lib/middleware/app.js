import HubspotClient from "../hubspot-client";
import Mapping from "../mapping";
import HullAgent from "../hull-agent";
import HubspotAgent from "../hubspot-agent";
import QueueAgent from "../queue-agent";

export default function (queueAdapter) {
  return function middleware(req, res, next) {
    req.app = req.app || {};

    if (!req.hull.ship) {
      return next();
    }

    const accessToken = req.hull.ship.private_settings.token;
    const refreshToken = req.hull.ship.private_settings.refresh_token;
    req.app.hubspotClient = new HubspotClient(accessToken, refreshToken);
    req.app.mapping = new Mapping(req.hull.ship);
    req.app.hullAgent = new HullAgent(req.hull.ship, req.hull.client, req.app.mapping);
    req.app.hubspotAgent = new HubspotAgent(req.app.hullAgent, req.hull.client, req.app.mapping, req.app.hubspotClient);
    req.app.queueAgent = new QueueAgent(queueAdapter, req);

    return next();
  };
}
