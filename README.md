[![Build Status](https://travis-ci.org/bluerobotics/SolarSurferAPI.svg?branch=master)](https://travis-ci.org/bluerobotics/SolarSurferAPI)

# ArchitectJS

Data API for the [SolarSurfer](http://bluerobotics.com/) project.

## Overview

This is the data API for the BlueRobotic's SolarSurfer project. It offers SolarSurfer command and telemetry history over a RESTful HTTP interface. This service is nominally located at [](http://data.bluerobotics.com/) and [http://solarsurfer.herokuapp.com/](http://solarsurfer.herokuapp.com/).

## API

This API is nominally available at [http://surfer.bluerobotics.com/](http://surfer.bluerobotics.com/). There are a few available endpoints:

Endpoint | Schema | Valid Actions
--- | --- | ---
`/cmd` | [list of cmd documents] | GET, POST
`/cmd/_id` | {_id, _date, packets, data} | GET
`/tlm` | [list of tlm documents] | GET
`/tlm/_id` | {_id, _date, packets, data} | GET
`/raw/cmd` | {} | GET
`/raw/cmd/_id` | {} | GET
`/raw/tlm` | {} | GET, POST
`/raw/tlm/_id` | {} | GET

Most the time, users will only care about the non-raw endpoints as these contain the raw byte-streams to and from RockSeven. The two endpoints that support POST requests enforce authentication.

On the collection endpoints, the following query parameters are supported:

* `?where={"mission":1}` - used to limit which documents get returned
* `?projection={"mission":1}` - used to limit which fields get returned

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

### v0.0.0 - tbd

* Initial release

## Todo

* test database writing
* test Message expanding / writing to non-raw
* test POST and PUT white-listing
* test cmd posting
* test cmd forwarding
* test mission and vehicle stuffs
