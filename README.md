[![Build Status](https://travis-ci.org/bluerobotics/SolarSurferAPI.svg?branch=master)](https://travis-ci.org/bluerobotics/SolarSurferAPI)

# SolarSurferAPI

Data API for the [SolarSurfer](http://bluerobotics.com/) project.

## Overview

This is the data API for the BlueRobotic's SolarSurfer project. It offers SolarSurfer command and telemetry history over a RESTful HTTP interface. This service is nominally located at [http://data.bluerobotics.com/](http://data.bluerobotics.com/) and [http://solarsurfer.herokuapp.com/](http://solarsurfer.herokuapp.com/).

## Usage

The API is capable of storing telemetry for multiple simultaneous vehicles. All incoming data is assigned a vehicle and a mission by the `imei` located in the incoming telemetry message. The `imei` (or International Mobile Station Equipment Identity) is a unique number assigned to each modem. When a new piece of data arrives, the API first tries to determine is there is a vehicle in the database with a matching `imei`. If there is a not, a new vehicle is created. Next, the API looks for an active mission assigned to that vehicle. If one does not exist, a new mission is created. That piece of data is then saved in the database against that mission.

### API

This API is nominally available at [http://surfer.bluerobotics.com/](http://surfer.bluerobotics.com/). There are a few available endpoints:

Endpoint | Actions | /:id Actions
--- | --- | ---
`/vehicle` | GET, POST | GET, PUT
`/mission` | GET, POST | GET, PUT
`/telemetry`| GET |
`/raw/telemetry` | GET, POST |
`/command` | GET, POST |
`/raw/command` | GET |

Most the time, users will only care about the non-raw endpoints as these contain the raw byte-streams to and from RockSeven. All POST and PUT requests require the correct `?token=` to be passed in the query string.

### GET on a collection

On the collection endpoints, the following query parameters are supported:

* `?where={"mission":1}` - used to limit which documents get returned
* `?fields={"mission":1}` - used to limit which fields get returned
* `?sort=-_date` - used to sort the documents before being returned
* `?limit=10` - used to limit the number of documents that get returned
* `?skip=10` - used to control which group of documents are returned

## Development

To run this service locally:

```bash
git clone https://github.com/bluerobotics/SolarSurferAPI.git
npm install
npm start
```

The API should now be available at [http://localhost:7873/](http://localhost:7873/).

To, run the test suite:

```bash
npm test
```

To deploy to Heroku, follow [this guide](https://devcenter.heroku.com/articles/getting-started-with-nodejs). If you already have the Heroku Toolbox installed and have logged into Heroku through your terminal, this basically boils down to:

```bash
heroku create  # or git remote add heroku git@heroku.com:appname.git 
heroku addons:add mongolab  # requires a credit card added to your Heroku account
git push heroku master
heroku open
```

Once you get up and running, also try out these fun commands:

```
heroku ps
heroku logs
heroku run node
```

## Change History

This project uses [semantic versioning](http://semver.org/).

### v0.3.0 - future

* TODO: Added command POSTing and forwarding
* TODO: depend on a specific version of message format

### v0.2.0 - 2014/12/06

* Added GET parameter test cases for where, fields, sort, limit, and skip
* Refactored auth to token secret string via an environment variable
* Add PUT for /vehicle and /mission

### v0.1.0 - 2014/08/08

* Initial release
* Used for Santa Monica Canyon testing
