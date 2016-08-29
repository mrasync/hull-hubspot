export default class UserUpdateStrategy {
  userUpdateHandler(payload, { req }) {
    const message = payload.message;

    const { user } = message;

    return req.app.hullAgent.shouldSyncUser(user)
      && req.app.queueAgent.create("exportUsersJob", [user]);
  }

  shipUpdateHandler(payload, { req }) {
    const message = payload.message;
    return req.app.hubspotAgent.syncHullGroup();
  }

  segmentUpdateHandler(payload, { req }) {
    const message = payload.message;
    return req.app.hubspotAgent.syncHullGroup();
  }

  segmentDeleteHandler(payload, { req }) {
    const message = payload.message;
    return req.app.hubspotAgent.syncHullGroup();
  }
}
