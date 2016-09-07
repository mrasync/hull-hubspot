import _ from "lodash";
import Promise from "bluebird";
import moment from "moment";

export default class progressAgent {
  constructor(ship, hullClient) {
    this.ship = ship;
    this.hullClient = hullClient;
  }

  start() {
    return this.hullClient.put(this.ship.id, {
      private_settings: {
        ...this.ship.private_settings,
        last_fetch_started_at: moment().utc().format(),
        is_fetch_completed: false,
        fetch_count: 0
      }
    });
  }

  update(newProgress) {
    return this.hullClient.put(this.ship.id, {
      private_settings: {
        ...this.ship.private_settings,
        fetch_count: newProgress
      }
    });
  }

  finish() {
    return this.hullClient.put(this.ship.id, {
      private_settings: {
        ...this.ship.private_settings,
        is_fetch_completed: true
      }
    });
  }
}
