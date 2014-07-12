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

## Data Types

The following data types are supported:

Data Type | Number of Bits | Range
--- | --- | ---
uint8_t | 8 | 0 .. 255
int8_ | 8 | -128 .. 127
uint16_t | 16 | 0 .. 65,535
int16_t | 16 | -32,768 .. 32,767
uint32_t | 32 | 0 .. 4,294,967,295
int32_t | 32 | -2,147,483,648 .. 2,147,483,647
uint64_t | 64 | 0 .. 18,446,744,073,709,551,615
int64_t | 64 | -9,223,372,036,854,775,808 .. 9,223,372,036,854,775,807
float | 32 | -3.4E38 .. 3.4E38
double | 64 | -1.7E308 .. 1.7E308
enum | 8 | the entire value is used in a lookup map
bitmap | 8 | each bit is an isolated value
char | 8 | 2 byte ascii values

## Message Formats

Message formats are stored in the [src/formats.json](src/formats.json) file. Formats are defined by a defined by a unsigned integer and contain `name` and `payload` fields. The payload field contains the definition for an array of variables that makes up the comm format. Each variable definition is an object and must have a `name` and `type` defined. Variables of type `enum` and `bitmap` also must have a `map` defined. Maps for `enums` can have up to 256 values and maps for `bitmaps` can have up to 8 values.

To reduce duplicate variable definitions across formats, variable definitions can be defined in the upper level `shared` object. These definitions can be reference by defining subsequent variable definitions to the shared object key (a string) instead of an object.

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
