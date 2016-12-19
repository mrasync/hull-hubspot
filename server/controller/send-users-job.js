import Promise from "bluebird";

import { collectValidUsers, collectUsersProperties } from "../helpers/users";
import { log, info, warn } from "../helpers/log";
import { SEND_USERS_JOB_OK_LIMIT } from "../constants";

function getUsers(req) {
  return req.payload.users || [];
}

function getSegments(req) {
  return req.shipApp.hullAgent.getSegments();
}

function processSegments(req, segments, users) {
  const getProperties = req.shipApp.mapping.getHubspotProperties.bind(null, segments);
  const body = collectUsersProperties(users, getProperties);
  req.shipApp.instrumentationAgent.metricVal("send_users", body.length, req.hull.ship);
  return req.shipApp.hubspotAgent.batchUsers(body);
}

function skip(req) {
  log(req, "skip sendUsersJob - empty users list");
  return Promise.resolve();
}

function logSendUsersJob(req, users) {
  log(req, "sendUsersJob", { count_users: users.length });
}

function checkUserOKLimit(req, userCount) {
  if (userCount > SEND_USERS_JOB_OK_LIMIT) {
    warn(req, `sendUsersJob works best for under ${SEND_USERS_JOB_OK_LIMIT} users at once`, userCount);
  }
}

function logError(req, statusCode, body) {
  warn(req, "Error in sendUsersJob", { statusCode, body });
}

function logBatchError(req, err) {
  info(req, "Hubspot batch error", err);
}

function processResponseError(req, err) {
  logBatchError(req, err);
  return Promise.reject(err);
}

function processResponseOK(req, res) {
  if (res === null) {
    return Promise.resolve();
  }

  const { statusCode, body } = res;

  if (statusCode === 202) {
    return Promise.resolve();
  }

  logError(req, statusCode, body);
  return Promise.reject(new Error("Error in create/update batch"));
}


function processUsers(req, users) {
  logSendUsersJob(req, users);
  checkUserOKLimit(req, users.length);
  return getSegments(req)
    .then(segments => processSegments(req, segments, users))
    .then(
      res => processResponseOK(req, res),
      err => processResponseError(req, err)
    );
}

/**
   * Sends Hull users to Hubspot contacts using create or update strategy.
   * The job on Hubspot side is done async the returned Promise is resolved
   * when the query was queued successfully. It is rejected when:
   * "you pass an invalid email address, if a property in your request doesn't exist,
   * or if you pass an invalid property value."
   * @see http://developers.hubspot.com/docs/methods/contacts/batch_create_or_update
   * @param  {Array} users users from Hull
   * @return {Promise}
   */
export default function sendUsersJob(req) {
  const users = collectValidUsers(getUsers(req));
  if (users.length === 0) {
    return skip(req);
  }
  return processUsers(req, users);
}
