import Hubspot from "./lib/hubspot";

export default function ({ clientID, clientSecret }, { message = {} }, { hull = {}, ship = {} }) {
  console.log(arguments)
  const hubspot = new Hubspot({ clientID, clientSecret, token, refresh_token, portal_id, traits });
  return true;
}
