export default class UserUpdateStrategy {


  handleUserUpdate(payload, { hull, ship, req }) {
    const message = payload.message;

    const { user, changes = {}, segments = [] } = message;

    return req.app.hullAgent.shouldSyncUser(user)
      && req.app.QueueAgent.create("exportUsersJob", [user]);
  }

}
