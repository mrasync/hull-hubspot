import Hubspot from "./lib/hubspot";

export default function ({ clientID, clientSecret }, { message = {} }, { hull = {}, ship = {} }) {
  const { user = {}, segments = [] } = message;
  const { info } = hull.logger;

  const hubspot = new Hubspot({ clientID, clientSecret, hull, ship });
  hubspot.updateUser({ user, segments });
  // const properties = _.reduce(traits, (m, property) => {
  //   const value = user[property];
  //   if (value !== undefined) m.push({ property, value });
  //   return m;
  // }, [{
  //   property: "hull_segments",
  //   value: _.map(segments, "name").join(", ")
  // }]);

  info("update.process");

  return true;
}
