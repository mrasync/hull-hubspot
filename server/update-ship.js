import Hubspot from "./lib/hubspot";

export default function ({ clientID, clientSecret }, { message = {} }, { hull = {}, ship = {} }) {
  const hubspot = new Hubspot({ clientID, clientSecret, ship, hull });
  hubspot.syncHullGroup();
  return true;
}
