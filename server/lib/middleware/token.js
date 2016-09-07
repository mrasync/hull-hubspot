/**
 * [handle description]
 * @param  {Object}   req
 * @param  {Object}   res
 * @param  {Function} next
 */
export default function handle(req, res, next) {
  if (req.query && req.query.token) {
    req.hull = req.hull || {};
    req.hull.token = req.query.token;
  }
  next();
}
