## A regularly scheduled sync (as frequent as possible)

To fetch all new and updated customers in Hubspot and store them as Hull users and update those already in there.

```javascript

// deps:
// this.hull
// this.hubspot
// this.mapping
// this.queue

function syncAction() {
    return this.getLastUpdate()
        .then(this.getRecentContacts);
}

/**
 * Get information about last import done from hubspot
 * @return {Promise -> lastImportTime (ISO 8601)} 2016-08-04T12:51:46Z
 */
function getLastUpdate() {
    this.hull.get("/search/user_reports", {
        include: ["hubspot/last_import_time"],
        sort: {
            hubspot/last_import_time: "desc"
        },
        per_page: 1
    })
    .then((r) => r.data[0]['traits_hubspot/last_import_time']);
}

/**
 * Get most recent contacts and filters out these who last modification
 * time if older that the lastImportTime. If there are any contacts modified since
 * that time queues import of them and getting next chunk from hubspot API.
 * @see http://developers.hubspot.com/docs/methods/contacts/get_recently_updated_contacts
 * @param  {Date} lastImportTime
 * @param  {Number} [count=100]
 * @param  {Number} [offset=0]
 * @return {Promise}
 */
function getRecentContacts(lastImportTime, count = 100, offset = 0) {
    const properties = this.mapping.getProperties();

    this.hubspot.get("/contacts/v1/lists/recently_updated/contacts/recent", {
        count,
        vidOffset: offset,
        property: properties
    }, (res) => {
        const recentlyModified = res.contacts.filter((c) => {
            return moment(c.properties.lastmodifieddate).isAfter(lastImportTime);
        });

        if (recentlyModified.length > 0) {
            this.queue("getRecentContacts", lastImportTime, count, res["vid-offset"]);
            this.queue("importContacts", recentlyModified);
        }
    });
}
```
