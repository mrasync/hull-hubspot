export default function saveContactsJob(req) {
  const contacts = req.payload.contacts;
  req.shipApp.instrumentationAgent.metricVal(
    "save_contact", contacts.length, req.hull.ship);
  return req.shipApp.hullAgent.saveContacts(contacts);
}
