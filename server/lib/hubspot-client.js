import request from "superagent";
import prefixPlugin from "superagent-prefix";
import superagentPromisePlugin from "superagent-promise-plugin";

export default class HubspotClient {
  constructor({ accessToken, refreshToken, hullClient }) {
    this.hullClient = hullClient;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.req = request;
  }

  attach(req) {
    return req
      .use(prefixPlugin("https://api.hubapi.com"))
      .use(superagentPromisePlugin)
      .query({ access_token: this.accessToken })
      .on("request", (reqData) => {
        this.hullClient.logger.info("hubspotClient.req", reqData.url);
      });
  }

  get(url) {
    const req = this.req.get(url);
    return this.attach(req);
  }

  post(url) {
    const req = this.req.post(url);
    return this.attach(req);
  }

  put(url) {
    const req = this.req.put(url);
    return this.attach(req);
  }

  refreshAccessToken() {
    return this.attach(this.req
      .post("/auth/v1/refresh"))
      .set("Content-Type", "application/x-www-form-urlencoded")
      .send({
        refresh_token: this.refreshToken,
        client_id: process.env.CLIENT_ID,
        grant_type: "refresh_token"
      });
  }
}
