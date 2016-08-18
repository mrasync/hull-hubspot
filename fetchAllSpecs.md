## A button to "Fetch all" customers from Hubspot

Will fetch all customers from Hubspot, using Batching if needed, and store their properties in Hull customers, upserting those that already exist (found by email)

```javascript

function fetchAllAction() {
    return getContacts();
}
/**
 * Get 100 hubspot contacts and queues their import
 * and getting another 100 - needs to be processed in one queue without
 * any concurrency
 * @param  {Number} [count=100]
 * @param  {Number} [offset=0]
 * @return {Promise}
 */
function getContacts(count = 100, offset = 0) {
    const properties = mapping.getProperties();

    hubspot.get("/contacts/v1/lists/all/contacts/all", {
        count,
        vidOffset: offset,
        property: properties
    }, (res) => {
        if (res["has-more"]) {
            queue("getContacts", res["vid-offset"]);
        }

        if (res.contacts > 0) {
            queue("importContacts", res.contacts);
        }
    });
}

/**
 * creates or updates users
 * @param  {Array} contacts
 * @return {Promise}
 */
function importContacts(contacts) {
    return contact.map((c) => {
        const email = _.find(c.identities, { type: "EMAIL" }).value;
        (function() {
            if (!c.properties.hull_id) {
                // create hull user
                return Hull.api('/users', 'post', {
                  "email": email,
                  "password": "s3cr3t"
                });
            }
            return Promise.resolve(c);
        }).then(c => {
            const traits = mapping.getTraits(c);
            return hull.as({ email }).traits(traits, { source: "hubspot "});
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
        last_import_time: new Date()
    };
}
```
