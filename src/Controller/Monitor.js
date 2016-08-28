export default class MonitorController {

  checkTokenAction(req, res) {
    return req.app.hubspotAgent.checkToken()
      .then((status) => res.end(status));
  }
}
