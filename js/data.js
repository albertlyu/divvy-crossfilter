function loadData() {

	// read data files

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



	});
}

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


function createRange(days) {
//console.log("createRange");
	var range = {
		dayRange: days+1,
		days: [],
		metrics:{}
	};
	return range;
}

function getSummary(days,extent,impact) {
	var	startIndex = Math.floor((extent[0]-days[0].date)/86400000),
		endIndex = Math.floor((extent[1]-days[0].date)/86400000),
		countDays = endIndex-startIndex+1
	;

	var group = {
		calls: {
			count: {
				all: 0
			},
			sum: {
				primary: 0,
				secondary: 0,
				requests: 0,
				influenced: 0
			},
			average: {
				primary: 0,
				secondary: 0,
				requests: 0
			}
		},
	};

	var summary = {
		control: jQuery.extend(true, {}, group),
		test: jQuery.extend(true, {}, group)
	};

	for (var i=startIndex; i<=endIndex; i++) {
		var metrics = days[i].metrics;
		summary.control.calls.count.all += metrics.CntCalls_Control_NR;
		summary.test.calls.count.all += metrics.CntCalls_Test_Inf + metrics.CntCalls_Test_NR + metrics.CntCalls_Test_NA;
		summary.test.calls.sum.influenced += metrics.CntCalls_Test_Inf;

		summary.control.calls.sum.primary += metrics.SumPrimaryKPI_Control_NR;
		summary.test.calls.sum.primary += metrics.SumPrimaryKPI_Test_Inf + metrics.SumPrimaryKPI_Test_NR + metrics.SumPrimaryKPI_Test_NA;

		summary.control.calls.sum.requests += metrics.CntRouteRequests_Control_NR;
		summary.test.calls.sum.requests += metrics.CntRouteRequests_Test_Inf + metrics.CntRouteRequests_Test_NR + metrics.CntRouteRequests_Test_NA;

		summary.control.calls.sum.secondary += metrics.SumSecondaryKPI_Control_NR;
		summary.test.calls.sum.secondary  += metrics.SumSecondaryKPI_Test_Inf + metrics.SumSecondaryKPI_Test_NR + metrics.SumSecondaryKPI_Test_NA;
	}

	//For each group calculate the averages
	_(summary).keys().forEach(function(k) {
		summary[k].calls.average.primary = summary[k].calls.sum.primary / summary[k].calls.count.all;
		summary[k].calls.average.secondary = summary[k].calls.sum.secondary / summary[k].calls.count.all;
		summary[k].calls.average.influenced = summary[k].calls.sum.influenced / summary[k].calls.count.all;
	});


	summary.delta = {
		average: {
			primary: (summary.control.calls.average.primary - summary.test.calls.average.primary) / summary.control.calls.average.primary,
			secondary: (summary.test.calls.average.secondary - summary.control.calls.average.secondary) / summary.control.calls.average.secondary,
		},
		sum: {
			impact: Math.floor((summary.control.calls.average.primary - summary.test.calls.average.primary) * summary.control.calls.count.all * 7/countDays),
			secondary: summary.test.calls.average.secondary - summary.control.calls.average.secondary
		}
	}

	//Calculate summary.delta if primary kpi / focus metric is a unit of time or not
	if (impact == 'time') {
		summary.delta.sum.impact = summary.control.calls.average.primary - summary.test.calls.average.primary
	} else {
		summary.delta.sum.impact = Math.floor((summary.control.calls.average.primary - summary.test.calls.average.primary) * summary.control.calls.count.all * 7/countDays)
	}
	
	return summary;
}
