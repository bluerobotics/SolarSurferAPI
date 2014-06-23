# ArchitectJS

Data API for the [SolarSurfer](http://bluerobotics.com/) project.

## Overview

This is the data API for the BlueRobotic's SolarSurfer project. It offers SolarSurfer command and telemetry history over a RESTful HTTP interface.

## API

This API is nominally available at [http://surfer.bluerobotics.com/](http://surfer.bluerobotics.com/). There are four available endpoints:

* `GET /cmd`
* `GET /cmd/_id`
* `GET /tlm`
* `GET /tlm/_id`

Command documents have this format:

```json
{
  "_id": "",
  "_version": "",
  "_time": "",
  "_imei": "000000000000000",
  "_path": "iridium"
}

Telemetry documents have this format:

```json
{
  "_id": "",
  "_version": "",
  "_time": "",
  "_imei": "000000000000000",
  "_path": "iridium",
  "_momsn": "0",
  "_transmit_time": "14-06-23 02:23:50",
  "_iridium_latitude": "33.8612",
  "_iridium_longitude": "-118.3447",
  "_iridium_cep": "3",
  "mission": "1"
}
```

On the two collection endpoints, the following query parameters are supported:

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
