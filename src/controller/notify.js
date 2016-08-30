import Promise from "bluebird";
import BatchSyncHandler from "../lib/batch-sync-handler";
import _ from "lodash";

export default class UserUpdateStrategy {
  userUpdateHandler(payload, { req }) {
    const message = payload.message;

    const { user, changes = {} } = message;

    if (_.get(changes, "user['traits_hubspot/fetched_at'][1]", false)) {
      return Promise.resolve();
    }

    return BatchSyncHandler.getHandler({
      hull: req.hull,
      ship: req.hull.ship,
      options: {
        maxSize: 100,
        throttle: 30000
      }
    }).setCallback((users) => {
      return req.shipApp.queueAgent.create("exportUsersJob", { users });
    })
    .add(user);

  }

  shipUpdateHandler(payload, { req }) {
    const message = payload.message;
    return req.shipApp.hubspotAgent.syncHullGroup();
  }

  segmentUpdateHandler(payload, { req }) {
    const message = payload.message;
    return req.shipApp.hubspotAgent.syncHullGroup();
  }

  segmentDeleteHandler(payload, { req }) {
    const message = payload.message;
    return req.shipApp.hubspotAgent.syncHullGroup();
  }
}
