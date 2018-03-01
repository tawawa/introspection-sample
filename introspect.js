const signingKey = require('./signingKey.json');
const jwt = require('jsonwebtoken');
const request = require('superagent-bluebird-promise');
require('dotenv').config();

// used for local testing, never do this in a production env
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

function generateAssertion(rsIdentifier, tenantUrl) {

  const jwtPayload = {
    iss: rsIdentifier,
    sub: rsIdentifier,
    aud: `${process.env.AUTH0_TENANT}/`,
    exp: Math.floor(Date.now() / 1000) + (60), // 60 seconds
  };

  // generate a jwt and sign it with the private key
  return jwt.sign(jwtPayload, signingKey.key, { keyid: "123", algorithm: 'RS256'});
}

function introspectToken(token) {

  var signedAssertionJwt = generateAssertion(process.env.RESOURCE_SERVER_IDENTIFIER, process.env.AUTH0_TENANT);

  // invoke token introspection
  request
   .post(`${process.env.AUTH0_TENANT}/oauth/introspect`)
   .send({ 
      token: token, 
      client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
      client_assertion: signedAssertionJwt })
   .then(res => {
    console.log(res.body);
  })
  .catch(err => {
    console.log(err.body);
  });
}

/**
Example:
node demo {token to introspect}
**/
if (process.argv.length < 3) {
  console.log("Expected 1 arguments: node demo {token to introspect}");
  process.exit(0);
}

const args = process.argv.slice(2);

// args[0] contains the token to introspect
introspectToken(args[0]);
