import HubspotClient from "../hubspot-client";
import Mapping from "../mapping";
import HullAgent from "../hull-agent";
import HubspotAgent from "../hubspot-agent";
import QueueAgent from "../queue-agent";
import ProgressAgent from "../progress-agent";

export default function ({ queueAdapter, shipCache }) {
  return function middleware(req, res, next) {
    req.shipApp = req.shipApp || {};

    if (!req.hull || !req.hull.ship) {
      return next();
    }

    req.shipApp.hubspotClient = new HubspotClient({ ship: req.hull.ship, hullClient: req.hull.client });
    req.shipApp.mapping = new Mapping(req.hull.ship);
    req.shipApp.hullAgent = new HullAgent(req.hull.ship, req.hull.client, req.shipApp.mapping, req.query, req.hostname, shipCache);
    req.shipApp.hubspotAgent = new HubspotAgent(req.shipApp.hullAgent, req.hull.client, req.shipApp.mapping, req.shipApp.hubspotClient, req.hull.ship);
    req.shipApp.queueAgent = new QueueAgent(queueAdapter, req);
    req.shipApp.progressAgent = new ProgressAgent(req.shipApp.hullAgent, req.hull.client);
    req.shipApp.shipCache = shipCache;

    return next();
  };
}
