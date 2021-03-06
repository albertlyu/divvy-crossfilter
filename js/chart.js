function crossfilterTrip(trips) {
    // Create the crossfilter for the relevant dimensions and groups.
	var trip = crossfilter(trips)
		all = trip.groupAll(),
        starttime = trip.dimension(function (d) {
            return d.starttime;
        }),
        startdates = starttime.group(d3.time.day),
        starthour = trip.dimension(function (d) {
            return d.starttime.getHours() + d.starttime.getMinutes() / 60;
        }),
        starthours = starthour.group(Math.floor),
        startday = trip.dimension(function (d) {
            return d.starttime.getDay();
        }),
        startdays = startday.group(Math.floor),
        startmonth = trip.dimension(function (d) {
            return d.starttime.getMonth();
        }),
        startmonths = startmonth.group(Math.floor),

        stoptime = trip.dimension(function (d) {
            return d.stoptime;
        }),
        stophour = trip.dimension(function (d) {
            return d.stoptime.getHours() + d.stoptime.getMinutes() / 60;
        }),
        stophours = stophour.group(Math.floor),

        tripduration = trip.dimension(function (d) {
            return d.tripduration / 60;
        }),
        tripdurations = tripduration.group(Math.floor);

    var charts = [

        barChart()
        .dimension(starthour)
        .group(starthours)
        .x(d3.scale.linear()
            .domain([0, 24])
            .rangeRound([0, 10 * 24])),

        barChart()
        .dimension(stophour)
        .group(stophours)
        .x(d3.scale.linear()
            .domain([0, 24])
            .rangeRound([0, 10 * 24])),

        barChart()
        .dimension(startday)
        .group(startdays)
        .x(d3.scale.linear()
            .domain([0, 7])
            .rangeRound([0, 10 * 7])),

        barChart()
        .dimension(startmonth)
        .group(startmonths)
        .x(d3.scale.linear()
            .domain([0, 12])
            .rangeRound([0, 10 * 12])),

        barChart()
        .dimension(tripduration)
        .group(tripdurations)
        .x(d3.scale.linear()
            .domain([0, 200])
            .rangeRound([0, 10 * 75])),

        barChart()
        .dimension(starttime)
        .group(startdates)
        .round(d3.time.day.round)
        .x(d3.time.scale()
            .domain([new Date(2013, 5, 27), new Date(2014, 0, 1)])
            .rangeRound([0, 10 * 75]))
        .filter([new Date(2013, 5, 27), new Date(2014, 0, 1)])

    ];
    // Given our array of charts, which we assume are in the same order as the
    // .chart elements in the DOM, bind the charts to the DOM and render them.
    // We also listen to the chart's brush events to update the display.
    var chart = d3.selectAll(".chart")
        .data(charts)
        .each(function (chart) {
            chart.on("brush", renderAll).on("brushend", renderAll);
        });

    // Render the initial lists.
    var list = d3.selectAll(".list")
        .data([tripList]);

    // Render the total.
    d3.selectAll("#total")
        .text(formatNumber(trip.size()));

    renderAll();

    // Renders the specified chart or list.
    function render(method) {
        d3.select(this).call(method);
    }

    // Whenever the brush moves, re-rendering everything.
    function renderAll() {
        chart.each(render);
        list.each(render);
        d3.select("#active").text(formatNumber(all.value()));
    }

    window.filter = function (filters) {
        filters.forEach(function (d, i) {
            charts[i].filter(d);
        });
        renderAll();
    };

    window.reset = function (i) {
        charts[i].filter(null);
        renderAll();
    };

    function tripList(div) {
    	// A nest operator, for grouping the trip list.
		var nestByDate = d3.nest()
			.key(function(d) { return d3.time.day(d.starttime); });

		var tripsByDate = nestByDate.entries(starttime.top(40));

	    div.each(function () {
	        var date = d3.select(this).selectAll(".date")
	            .data(tripsByDate, function (d) {
	                return d.key;
	            });

	        date.enter().append("div")
	            .attr("class", "date")
	            .append("div")
	            .attr("class", "day")
	            .text(function (d) {
	                return getDayOfWeek(d.values[0].starttime) + " " + formatDate(d.values[0].starttime);
	            });

	        date.exit().remove();

	        var trip = date.order().selectAll(".trip")
	            .data(function (d) {
	                return d.values;
	            }, function (d) {
	                return d.index;
	            });

	        var tripEnter = trip.enter().append("div")
	            .attr("class", "trip");

	        tripEnter.append("div")
	            .attr("class", "time")
	            .text(function (d) {
	                return formatTime(d.starttime) + "-" + formatTime(d.stoptime);
	            });

	        tripEnter.append("div")
	            .attr("class", "origin")
	            .text(function (d) {
	                return d.from_station_name;
	            });

	        tripEnter.append("div")
	            .attr("class", "destination")
	            .text(function (d) {
	                return d.to_station_name;
	            });

	        tripEnter.append("div")
	            .attr("class", "duration")
	            .text(function (d) {
	                return formatNumberToInt((d.tripduration) / 60) + " min.";
	            });

	        trip.exit().remove();

	        trip.order();
	    });
	}
}

function barChart() {
    if (!barChart.id) barChart.id = 0;

    var margin = {
        top: 10,
        right: 10,
        bottom: 20,
        left: 10
    },
        x,
        y = d3.scale.linear().range([100, 0]),
        id = barChart.id++,
        axis = d3.svg.axis().orient("bottom"),
        brush = d3.svg.brush(),
        brushDirty,
        dimension,
        group,
        round;

    function chart(div) {
        var width = x.range()[1],
            height = y.range()[0];

        y.domain([0, group.top(1)[0].value]);

        div.each(function () {
            var div = d3.select(this),
                g = div.select("g");

            // Create the skeletal chart.
            if (g.empty()) {
                div.select(".title").append("a")
                    .attr("href", "javascript:reset(" + id + ")")
                    .attr("class", "reset")
                    .text("reset")
                    .style("display", "none");

                g = div.append("svg")
                    .attr("width", width + margin.left + margin.right)
                    .attr("height", height + margin.top + margin.bottom)
                    .append("g")
                    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

                g.append("clipPath")
                    .attr("id", "clip-" + id)
                    .append("rect")
                    .attr("width", width)
                    .attr("height", height);

                g.selectAll(".bar")
                    .data(["background", "foreground"])
                    .enter().append("path")
                    .attr("class", function (d) {
                        return d + " bar";
                    })
                    .datum(group.all());

                g.selectAll(".foreground.bar")
                    .attr("clip-path", "url(#clip-" + id + ")");

                g.append("g")
                    .attr("class", "axis")
                    .attr("transform", "translate(0," + height + ")")
                    .call(axis);

                // Initialize the brush component with pretty resize handles.
                var gBrush = g.append("g").attr("class", "brush").call(brush);
                gBrush.selectAll("rect").attr("height", height);
                gBrush.selectAll(".resize").append("path").attr("d", resizePath);
            }

            // Only redraw the brush if set externally.
            if (brushDirty) {
                brushDirty = false;
                g.selectAll(".brush").call(brush);
                div.select(".title a").style("display", brush.empty() ? "none" : null);
                if (brush.empty()) {
                    g.selectAll("#clip-" + id + " rect")
                        .attr("x", 0)
                        .attr("width", width);
                } else {
                    var extent = brush.extent();
                    g.selectAll("#clip-" + id + " rect")
                        .attr("x", x(extent[0]))
                        .attr("width", x(extent[1]) - x(extent[0]));
                }
            }

            g.selectAll(".bar").attr("d", barPath);
        });

        function barPath(groups) {
            var path = [],
                i = -1,
                n = groups.length,
                d;
            while (++i < n) {
                d = groups[i];
                path.push("M", x(d.key), ",", height, "V", y(d.value), "h9V", height);
            }
            return path.join("");
        }

        function resizePath(d) {
            var e = +(d == "e"),
                x = e ? 1 : -1,
                y = height / 3;
            return "M" + (.5 * x) + "," + y + "A6,6 0 0 " + e + " " + (6.5 * x) + "," + (y + 6) + "V" + (2 * y - 6) + "A6,6 0 0 " + e + " " + (.5 * x) + "," + (2 * y) + "Z" + "M" + (2.5 * x) + "," + (y + 8) + "V" + (2 * y - 8) + "M" + (4.5 * x) + "," + (y + 8) + "V" + (2 * y - 8);
        }
    }

    brush.on("brushstart.chart", function () {
        var div = d3.select(this.parentNode.parentNode.parentNode);
        div.select(".title a").style("display", null);
    });

    brush.on("brush.chart", function () {
        var g = d3.select(this.parentNode),
            extent = brush.extent();
        if (round) g.select(".brush")
            .call(brush.extent(extent = extent.map(round)))
            .selectAll(".resize")
            .style("display", null);
        g.select("#clip-" + id + " rect")
            .attr("x", x(extent[0]))
            .attr("width", x(extent[1]) - x(extent[0]));
        dimension.filterRange(extent);
    });

    brush.on("brushend.chart", function () {
        if (brush.empty()) {
            var div = d3.select(this.parentNode.parentNode.parentNode);
            div.select(".title a").style("display", "none");
            div.select("#clip-" + id + " rect").attr("x", null).attr("width", "100%");
            dimension.filterAll();
        }
    });

    chart.margin = function (_) {
        if (!arguments.length) return margin;
        margin = _;
        return chart;
    };

    chart.x = function (_) {
        if (!arguments.length) return x;
        x = _;
        axis.scale(x);
        brush.x(x);
        return chart;
    };

    chart.y = function (_) {
        if (!arguments.length) return y;
        y = _;
        return chart;
    };

    chart.dimension = function (_) {
        if (!arguments.length) return dimension;
        dimension = _;
        return chart;
    };

    chart.filter = function (_) {
        if (_) {
            brush.extent(_);
            dimension.filterRange(_);
        } else {
            brush.clear();
            dimension.filterAll();
        }
        brushDirty = true;
        return chart;
    };

    chart.group = function (_) {
        if (!arguments.length) return group;
        group = _;
        return chart;
    };

    chart.round = function (_) {
        if (!arguments.length) return round;
        round = _;
        return chart;
    };

    return d3.rebind(chart, brush, "on");
}