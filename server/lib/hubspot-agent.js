import moment from "moment";
import Promise from "bluebird";
import ContactProperty from "./contact-property";

export default class HubspotAgent {

  constructor(hullAgent, hullClient, mapping, hubspotClient) {
    this.hullAgent = hullAgent;
    this.hullClient = hullClient;
    this.mapping = mapping;
    this.hubspotClient = hubspotClient;
    this.contactProperty = new ContactProperty();
  }

  checkToken() {
    // FIXME: having `expires_in` property we can avoid making this additional
    // API query
    return this.hubspotClient
      .get("/contacts/v1/lists/recently_updated/contacts/recent")
      .query({ count: 1 })
      .then(() => {
        return "valid";
      })
      .catch((err) => {
        if (err.response.statusCode === 401) {
          return this.hubspotClient.refreshAccessToken()
            .then((res) => {
              return this.hullAgent.updateShipSettings({
                token: res.body.access_token
              });
            })
            .then(() => {
              return "refreshed";
            });
        }
        return Promise.reject(err);
      });
  }

  /**
  * Get 100 hubspot contacts and queues their import
  * and getting another 100 - needs to be processed in one queue without
  * any concurrency
  * @see http://developers.hubspot.com/docs/methods/contacts/get_contacts
  * @param  {Number} [count=100]
  * @param  {Number} [offset=0]
  * @return {Promise}
  */
  getContacts(count = 100, offset = 0) {
    if (count > 100) {
      return this.hullClient.logger.error("getContact gets maximum of 100 contacts at once", count);
    }

    const properties = this.mapping.getHubspotPropertiesKeys();

    return this.hubspotClient
      .get("/contacts/v1/lists/all/contacts/all")
      .query({
        count,
        vidOffset: offset,
        property: properties
      });
  }

  /**
  * Get most recent contacts and filters out these who last modification
  * time if older that the lastImportTime. If there are any contacts modified since
  * that time queues import of them and getting next chunk from hubspot API.
  * @see http://developers.hubspot.com/docs/methods/contacts/get_recently_updated_contacts
  * @param  {Date} lastImportTime
  * @param  {Number} [count=100]
  * @param  {Number} [offset=0]
  * @return {Promise -> Array}
  */
  getRecentContacts(lastImportTime, count = 100, offset = 0) {
    const properties = this.mapping.getHubspotPropertiesKeys();
    return this.hubspotClient
      .get("/contacts/v1/lists/recently_updated/contacts/recent")
      .query({
        count,
        vidOffset: offset,
        property: properties
      })
      .then((res) => {
        res.body.contacts = res.body.contacts.filter((c) => {
          return moment(c.properties.lastmodifieddate.value, "x")
            .isAfter(lastImportTime);
        });
        return res;
      });
  }

  syncHullGroup() {
    return Promise.all([
      this.hullAgent.getSegments(),
      this.hubspotClient.get("/contacts/v2/groups").query({ includeProperties: true })
    ]).then(([segments = [], res]) => {
      const hubspotGroups = res.body;
      const hullSegmentsProperty = this.contactProperty.getHullProperty(segments);
      const hullGroup = this.contactProperty.findHullGroup(hubspotGroups);

      return (() => {
        if (!hullGroup) {
          return this.hubspotClient.post("/contacts/v2/groups")
            .send(this.contactProperty.getHullGroup());
        }
        return Promise.resolve();
      })()
      .then(() => {
        if (this.contactProperty.findHullProperty(hullGroup)) {
          return this.hubspotClient
            .put(`/contacts/v2/properties/named/${hullSegmentsProperty.name}`)
            .send(hullSegmentsProperty);
        }
        return this.hubspotClient.post("/contacts/v2/properties")
          .send(hullSegmentsProperty);
      });
    });
  }
}
