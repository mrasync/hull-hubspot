import Promise from "bluebird";

export default class FetchAllController {

  /**
   * public facing method
   * @return {Promise}
   */
  fetchAllAction(req, res) {
    const count = 100;
    return req.app.queueAgent.create("fetchAllJob", {
      count
    })
    .then(() => res.end("ok"));
  }

  /**
   * Job which performs fetchAll operations queues itself and the import job
   * @param  {Number} count
   * @param  {Number} [offset=0]
   * @return {Promise}
   */
  fetchAllJob(req) {
    const count = req.payload.count;
    const offset = req.payload.offset || 0;

    return req.app.hubspotAgent.getContacts(count, offset)
      .then((data) => {
        const promises = [];
        if (data.body["has-more"]) {
          promises.push(req.app.queueAgent.create("fetchAllJob", {
            count,
            offset: data.body["vid-offset"]
          }));
        }

        if (data.body.contacts.length > 0) {
          promises.push(req.app.queueAgent.create("importContactsJob", {
            contacts: data.body.contacts
          }));
        }
        return Promise.all(promises);
      });
  }
}
