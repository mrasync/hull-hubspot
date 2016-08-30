import BatchSyncHandler from "../lib/batch-sync-handler";

export default class UserUpdateStrategy {
  userUpdateHandler(payload, { req }) {
    const message = payload.message;

    const { user } = message;

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
