export default function (req, res, next) {
  req.hull = req.hull || {};

  if (!req.query.ship) {
    return next();
  }

  req.hull.client.get(req.query.ship)
    .then((ship) => {
      req.hull.ship = ship;
      next();
    });
}
