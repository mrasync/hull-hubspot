export function getLogger(req) {
  return req.hull.client.logger;
}

export function log(req, ...args) {
  return getLogger(req).log(...args);
}

export function warn(req, ...args) {
  return getLogger(req).warn(...args);
}

export function info(req, ...args) {
  return getLogger(req).info(...args);
}
