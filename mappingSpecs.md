## A `mapping` utility

Mapping should map data both ways between Hull and Hubspot data structures

```javascript
// deps:
// it should have a dependency on hull ship settings

/**
 * Returns the Hubspot properties names.
 * When doing a sync we need to download only those
 * @return {Array}
 */
function getHubspotPropertiesKeys() {
    return ["property_name", "property2_name"];
}

/**
 * Maps Hubspot contact properties to Hull traits
 * @param  {Object} userData Hubspot contact
 * @return {Object}          Hull user traits
 */
function getHullTraits(userData) {
    return {
        trait_name: userData.properties.property_name.value,
        trait2_name: userData.properties.property2_name.value,
        id: userData.properties.vid.value,
        fetched_at: new Date()
    };
}

/**
 * Map Hull user data to Hubspot contact properties
 * @see http://developers.hubspot.com/docs/methods/contacts/update_contact
 * @param  {Object} userData Hull user object
 * @return {Array}           Hubspot properties array
 */
function getHubspotProperties(userData) {
    return [{
        "property": "email",
        "value": userData.email
    }, {
        "property": "firstname",
        "value": userData.firstname
    }];
}
```
