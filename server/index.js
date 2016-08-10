if (process.env.NEW_RELIC_LICENSE_KEY) {
  console.warn("Starting newrelic agent with key: ", process.env.NEW_RELIC_LICENSE_KEY);
  require("newrelic"); // eslint-disable-line global-require
}

const Hull = require("hull");
const Server = require("./server");

if (process.env.LOG_LEVEL) Hull.logger.transports.console.level = process.env.LOG_LEVEL;

if (process.env.LOGSTASH_HOST && process.env.LOGSTASH_HOST) {
  const Logstash = require("winston-logstash").Logstash; // eslint-disable-line global-require
  Hull.logger.add(Logstash, {
    node_name: "hubspot",
    port: process.env.LOGSTASH_PORT,
    host: process.env.LOGSTASH_HOST
  });
}

Hull.logger.info("hubspot.boot");

Server({
  Hull,
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  hostSecret: process.env.SECRET || "1234",
  devMode: process.env.NODE_ENV === "development",
  port: process.env.PORT || 8082
});
