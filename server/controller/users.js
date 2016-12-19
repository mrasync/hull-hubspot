import Promise from "bluebird";

import { collectValidUsers, collectUsersProperties } from "../helpers/users";
import { log, info, warn } from "../helpers/log";
import { SEND_USERS_JOB_OK_LIMIT } from "../constants";

export default class UsersController {
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
  sendUsersJob(req) {
    const users = collectValidUsers(this._getUsers(req));
    if (users.length === 0) {
      return this._skip(req);
    }
    return this._processUsers(req, users);
  }

  /**
   * creates or updates users
   * @see https://www.hull.io/docs/references/api/#endpoint-traits
   * @param  {Array} Hubspot contacts
   * @return {Promise}
   */
  saveContactsJob(req) {
    const contacts = req.payload.contacts;
    req.shipApp.instrumentationAgent.metricVal("save_contact", contacts.length, req.hull.ship);
    return req.shipApp.hullAgent.saveContacts(contacts);
  }

  _getUsers(req) {
    return req.payload.users || [];
  }

  _processUsers(req, users) {
    this._logSendUsersJob(req, users);
    this._checkUserOKLimit(req, users.length);
    return this._getSegments(req)
      .then(segments => this._processSegments(req, segments, users))
      .then(
        res => this._processResponseOK(req, res),
        err => this._processResponseError(req, err)
      );
  }

  _getSegments(req) {
    return req.shipApp.hullAgent.getSegments();
  }

  _processSegments(req, segments, users) {
    const getProperties = req.shipApp.mapping.getHubspotProperties.bind(null, segments);
    const body = collectUsersProperties(users, getProperties);
    req.shipApp.instrumentationAgent.metricVal("send_users", body.length, req.hull.ship);
    return req.shipApp.hubspotAgent.batchUsers(body);
  }

  _processResponseOK(req, res) {
    if (res === null) {
      return Promise.resolve();
    }

    const { statusCode, body } = res;

    if (statusCode === 202) {
      return Promise.resolve();
    }

    this._logError(req, statusCode, body);
    return Promise.reject(new Error("Error in create/update batch"));
  }

  _processResponseError(req, err) {
    this._logBatchError(req, err);
    return Promise.reject(err);
  }

  _skip(req) {
    log(req, "skip sendUsersJob - empty users list");
    return Promise.resolve();
  }

  _logSendUsersJob(req, users) {
    log(req, "sendUsersJob", { count_users: users.length });
  }

  _checkUserOKLimit(req, userCount) {
    if (userCount > SEND_USERS_JOB_OK_LIMIT) {
      warn(req, `sendUsersJob works best for under ${SEND_USERS_JOB_OK_LIMIT} users at once`, userCount);
    }
  }

  _logError(req, statusCode, body) {
    warn(req, "Error in sendUsersJob", { statusCode, body });
  }

  _logBatchError(req, err) {
    info(req, "Hubspot batch error", err);
  }
}
