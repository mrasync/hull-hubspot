## A button to "Fetch all" customers from Hubspot

Will fetch all customers from Hubspot, using Batching if needed, and store their properties in Hull customers, upserting those that already exist (found by email)

```javascript

// deps:
// this.hull
// this.hubspot
// this.mapping
// this.queue

function fetchAllAction() {
    return this.getContacts();
}

/**
 * Get 100 hubspot contacts and queues their import
 * and getting another 100 - needs to be processed in one queue without
 * any concurrency
 * @see http://developers.hubspot.com/docs/methods/contacts/get_contacts
 * @param  {Number} [count=100]
 * @param  {Number} [offset=0]
 * @return {Promise}
 */
function getContacts(count = 100, offset = 0) {

    if (count > 100) {
        return this.hull.logger.error("getContact gets maximum of 100 contacts at once", count);
    }

    const properties = this.mapping.getProperties();

    hubspot.get("/contacts/v1/lists/all/contacts/all", {
        count,
        vidOffset: offset,
        property: properties
    }, (res) => {
        if (res["has-more"]) {
            this.queue("getContacts", count, res["vid-offset"]);
        }

        if (res.body.contacts > 0) {
            this.queue("importContacts", res.contacts);
        }
    });
}

/**
 * creates or updates users
 * @see https://www.hull.io/docs/references/api/#endpoint-identities-create-a-user-with-email-and-password
 * @see https://www.hull.io/docs/references/api/#endpoint-traits
 * @param  {Array} Hubspot contacts
 * @return {Promise}
 */
function importContacts(contacts) {
    return contact.map((c) => {
        const email = _.find(c.identities, { type: "EMAIL" }).value;
        (function() {
            if (!c.properties.hull_id) {
                // create hull user
                return this.hull.api('/users', 'post', {
                  "email": email,
                  "password": "s3cr3t"
                });
            }
            return Promise.resolve(c);
        })().then(c => {
            const traits = this.mapping.getTraits(c);
            return this.hull.as({ email }).traits(traits, { source: "hubspot "});
        })

    });
}

/**
 * Hubspot properies names
 * @return {Array}
 */
function getProperties() {
    return ["property_name", "property2_name"];
}

function getTraits(userData) {
    return {
        trait_name: userData.properties.property_name.value,
        trait2_name: userData.properties.property2_name.value,
        vid: userData.properties.vid.value,
        last_import_time: new Date()
    };
}
```
