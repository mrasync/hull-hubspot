export default class MonitorController {

  checkTokenAction(req, res) {
    return req.shipApp.queueAgent.create("checkTokenJob")
      .then((jobId) => res.end(`ok: ${jobId}`));
  }

  checkTokenJob(req) {
    return req.shipApp.hubspotAgent.checkToken();
  }
}
