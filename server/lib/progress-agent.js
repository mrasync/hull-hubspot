import moment from "moment";

export default class ProgressAgent {
  constructor(hullAgent, hullClient) {
    this.hullAgent = hullAgent;
    this.hullClient = hullClient;
  }

  start() {
    return this.hullAgent.updateShipSettings({
      last_fetch_started_at: moment().utc().format(),
      is_fetch_completed: false,
      fetch_count: 0
    });
  }

  update(newProgress) {
    return this.hullAgent.updateShipSettings({
      fetch_count: newProgress
    });
  }

  finish() {
    return this.hullAgent.updateShipSettings({
      is_fetch_completed: true
    });
  }
}
