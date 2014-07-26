[![Build Status](https://travis-ci.org/bluerobotics/SolarSurferAPI.svg?branch=master)](https://travis-ci.org/bluerobotics/SolarSurferAPI)

# ArchitectJS

Data API for the [SolarSurfer](http://bluerobotics.com/) project.

## Overview

This is the data API for the BlueRobotic's SolarSurfer project. It offers SolarSurfer command and telemetry history over a RESTful HTTP interface.

## API

This API is nominally available at [http://surfer.bluerobotics.com/](http://surfer.bluerobotics.com/). There are four available endpoints:

* `/cmd`
* `/cmd/_id`
* `/tlm`
* `/tlm/_id`

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

## Change History

This project uses [semantic versioning](http://semver.org/).

### v0.0.0 - tbd

* Initial release

## Todo

* All the things...
