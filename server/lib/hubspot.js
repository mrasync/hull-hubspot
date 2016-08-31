import HubspotClient from "hubspot";
import _ from "lodash";

const HULL_GROUP = {
  name: "hull",
  displayName: "Hull Properties",
  displayOrder: 1
};

function optionsHash(name, i) {
  return {
    hidden: false,
    description: null,
    value: name,
    readOnly: false,
    doubleData: 0.0,
    label: name,
    displayOrder: i
  };
}

function buildHullSegmentsProperty(segments = []) {
  const options = _.map(segments, (s, i) => optionsHash(s.name, i));
  return {
    options,
    description: "All the Segments the User belongs to in Hull",
    label: "Hull Segments",
    groupName: "hull",
    fieldType: "checkbox",
    formField: false,
    name: "hull_segments",
    type: "enumeration",
    displayOrder: 0
  };
}

module.exports = class Hubspot {

  constructor({ clientID, /* clientSecret, */ ship = {}, hull }) {
    const { private_settings = {} } = ship;
    const { token, refresh_token, portal_id } = private_settings;
    this.ship = ship;
    this.token = token;
    this.refresh_token = refresh_token;
    this.portal_id = portal_id;
    this.hull = hull;
    const hubspot = new HubspotClient();
    this.hubspot = hubspot;

    hubspot.setAccessToken(token);
    hubspot.setRefreshToken(refresh_token);
    hubspot.setClientId(clientID);
  }

  saveSettings(settings = {}) {
    return this.hull.put(this.ship.id, {
      private_settings: {
        ...this.ship.private_settings,
        ...settings
      }
    });
  }

  refreshToken() {
    return new Promise((resolve, reject) => {
      this.hubspot.refreshAccessToken((err, token) => {
        if (err) return reject(err);
        this.token = token;
        this.hubspot.setAccessToken(token);
        return this.saveSettings({ token })
        .then(() => resolve(token));
      });
    });
  }

  perform(obj, method, ...args) {
    return new Promise((resolve, reject) => {
      const o = this.hubspot[obj] || {};
      const methodCall = o[method];
      if (!methodCall) {
        reject({ error: "no such method", obj, method });
        return;
      }
      methodCall(...args, (error, response) => {
        this.hull.logger.info(`${obj}.${method}.response`, response);
        if (error) {
          console.log(error);
          // Token expired: refresh
          return this.refreshToken()
          .then(methodCall(...args, (err, res) => {
            if (err) return reject(error);
            return resolve(res);
          }));
        }
        return resolve(response);
      });
    });
  }

  updateUser({ user, segments }) {
    const { email } = user;
    if (email) {
      const properties = [{
        property: "hull_segments",
        value: _.map(segments, "name").join(", ")
      }];
      return this.perform("contacts", "createOrUpdate", { properties }, email)
      .then((res) => {
        console.log('Update Userd', res);
        this.hull.as(user.id).traits({ id: res.vid }, { source: "hubspot" });
      }, (err) => console.log(err));
    }
    return Promise.reject({ error: "no_email " });
  }

  syncHullGroup(props = []) {
    return Promise.all([
      this.getHullSegments(),
      this.perform("contactPropertiesGroups", "get", { includeProperties: true })
    ]).then(([segments = [], hubspotGroups]) => {
      const hullSegmentsProperty = buildHullSegmentsProperty(segments);
      const hullGroup = {
        ...HULL_GROUP,
        properties: [hullSegmentsProperty, ...props]
      };

      const hubspotHullGroup = _.find(hubspotGroups, g => g.name === "hull");

      let groupPromise;
      if (hubspotHullGroup) {
        groupPromise = this.perform("contactPropertiesGroups", "update", hullGroup, "hull");
      } else {
        groupPromise = this.perform("contactPropertiesGroups", "create", hullGroup);
      }

      return groupPromise.then(() => {
        const ppt = hubspotHullGroup && _.find(hubspotHullGroup.properties, p => p.name === "hull_segments");
        if (ppt) {
          return this.perform("contactProperties", "update", hullSegmentsProperty, hullSegmentsProperty.name);
        }
        return this.perform("contactProperties", "create", hullSegmentsProperty);
      });

    }, err => this.hull.logger.error("hubspot.group.sync.failed", err));
  }

  getHullSegments() {
    return this.hull.get("segments", { limit: 500 });
  }

};
