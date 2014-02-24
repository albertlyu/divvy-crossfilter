divvy-crossfilter
=============

## Summary
This is a JavaScript project that filters Divvy bike trip data using Crossfilter.js. Crossfilter is a JavaScript library for exploring large multivariate datasets with fast n-dimensional filtering and grouping of records.

The task is to fork the example of airline on-time performance from flights data demonstrating Crossfilter.js (http://square.github.io/crossfilter/), then refactor the code in order to read in Divvy bike trips data, which is provided by the 2014 Divvy Data Challenge (http://divvybikes.com/datachallenge).

The goal is to complete a working visualization utilizing Crossfilter.js and submit an entry by March 11, 2014 at 11:59PM CST.

---

## Data
Divvy_Stations_Trips_2013.zip
(Source: http://divvybikes.com/datachallenge)

This file contains metadata for both the Trips and Stations table.

For more information, see the contest page at http://DivvyBikes.com/datachallenge or email questions to data@DivvyBikes.com. 


Metadata for Trips Table:

Variables:

trip_id: ID attached to each trip taken
starttime: day and time trip started, in CST
stoptime: day and time trip ended, in CST
bikeid: ID attached to each bike
tripduration: time of trip in seconds 
from_station_name: name of station where trip originated
to_station_name: name of station where trip terminated 
from_station_id: ID of station where trip originated
to_station_id: ID of station where trip terminated
usertype: "Customer" is a rider who purchased a 24-Hour Pass; "Subscriber" is a rider who purchased an Annual Membership
gender: gender of rider
birthyear: birth year of rider


Notes:

* First row contains column names
* Total records = 759,789
* Trips that did not include a start or end date were removed from original table.
* Gender and birthday are only available for Subscribers



Metadata for Stations table:

Variables:

name: station name    
latitude: station latitude
longitude: station longitude
dpcapacity: number of total docks at each station as of 2/7/2014
online date: date the station went live in the system
