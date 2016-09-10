export default class MonitorController {

  checkTokenAction(req, res) {
    req.shipApp.hubspotAgent.checkToken();
    res.end(status);
  }
}
