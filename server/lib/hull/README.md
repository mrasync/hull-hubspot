In notification handlers we need to use `shipApp` property being
set by the `AppMiddleware`. The middleware should be run after
the Hull client middleware and this should happen after the ParseRequest middleware.
We need to now if we have the ship update message being processed, this causes
the ship cache to be updated.
So we to inject the AppMiddleware after the HullClient here in the notifyHandler.
Right now the copied file has the middleware turned off and assumes they are
added before using the handler.
