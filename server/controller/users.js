import Promise from "bluebird";

export default class UsersController {
  /**
   * Sends Hull users to Hubspot contacts using create or update strategy.
   * The job on Hubspot side is done async the returned Promise is resolved
   * when the query was queued successfully. It is rejected when:
   * "you pass an invalid email address, if a property in your request doesn't exist,
   * or if you pass an invalid property value."
   * @see http://developers.hubspot.com/docs/methods/contacts/batch_create_or_update
   * @param  {Array} users users from Hull
   * @return {Promise}
   */
  sendUsersJob(req) {
    const users = req.payload.users;
    req.hull.client.logger.log("sendUsersJob", users.length);
    if (users.length > 100) {
      req.hull.client.logger.warning("sendUsersJob works best for under 100 users at once", users.length);
    }

    req.shipApp.hullAgent.getSegments()
      .then(segments => {
        const body = users.map((user) => {
          const properties = req.shipApp.mapping.getHubspotProperties(segments, user);
          return {
            email: user.email,
            properties
          };
        });

        return req.shipApp.hubspotClient.post("/contacts/v1/contact/batch/")
          .query({
            auditId: "Hull"
          })
          .set("Content-Type", "application/json")
          .send(body);
      })
      .then(res => {
        req.hull.client.logger.info("Hubspot batch statusCode", res.statusCode);

        if (res.statusCode === 202) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Error in create/update batch"));
      }, (err) => {
        req.hull.client.logger.info("Hubspot batch error", err);
      });
  }

  /**
   * creates or updates users
   * @see https://www.hull.io/docs/references/api/#endpoint-traits
   * @param  {Array} Hubspot contacts
   * @return {Promise}
   */
  saveContactsJob(req) {
    const contacts = req.payload.contacts;
    return req.shipApp.hullAgent.saveContacts(contacts);
  }
}
