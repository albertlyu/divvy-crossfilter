function loadData() {

	// read data files

	// (It's CSV, but GitHub Pages only gzip's JSON at the moment.)
	d3.csv("../data/Divvy_Trips_2013.csv", function(error, trips) {

		// A little coercion, since the CSV is untyped.
		trips.forEach(function(d, i) {
			d.index = i;
			d.starttime = new Date(d3.time.format(d.starttime));
			d.stoptime = new Date(d3.time.format(d.stoptime));
			d.tripduration = +parseFloat(d.tripduration.replace(',',''));
		});

		// Crossfilter and render charts
		crossfilterTrip(trips);

	});
}

	/* save for later
	// divvy stations
	d3.text("../data/Divvy_Stations_2013.csv", function(error, data) {
		console.log("loadStationData");
		
		var rows = d3.csv.parse(data);
		var stations = rows.map(function(d,i) {
			var station = {
				name: null
			}
			for (column in d) {
				if (d[column]=="null") {
					d[column] = null;
				}
				if (column=="name") {
					station.name = String(d[column]);
				} else {
					station[column] = +d[column];
				}
			}
			return station;
		});
		console.log(stations);
	});

	// divvy trips
	d3.text("../data/Divvy_Trips_2013.csv", function(error, data) {
		var rows = d3.csv.parse(data);

		// parse trip data into trips
		var trips = rows.map(function(d,i) {
			var trip = {
				trip_id: null,
				trip_detail: {
					starttime: null,
					stoptime: null,
					bikeid: null,
					tripduration: null,
					from_station_id: null,
					from_station_name: null,
					to_station_id: null,
					to_station_name: null,
					usertype: null,
					gender: null,
					birthyear: null
				},
			}
			for (column in d) {
				if (d[column]=="null") {
					d[column] = null;
				}
				if (column=="trip_id") {
					trip[column] = +d[column];
				} else if (column=="starttime"||column=="stoptime") {
					trip.trip_detail[column] = Date(d[column]);
				} else if (column=="tripduration") {
					trip.trip_detail[column] = String(d[column]);
				} else if (column=="from_station_name"||column=="to_station_name") {
					trip.trip_detail[column] = String(d[column]);
				} else if (column=="usertype"||column=="gender") {
					if (String(d[column])==="") { 
						trip.trip_detail[column] = "Unknown";
					} else { 
						trip.trip_detail[column] = String(d[column]);
					}
				} else {
					trip.trip_detail[column] = +d[column];
				}
			}
			return trip;
		});
		console.log(rows);

		// parse trip data by bikes

		// parse trip data by hour



	});*/	


function distance(lat1, lon1, lat2, lon2, unit) {
    var radlat1 = Math.PI * lat1/180
    var radlat2 = Math.PI * lat2/180
    var radlon1 = Math.PI * lon1/180
    var radlon2 = Math.PI * lon2/180
    var theta = lon1-lon2
    var radtheta = Math.PI * theta/180
    var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
    dist = Math.acos(dist)
    dist = dist * 180/Math.PI
    dist = dist * 60 * 1.1515
    if (unit=="K") { dist = dist * 1.609344 }
    if (unit=="N") { dist = dist * 0.8684 }
    return dist
} // see http://www.geodatasource.com/developers/javascript

