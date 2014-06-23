# ArchitectJS

Data API for the [SolarSurfer](http://bluerobotics.com/) project.

## Overview

This is the data API for the BlueRobotic's SolarSurfer project. The API access POST requests from the RockSeven data service, saves the data to a database, and offers the data back over a REST API.

This API is nominally available at [http://surfer.bluerobotics.com/](http://surfer.bluerobotics.com/).

## Setup

```bash
git clone https://github.com/bluerobotics/SolarSurferAPI.git
npm install
npm start
```

The API is now available at [http://localhost:7873/](http://localhost:7873/).

## API

* `POST /_ver_/raw`
* `GET /_ver_/raw`
* `GET /_ver_/raw/_id_`
* `GET /_ver_/telem`
* `GET /_ver_/telem/_id_`

## Testing

```bash
npm test
```

## Change History

This project uses [semantic versioning](http://semver.org/).

### v0.1.0 - tbd

* Initial release

## Todo

* All the things...
