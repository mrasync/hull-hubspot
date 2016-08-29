import { Strategy as HubspotStrategy } from "passport-hubspot";

export default class WebRoutes {
  constructor(deps) {
    this.deps = deps;
  }

  setup(webApp) {
    const {
      Hull,
      batchController,
      monitorController,
      fetchAllController,
      importController,
      exportController,
      notifyController,
      syncController
    } = this.deps;

    const { NotifHandler, OAuthHandler, Routes } = Hull;
    const { Readme, Manifest } = Routes;

    webApp.set("views", `${__dirname}/../../views`);
    webApp.set("view engine", "ejs");

    webApp.get("/manifest.json", Manifest(`${__dirname}/..`));
    webApp.get("/", Readme);
    webApp.get("/readme", Readme);

    webApp.post("/batch", batchController.handleBatchExtractAction.bind(batchController));
    webApp.post("/fetchAll", fetchAllController.fetchAllAction.bind(fetchAllController));
    webApp.post("/sync", syncController.syncAction.bind(syncController));

    webApp.post("/notify", NotifHandler({
      hostSecret: process.env.SECRET || "1234",
      groupTraits: false,
      handlers: {
        "user:update": notifyController.userUpdateHandler.bind(notifyController),
        "ship:update": notifyController.shipUpdateHandler.bind(notifyController),
      }
    }));

    webApp.get("/monitor/checkToken", monitorController.checkTokenAction.bind(monitorController));

    webApp.use("/auth", OAuthHandler({
      hostSecret: process.env.SECRET || "1234",
      name: "Hubspot",
      Strategy: HubspotStrategy,
      options: {
        clientID: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        scope: ["offline", "contacts-rw", "events-rw"],
        skipUserProfile: true
      },
      isSetup(req, { /* hull,*/ ship }) {
        if (req.query.reset) return Promise.reject();
        const { token } = ship.private_settings || {};
        return (token) ? Promise.resolve() : Promise.reject();
      },
      onLogin: (req, { hull, ship }) => {
        req.authParams = { ...req.body, ...req.query };
        return save(hull, ship, {
          portalId: req.authParams.portalId
        });
      },
      onAuthorize: (req, { hull, ship }) => {
        const { refreshToken, accessToken } = (req.account || {});
        return save(hull, ship, {
          refresh_token: refreshToken,
          token: accessToken
        });
      },
      views: {
        login: "login.html",
        home: "home.html",
        failure: "failure.html",
        success: "success.html"
      },
    }));

    return webApp;
  }
}
