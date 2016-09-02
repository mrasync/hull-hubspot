export default class SyncStrategy {

  syncAction(req, res) {
    const count = 100;
    return req.shipApp.hullAgent.getLastUpdate()
        .then((lastImportTime) => {
          req.hull.client.logger.info("syncAction.lastImportTime", lastImportTime);
          return req.shipApp.queueAgent.create("syncJob", {
            lastImportTime,
            count
          });
        })
        .then(() => res.end("ok"));
  }

  syncJob(req) {
    const lastImportTime = req.payload.lastImportTime;
    const count = req.payload.count || 100;
    const offset = req.payload.offset || 0;

    return req.shipApp.hubspotAgent.getRecentContacts(lastImportTime, count, offset)
      .then((res) => {
        const promises = [];

        if (res.body["has-more"] && res.body.contacts.length > 0) {
          promises.push(req.shipApp.queueAgent.create("syncJob", {
            lastImportTime, count, offset: res.body["vid-offset"]
          }));
        }

        if (res.body.contacts.length > 0) {
          promises.push(req.shipApp.queueAgent.create("saveContactsJob", {
            contacts: res.body.contacts
          }));
        }

        return Promise.all(promises);
      });
  }
}
