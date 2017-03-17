/**
Update resource server with verificationKey
**/

const jwt = require('jsonwebtoken');
const request = require('superagent-bluebird-promise');
const signingKey = require('./signingKey.json');
require('dotenv').config();

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
  // now we have a token, patch the resource server
  return request
    .get(`${process.env.AUTH0_MGMTAPI_IDENTIFIER}resource-servers`)
    .set('Authorization', 'Bearer ' + accessToken)
    .send();
}).then(res => {
 
  let selectedResourceServer = res.body.filter(function(resourceServer) {
    return resourceServer.identifier === process.env.RESOURCE_SERVER_IDENTIFIER;
  }).reduce(function (acc, obj) {
    return obj;
  });

  return request
    .patch(`${process.env.AUTH0_MGMTAPI_IDENTIFIER}resource-servers/${selectedResourceServer.id}`)
    .set('Authorization', 'Bearer ' + accessToken)
    .send({
      verificationKey: signingKey.cert
    });
}).then(res => {
  if (res.statusCode !== 200) {
    throw new Error(res);
  }
  console.log('Resource Server updated');
})
.catch(err => {
  console.log(err.message);
});