# Token Introspection and App Specific Passwords Sample

  * [Overview](#overview)
  * [App Specific Passwords flow](#app-specific-passwords-flow)
  * [Oauth/introspect Endpoint Authentication](#oauthintrospect-endpoint-authentication)
  * [Pre-requisites](#pre-requisites)
    + [Setup .env](#setup-env)
    + [Generate Signing Key Pair](#generate-signing-key-pair)
    + [Update Resource Server verificationKey](#update-resource-server-verificationkey)
    + [Setup the Client Grant for App Specific Password](#setup-the-client-grant-for-app-specific-password)
  * [Create, View, and Delete App Specific Passwords](#create-view-and-delete-app-specific-passwords)
  * [Invoke Introspection Endpoint](#invoke-introspection-endpoint)

## Overview

This project demonstrates Token Introspection and App Specific Passwords. The goal is to assist in setting up the Management Client (to be able to manage App Specific Passwords) and Resource Server on the Auth0 side, and demonstrating using the introspection endpoint to introspect an App Specific Password (or any other kind of token).

## App Specific Passwords flow

When using App Specific Passwords, there are several different use cases and scenarios. One use case is treating them as bearer tokens. So your API consumes App Specific Passwords the same way it would consume any other Bearer token (JWT or otherwise). The only difference is that with a JWT access token, it is not necessary to call to Auth0 to ask about the token's validity - the API can verify its validity on its own (by checking the signature). With App Specific Passwords, your API (the Resource Server) needs to ask Auth0 (the Authorization Server) if the token is valid (and for any claims associated with the token).

## Oauth/introspect Endpoint Authentication

When invoking the `/oauth/introspect` endpoint, the Resource Server (RS) needs to supply (in addition to the `token`) a `client_assertion_type: urn:ietf:params:oauth:client-assertion-type:jwt-bearer` along with the actual `client_assertion` which is a JWT signed with the RS's private key. The Authorization Server (AS) will validate the signature using the associated public key. There are three ways the AS will obtain the public key:

- The `verificationKey` defined on the RS record in Auth0. This is either a JWK or Pem-encoded cert
- The `verificationLocation` defined on the RS record in Auth0. This is a uri from which Auth0 will attempt to fetch the keys, expecting JWKs.
- If the RS record in Auth0 has an identifier in URI format (e.g. `http://foo.com`), then Auth0 will attempt to load `http://foo.com/.well-known/jwks.json`.

Therefore, one of the pre-requisite steps before using Token Introspection is creating a key pair for your RS, and updating the RS record in Auth0 with the Public Key. This example assumes the use of the `verificationKey` property on the RS defined in Auth0.

## Pre-requisites

The following steps should be completed prior to using the App Specific Passwords or Token Introspection samples.

### Setup .env

Be sure to populate all of the provided params in `.env`. You can rename the provided `.env.sample` as `.env` and make your changes.

### Generate Signing Key Pair

You can use `generateKey.js` to create a key pair. The result is saved in `signingKey.json`. The `signingKey.key` will be used to sign the assertion JWT and the `signingKey.cert` will be configured as the `verificationKey` in Auth0. 

### Update Resource Server verificationKey

To set the `verificationKey` for the Resource Server, you can use the Auth0 Management API:

```
curl -X POST -H "Authorization: Bearer YOUR_API_TOKEN" -H "Content-Type: application/json" -d '{
  "verificationKey": "your public key"
}' "https://tenant.auth0.com/api/v2/resource-servers/RESOURCE_SERVER_ID"
```

Or, you can use the provided `setupResourceServer.js` to do the same. Note that this only needs to be done initially when you create your key (or anytime in the future if you wish to change it).

### Setup the Client Grant for App Specific Password

Before invoking the Management API to create the App Specific Passwords, you need to make sure the Client you will be using with the Management API has been granted the appropriate scopes (read, create, delete:user_application_passwords). You can use `setupClientGrant.js` to make this change to a specific client (as defined in your `.env` file).

Note that this only needs to be done once per client.

## Create, View, and Delete App Specific Passwords

Now that you have setup your client grant, you can use `createAsp.js`, `getAsps.js`, and `deleteAsp.js` to create, view, and delete App Specific Passwords.

Keep in mind that when you create an App Specific Password, this is the only chance you will have to actually view the value (i.e. the token itself). It cannot be retrieved from Auth0 in subsequent API calls.

## Invoke Introspection Endpoint

Run `introspect.js` to test the introspection endpoint, with the token you want to introspect passed as a command line arguemtn. The token could be either a JWT or non-JWT access token, a refresh token, or an app specific password.

`node introspect my_token_value`

