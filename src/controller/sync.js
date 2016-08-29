export default class SyncStrategy {

  syncAction(req, res) {
    const count = 100;
    return req.app.hullAgent.getLastUpdate()
        .then((lastImportTime) => {
          console.log(lastImportTime);
          return req.app.queueAgent.create("syncJob", {
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

    return req.app.hubspotAgent.getRecentContacts(lastImportTime, count, offset)
      .then((res) => {
        const promises = [];

        if (res.body["has-more"] && res.body.contacts.length > 0) {
          promises.push(req.app.queueAgent.create("syncJob", {
            lastImportTime, count, offset: res.body["vid-offset"]
          }));
        }

        if (res.body.contacts.length > 0) {
          promises.push(req.app.queueAgent.create("importContactsJob", {
            contacts: res.body.contacts
          }));
        }

        return Promise.all(promises);
      });
  }
}
