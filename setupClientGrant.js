/**
Update a client in Auth0 with the appropriate client grant for user_application_password scopes
**/

const jwt = require('jsonwebtoken');
const request = require('superagent-bluebird-promise');
require('dotenv').config();

// used for local testing, never do this in a production env
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

let accessToken;

// authenticate
request
.post(`${process.env.AUTH0_TENANT}/oauth/token`)
.send({ 
  grant_type: 'client_credentials',
  client_id: process.env.AUTH0_MGMTAPI_CLIENTID, 
  client_secret: process.env.AUTH0_MGMTAPI_CLIENTSECRET,
  audience: process.env.AUTH0_MGMTAPI_IDENTIFIER
}).then(res => {
  accessToken = res.body.access_token;
  if (!accessToken) {
    throw new Error('Unable to obtain access token');
  }
  // now we have a token, get the client grants and find the one to update
  return request
    .get(`${process.env.AUTH0_MGMTAPI_IDENTIFIER}client-grants`)
    .set('Authorization', 'Bearer ' + accessToken)
    .send();
}).then(res => {
  let selectedClientGrant = res.body.filter(function(clientGrant) {
    return (clientGrant.client_id === process.env.AUTH0_MGMTAPI_CLIENTID && clientGrant.audience === process.env.AUTH0_MGMTAPI_IDENTIFIER);
  }).reduce(function (acc, obj) {
    return obj;
  });

  if (!selectedClientGrant) {
    throw new Error('Client grant not found');
  }

  // take this client grant and patch it
  var scope = selectedClientGrant.scope;

  if (selectedClientGrant.scope.indexOf('read:user_application_passwords') < 0) {
    scope.push('read:user_application_passwords');
  }

  if (selectedClientGrant.scope.indexOf('create:user_application_passwords') < 0) {
    scope.push('create:user_application_passwords');
  }

  if (selectedClientGrant.scope.indexOf('delete:user_application_passwords') < 0) {
    scope.push('delete:user_application_passwords');
  }

  return request
    .patch(`${process.env.AUTH0_MGMTAPI_IDENTIFIER}client-grants/${selectedClientGrant.id}`)
    .set('Authorization', 'Bearer ' + accessToken)
    .send({
      scope: scope
    });
}).then(res => {
  if (res.statusCode !== 200) {
    throw new Error(res);
  }
  console.log('Client grant updated');
})
.catch(err => {
  console.log(err.message);
});