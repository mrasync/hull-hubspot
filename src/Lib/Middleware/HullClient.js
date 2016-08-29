import Hull from "hull";
// import jwt from "jwt-simple";

export default function (req, res, next) {
  req.hull = req.hull || {};

  if (!req.query.ship) {
    return next();
  }

  // if (req.query.hullToken) {
  //   try {
  //     query = jwt.decode(req.query.hullToken, shipToken);
  //   } catch (e) {
  //     console.log("Invalid hullToken passed", req.query.hullToken);
  //   }
  // }

  req.hull.client = new Hull({
    id: req.query.ship,
    organization: req.query.organization,
    secret: req.query.secret
  });

  // req.hull.hullToken = jwt.encode({
  //     ship: config.ship,
  //     organization: config.organization,
  //     secret: config.secret
  // }, shipToken);
  return next();
}
