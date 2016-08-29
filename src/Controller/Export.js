import Promise from "bluebird";

export default class ExportController {
  /**
   * Exports Hull users to Hubspot contacts using create or update strategy.
   * The job on Hubspot side is done async the returned Promise is resolved
   * when the query was queued successfully. It is rejected when:
   * "you pass an invalid email address, if a property in your request doesn't exist,
   * or if you pass an invalid property value."
   * @see http://developers.hubspot.com/docs/methods/contacts/batch_create_or_update
   * @param  {Array} users users from Hull
   * @return {Promise}
   */
  exportUsersJob(req) {
    const users = req.payload.users;
    console.log("exportUsersJob", users.length);
    if (users.length > 100) {
      req.hull.client.logger.warning("exportUsers works best for under 100 users at once", users.count);
    }

    const body = users.map((user) => {
      user["hubspot/first_name"] = "John";
      user["hubspot/last_name"] = "Doe";
      const properties = req.app.mapping.getHubspotProperties(user);
      return {
        email: user.email,
        properties
      };
    });

    return req.app.hubspotClient.post("/contacts/v1/contact/batch/")
      .query({
        auditId: "Hull"
      })
      .set("Content-Type", "application/json")
      .send(body)
      .then(res => {
        if (res.statusCode === 202) {
          return Promise.resolve();
        }
        return Promise.reject(new Error("Error in create/update batch"));
      });
  }
}
