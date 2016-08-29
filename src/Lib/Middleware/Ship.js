export default function (req, res, next) {
  req.hull = req.hull || {};

  if (!req.query.ship) {
    return next();
  }

  return req.hull.client.get(req.query.ship)
    .then((ship) => {
      req.hull.ship = ship;
      return next();
    });
}
