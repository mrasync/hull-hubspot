export default class ImportController {

  /**
   * creates or updates users
   * @see https://www.hull.io/docs/references/api/#endpoint-traits
   * @param  {Array} Hubspot contacts
   * @return {Promise}
   */
  importContactsJob(req) {
    const contacts = req.payload.contacts;
    return req.app.hullAgent.importContacts(contacts);
  }
}
