export default class MonitorController {

  checkTokenAction(req, res) {
    return req.shipApp.hubspotAgent.checkToken()
      .then((status) => res.end(status));
  }
}
