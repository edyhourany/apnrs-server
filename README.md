# Apple Push Notification Rest Service (apnrs)
=============


APNRS has been developed as a private, scalable, autonomous and single-app push notification server. The main goal of this project is to be a standalone push solution for iOS apps.

[![Build Status](https://secure.travis-ci.org/TotenDev/apnrs-server.png?branch=master)](http://travis-ci.org/TotenDev/apnrs-server)

##Requirements

- [npm](https://github.com/isaacs/npm)
- [nodejs](https://github.com/joyent/node)
- mysql server connection

#####NPM Modules (install via `npm install`)
- [function-queue](https://github.com/TotenDev/function-queue)
- [node-restify](https://github.com/mcavage/node-restify)
- [mysql connector](https://github.com/felixge/node-mysql)
- [node_apns](https://github.com/TotenDev/node_apns)
- [tap](https://github.com/isaacs/node-tap)

##Installing

All Stable code will be on `master` branch, any other branch is designated to unstable codes. So if you are installing for production environment, use `master` branch for better experience.

To run APNRS you MUST have mysql server connection and [database configured](https://github.com/TotenDev/apnrs-server/raw/master/dev/createDB.sql). All credentials and preferences can be configured at `index.js` and are described [here](#configuration).

---
To use development gateways you must use the code below, so it'll use sandbox gateways to send push notifications.

```
process.env['apnsDev'] = "TRUE";
```

---

After configured your environment you can run commands below to start APNRS:

Download and install dependencies

	$ npm install

Start server
	
	$ 'node index.js' OR 'foreman start'

---
####HTTPS keys

All APNRS is forced to used `https` protocol. An pre-generated key and certificate are in `/dev/` folder, where it should be !! 
If you want to re-generate those keys, use `make_certificates` in `/dev/`. This is highly recommended for security purposes.

##Configuration

All Configuration is be done through `index.js` file in root directory.

Sample:
```
var APNRestServer = require('./lib/server.js');
APNRestServer({
  rest:{
    clientSecretUser:"clientOI",
    serverSecretUser:"serverIO",
    commonSecretPass:"man",
    serverPort:5432,
    requestLimit:100,
    cert:fs.readFileSync('./dev/certificate.pem').toString(),
    key:fs.readFileSync('./dev/privatekey.pem').toString()
  },database:{
    host:'localhost',
    user:'root',
    password:'root',
    database:'apnrs'
  },push:{
    cert:"cert",
    key:"key"
  }
});
```

---
##### REST Config
Connections are flagged as **service request** or **client request**. Server requests will allow  server credentials only, BUT client requests will allow both credentials.

- `rest.clientSecretUser` - Client request user credential to use with basic auth. **REQUIRED**
- `rest.serverSecretUser` - Server request user credential to use with basic auth. **REQUIRED**
- `rest.commonSecretPass` - Client/Server request password credential to use with basic auth. **REQUIRED**
- `rest.cert` - Secure protocol (HTTPS) certificate file content. **OPTIONAL** (if not specified it won't use ssl)
- `rest.key` - Secure protocol (HTTPS) private key file content. **OPTIONAL** (if not specified it won't use ssl)
- `rest.serverPort` - Listening port. **OPTIONAL** (It'll use this order `(process.env.PORT || options["serverPort"] || 8080);`
- `rest.requestLimit` - Limit request per second of an IP. **OPTIONAL** (Default is disabled)

---
##### Database Config
Database is heavily used for operations like store and fetch data in almost all requests.
- `database.host` - MySQL Host. **REQUIRED**
- `database.user` - MySQL DB User. **REQUIRED**
- `database.password` - MySQL DB Password. **OPTIONAL**
- `database.database` - MySQL DB Name. **REQUIRED**

---
##### Push config
Push configuration to connect when sending a message and in feedback service too,
- `push.cert` - Push notifications server certificate file content. **REQUIRED**
- `push.key` - Push notifications server key file content. **REQUIRED**

**Generating keys**

Download the push certificate from Apple (`.cer`), and export the downloaded certificate as a .p12 file from keychain (after added the downloaded certificate to keychain).
Now you should have an `.cer` file which is your push certificate and an `.p12` file which is your signed push certificate.

Now in the same directory execute: (It'll ask you the password which you used to export your `.p12` file.) 

```
$ openssl x509 -in cert.cer -inform DER -outform PEM -out cert.pem
$ openssl pkcs12 -in key.p12 -out key.pem -nodes
```


##Rest API
[HERE](https://github.com/TotenDev/apnrs-server/blob/master/docs/rest.md)

## Contributing
1. Fork it
2. Create your feature branch (`git checkout -b my-new-feature`)
3. Commit your changes (`git commit -am 'Added some feature'`)
4. Push to the branch (`git push origin my-new-feature`)
5. Create new Pull Request
	
##License
[MIT](apnrs-server/raw/master/LICENSE)