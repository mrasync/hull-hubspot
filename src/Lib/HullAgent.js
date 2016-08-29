import _ from "lodash";
import Promise from "bluebird";
import CSVStream from "csv-stream";
import ps from "promise-streams";
import BatchStream from "batch-stream";
import JSONStream from "JSONStream";
import request from "request";

export default class HullAgent {
  constructor(ship, hullClient, mapping) {
    this.ship = ship;
    this.hullClient = hullClient;
    this.mapping = mapping;
  }

  getSegments() {
    return this.hullClient.get("segments", { limit: 500 });
  }

  updateShipSettings(newSettings) {
    return this.hullClient.put(this.ship.id, {
      ...this.ship.private_settings,
      private_settings: newSettings
    });
  }

  /**
  * creates or updates users
  * @see https://www.hull.io/docs/references/api/#endpoint-traits
  * @param  {Array} Hubspot contacts
  * @return {Promise}
  */
  importContacts(contacts) {
    console.log("importContacts", contacts.length);
    return Promise.all(contacts.map((c) => {
      const email = _.get(_.find(c["identity-profiles"][0].identities, { type: "EMAIL" }), "value");
      if (!email) {
        return "";
      }
      const traits = this.mapping.getHullTraits(c);
      console.log("HullAgent.importContacts.importing", email);
      return this.hullClient.as({ email }).traits(traits, { source: "hubspot" });
    }));
  }

  /**
  * Get information about last import done from hubspot
  * @return {Promise -> lastImportTime (ISO 8601)} 2016-08-04T12:51:46Z
  */
  getLastUpdate() {
    console.log("A");
    return this.hullClient.get("/search/user_reports", {
      include: ["traits_hubspot/fetched_at"],
      sort: {
        "traits_hubspot/fetched_at": "desc"
      },
      per_page: 1,
      page: 1
    })
    .then((r) => {
      return r.data[0]["traits_hubspot/fetched_at"];
    })
    .catch(() => {
      return Promise.resolve(new Date(0));
    });
  }

  shouldSyncUser(user) {
    const segmentIds = this.ship.private_settings.synchronized_segments || [];
    if (segmentIds.length === 0) {
      return true;
    }
    return _.intersection(segmentIds, user.segment_ids).length > 0
      && !_.isEmpty(user.email);
  }

  /**
   * Wrapper for batch call handlers
   * Streams the data from the extract URL and calls a handler with batches of users
   * @param  {String}
   * @param  {String}
   * @param  {Function}
   * @return {Promise}
   */
  handleExtract({ url, format }, chunkSize, callback) {
    if (!url) return Promise.reject(new Error("Missing URL"));
    const decoder = format === "csv" ? CSVStream.createStream({ escapeChar: "\"", enclosedChar: "\"" }) : JSONStream.parse();

    const batch = new BatchStream({ size: chunkSize });

    return request({ url })
      .pipe(decoder)
      .pipe(batch)
      .pipe(ps.map({ concurrent: 2 }, (...args) => {
        try {
          return callback(...args);
        } catch (e) {
          console.error(e);
          throw e;
        }
      }))
      .wait();
  }
}
