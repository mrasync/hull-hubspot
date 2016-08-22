## A `/batch` endpoint

The bath will handle the batch operation syncing users from Hull to Hubspot

```javascript
// deps:
// this.hull
// this.hubspot
// this.mapping
// this.queue

function batchAction(req) {
    return handleExtract(req.body, 100, (usersBatch) => {
        this.queue("exportUsers", usersBatch);
    });
}

/**
 * Creates or updates
 * @see http://developers.hubspot.com/docs/methods/contacts/batch_create_or_update
 * @param  {Array} users users from Hull
 * @return {Promise}
 */
function exportUsers(users) {

    if (users.count > 100) {
        this.hull.logger.warning("exportUsers works best for under 100 users at once", users.count);
    }

    const body = users.map((user) => {
        const properties = this.mapping.getHubspotProperties(user);
        return {
            email: user.email,
            properties
        };
    });

    return this.hubspot.post(`/contacts/v1/contact/batch/`, body);
}

```
