/**
Get App Specific Passwords demo
**/

const jwt = require('jsonwebtoken');
const request = require('superagent-bluebird-promise');
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
  // now we have a token, get the ASPs
  return request
    .get(`${process.env.AUTH0_MGMTAPI_IDENTIFIER}users/${process.env.AUTH0_USER_ID}/application-passwords`)
    .set('Authorization', 'Bearer ' + accessToken)
    .send();
}).then(res => {
  console.log(res.body);
})
.catch(err => {
  console.log(err.body);
});