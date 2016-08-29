export default class UserUpdateStrategy {


  handleUserUpdate(payload, { req }) {
    const message = payload.message;

    const { user } = message;

    return req.app.hullAgent.shouldSyncUser(user)
      && req.app.QueueAgent.create("exportUsersJob", [user]);
  }

}
