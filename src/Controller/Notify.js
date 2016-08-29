import { NotifHandler } from "hull";

export default class UserUpdateStrategy {
  userUpdateHandler(payload, { req }) {
    const message = payload.message;

    const { user } = message;

    return req.app.hullAgent.shouldSyncUser(user)
      && req.app.QueueAgent.create("exportUsersJob", [user]);
  }

  shipUpdateHandler(payload, { req }) {
    const message = payload.message;
  }
}
