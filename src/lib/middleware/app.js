import HubspotClient from "../hubspot-client";
import Mapping from "../mapping";
import HullAgent from "../hull-agent";
import HubspotAgent from "../hubspot-agent";
import QueueAgent from "../queue-agent";

export default function (queueAdapter) {
  return function middleware(req, res, next) {
    req.shipApp = req.shipApp || {};

    if (!req.hull.ship) {
      return next();
    }

    const accessToken = req.hull.ship.private_settings.token;
    const refreshToken = req.hull.ship.private_settings.refresh_token;
    req.shipApp.hubspotClient = new HubspotClient(accessToken, refreshToken);
    req.shipApp.mapping = new Mapping(req.hull.ship);
    req.shipApp.hullAgent = new HullAgent(req.hull.ship, req.hull.client, req.shipApp.mapping);
    req.shipApp.hubspotAgent = new HubspotAgent(req.shipApp.hullAgent, req.hull.client, req.shipApp.mapping, req.shipApp.hubspotClient);
    req.shipApp.queueAgent = new QueueAgent(queueAdapter, req);

    return next();
  };
}
