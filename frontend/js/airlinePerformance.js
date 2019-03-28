//# dc.js Getting Started and How-To Guide
'use strict';
/**
 * Code reference: https://dc-js.github.io/dc.js/
 */

/* jshint globalstrict: true */
/* global dc,d3,crossfilter,colorbrewer */

// ### Create Chart Objects

// Create chart objects associated with the container elements identified by the css selector.
// Note: It is often a good idea to have these objects accessible at the global scope so that they can be modified or
// filtered by other page controls.

// 1. Percentage of Total Flights vs. Total number of flights
var airlineBubbleChart = dc.bubbleChart('#airline-bubble-chart');

// 2. Number of Delayed Flights vs. Number of On Time Flights
var delayOnTimeChart = dc.pieChart('#delay-ontime-chart');

// 3. Distribution of Delay Reasons Pie Chart
//var quarterChart = dc.pieChart('#quarter-chart');

// 4. Delay by Day of Week
var dayOfWeekChart = dc.rowChart('#day-of-week-chart');

// 5. Number of flights vs. Delayed Minutes
var fluctuationChart = dc.barChart('#fluctuation-chart');

// Last Two Charts
var moveChart = dc.lineChart('#monthly-move-chart');

//### Load your data

//Data can be loaded through regular means with your
//favorite javascript library
//
//```javascript
//d3.csv('data.csv', function(data) {...});
//d3.json('data.json', function(data) {...});
//jQuery.getJson('data.json', function(data){...});
//```
d3.csv('reqdata/reqlog.csv', function (data) {
    // Since its a csv file we need to format the data a bit.
    var dateFormat = d3.time.format('%m/%d/%Y');
    var numberFormat = d3.format('.2f');
    var total_num_flights = 0
    data.forEach(function (d) {
        d.dd = dateFormat.parse(d.FIDate);
        d.month = d3.time.month(d.dd); // pre-calculate month for better performance
        d.delayFlag = +d.delayFlag
        d.Count = 1
        d.DepDelayMin = +d.DepDelayMin
        d.CarrierDelay = +d.CarrierDelay
        d.WeatherDelay = +d.WeatherDelay
        d.NASDelay = +d.NASDelay
        d.SecurityDelay = +d.SecurityDelay
        d.LateAircraftDelay = +d.LateAircraftDelay
    });

    //### Create Crossfilter Dimensions and Groups

    //See the [crossfilter API](https://github.com/square/crossfilter/wiki/API-Reference) for reference.
    var ndx = crossfilter(data);
    var all = ndx.groupAll();

    // Filter for Graph 1-----------------------------------------

    // Dimension by year
    var airlineDimension = ndx.dimension(function (d) {
        //return d3.time.year(d.dd).getFullYear();
        return d.UniqueCarrier
    });
    // Maintain running tallies by year as filters are applied or removed
    var airlinePerformanceGroup = airlineDimension.group().reduce(
        /* callback for when data is added to the current filter results */
        function (p, v) {
            // p = formatted tuple with additonal attributes/information
            // v = original tuple loaded from csv
            p.UniqueCarrier = v.UniqueCarrier
            p.totalcount += v.Count
            total_num_flights += v.Count
            return p;
        },
        /* callback for when data is removed from the current filter results */
        function (p, v) {
            p.UniqueCarrier = v.UniqueCarrier
            p.totalcount -= v.Count
            total_num_flights -= v.Count
            return p;
        },
        /* initialize p */
        function () {
            return {
                UniqueCarrier: '',
                totalcount: 0,
                percentage: 0,
                overallTotal: 0
            };
        }
    );

    // End of Filter for Graph 1 ---------------------------------------

    // Filter for Graph 2 ---------------------------------------
    var total_flights_for_graph2 = 0
    // Create categorical dimension
    var gainOrLoss = ndx.dimension(function (d) {
        return d.delayFlag == 0 ? 'Successful' : 'Fail/Delay';
    });
    // Produce counts records in the dimension
    var gainOrLossGroup = gainOrLoss.group().reduce(
        function(p,v) {
            p.delayFlag = v.delayFlag
            p.totalcount += v.Count
            total_flights_for_graph2 += p.totalcount
            return p
        },
        function(p,v) {
            p.delayFlag = v.delayFlag
            p.totalcount -= v.Count
            total_flights_for_graph2 -= p.totalcount
            return p
        },
        function() {
            total_flights_for_graph2 = 0
            return {
                totalcount: 0,
                percentage: 0.0,
                delayFlag: 0,
            }
        }
    );

    // End of Filter for Graph 2 ---------------------------------------

    // Filter for Graph 4

    // Counts per weekday
    var total_flights_by_day = {}
    var dayOfWeek = ndx.dimension(function (d) {
        var day = d.dd.getDay();
        var name = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        //return day + '.' + name[day];
         return name[day];
    });
    var dayOfWeekGroup = dayOfWeek.group().reduce(
        function(p,v) {
            p.totalcount += v.Count
            var day = v.dd.getDay()
            p.day = day
            if (day in total_flights_by_day) {
                total_flights_by_day[day] += v.Count
            } else {
                total_flights_by_day[day] = v.Count
            }
            return p
        },
        function(p, v) {
            p.totalcount -= v.Count
            var day = v.dd.getDay()
            p.day = day
            total_flights_by_day[day] -= v.Count
            return p
        },
        function() {
            return {
                totalcount: 0,
                day: 0
            }
        }
    );

    // End of Filter for Graph 4 ---------------------------------------

    // Filter for Graph 5
    function remove_empty_bins(source_group) {
        return {
            all:function () {
                return source_group.all().filter(function(d) {
                    return d.value.count !== 0 ;
                });
            }
        };
    }

    // Determine a histogram of percent changes
    var fluctuation = ndx.dimension(function (d) {
        var total_delay_min = d.DepDelayMin + d.CarrierDelay + d.WeatherDelay + d.NASDelay + d.SecurityDelay + d.LateAircraftDelay
        var average_delay = total_delay_min * 1.0 / d.Count
        return Math.ceil(average_delay)
    });
    var fluctuationGroup = fluctuation.group().reduce(
        function(p,v) {
            p.count += v.Count
            return p
        },
        function(p,v) {
            p.count -= v.Count
            return p
        },
        function() {
            return {
                count: 0
            }
        }
    )

    var filtered_delay_min_group = remove_empty_bins(fluctuationGroup)
    // End of Filter for Graph 5 ---------------------------------------
    // Dimension by month
    var moveMonths = ndx.dimension(function (d) {
        return d.month;
    });
    // Group by total movement within month
    var monthlyMoveGroup = moveMonths.group().reduce(
        function (p,v) {
            p.totalcount += v.Count
            if (v.delayFlag === 1) {
                p.delaycount += v.Count
            }
            return p
        },
        function(p,v) {
            p.totalcount -= v.Count
            if (v.delayFlag === 1) {
                p.delaycount -= v.Count
            }
            return p
        },
        function() {
            return {
                delaycount: 0,
                totalcount: 0
            }
        }
    );
    // Group by total volume within move, and scale down result
    var volumeByMonthGroup = moveMonths.group().reduce(
        function (p,v) {
            if (v.delayFlag === 1) {
                p.totalcount += v.Count
            }
            return p
        },
        function (p,v) {
            if (v.delayFlag === 1) {
                p.totalcount -= v.Count
            }
            return p
        },
        function() {
            return {
                totalcount: 0
            }
        }
        );

    //### Define Chart Attributes
    // Define chart attributes using fluent methods. See the
    // [dc.js API Reference](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md) for more information
    //

    //#### Bubble Chart

    //Create a bubble chart and use the given css selector as anchor. You can also specify
    //an optional chart group for this chart to be scoped within. When a chart belongs
    //to a specific group then any interaction with the chart will only trigger redraws
    //on charts within the same chart group.
    // <br>API: [Bubble Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#bubble-chart)
    airlineBubbleChart /* dc.bubbleChart('#airline-bubble-chart', 'chartGroup') */
    // (_optional_) define chart width, `default = 200`
        .width(990)
        // (_optional_) define chart height, `default = 200`
        .height(250)
        // (_optional_) define chart transition duration, `default = 750`
        .transitionDuration(1500)
        .margins({top: 10, right: 50, bottom: 30, left: 40})
        .dimension(airlineDimension)
        //The bubble chart expects the groups are reduced to multiple values which are used
        //to generate x, y, and radius for each key (bubble) in the group
        .group(airlinePerformanceGroup)
        // Assign colors to rainbow pattern
        .ordinalColors(['#dd1c77','#feb24c','#efda4f','#2ca25f','#2c7fb8'])
        //##### Accessors
        //Accessor functions are applied to each value returned by the grouping
        // `.colorAccessor` - the returned value will be passed to the `.colors()` scale to determine a fill color
        .colorAccessor(function (p, i) {
            return i
        })
        // `.keyAccessor` - the `X` value will be passed to the `.x()` scale to determine pixel location
        .keyAccessor(function (p) {
            return p.value.totalcount;
        })
        // `.valueAccessor` - the `Y` value will be passed to the `.y()` scale to determine pixel location
        .valueAccessor(function (p) {
            return p.value.totalcount * 100.0 / total_num_flights
        })
        // `.radiusValueAccessor` - the value will be passed to the `.r()` scale to determine radius size;
        //   by default this maps linearly to [0,100]
        .radiusValueAccessor(function (p) {
            return p.value.totalcount
        })
        .maxBubbleRelativeSize(0.3)
        .x(d3.scale.linear().domain([0, 1500000]))
        .y(d3.scale.linear().domain([0, 100]))
        .r(d3.scale.linear().domain([0, 100]))
        //##### Elastic Scaling

        //`.elasticY` and `.elasticX` determine whether the chart should rescale each axis to fit the data.
        //.elasticY(true)
        .elasticX(true)
        //`.yAxisPadding` and `.xAxisPadding` add padding to data above and below their max values in the same unit
        //domains as the Accessors.
        .yAxisPadding(300)
        .xAxisPadding(5)
        // (_optional_) render horizontal grid lines, `default=false`
        .renderHorizontalGridLines(true)
        // (_optional_) render vertical grid lines, `default=false`
        .renderVerticalGridLines(true)
        // (_optional_) render an axis label below the x axis
        .xAxisLabel('Average Number of Requests Per Day')
        // (_optional_) render a vertical axis lable left of the y axis
        .yAxisLabel('Percentage of Requests')
        //##### Labels and  Titles

        //Labels are displayed on the chart for each bubble. Titles displayed on mouseover.
        // (_optional_) whether chart should render labels, `default = true`
        .renderLabel(true)
        .label(function (p) {
            return p.key;
        })
        // (_optional_) whether chart should render titles, `default = false`
        .renderTitle(true)
        .title(function (p) {
            var airline_name = airlineCodeName[p.key] + ' (' + p.key + ')'
            return [
                airline_name,
                'Total Flights: ' + numberFormat(p.value.totalcount),
                'Flight Percentage: ' + numberFormat(p.value.totalcount * 100.0 / total_num_flights) + '%'
            ].join('\n');
        })
        //#### Customize Axes

        // Set a custom tick format. Both `.yAxis()` and `.xAxis()` return an axis object,
        // so any additional method chaining applies to the axis, not the chart.
        .yAxis().tickFormat(function (v) {
        return v + '%';
    });

    // #### Pie/Donut Charts

    // Create a pie chart and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Pie Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#pie-chart)
    /*dc.pieChart('#delay-ontime-chart', 'chartGroup') */
    delayOnTimeChart
    // (_optional_) define chart width, `default = 200`
        .width(180)
        // (optional) define chart height, `default = 200`
        .height(180)
        // Define pie radius
        .radius(80)
        // Set dimension
        .dimension(gainOrLoss)
        .minAngleForLabel(1)
        // Set group
        .group(gainOrLossGroup)
        .valueAccessor(function (p) {
            return p.value.totalcount
        })
        .on('renderlet', function(chart) {
             chart.selectAll('text.pie-slice').text( function(d) {
                 if (d.endAngle - d.startAngle > 0) {
                    return d.data.key + ' ' + dc.utils.printSingleValue((d.endAngle - d.startAngle) / (2*Math.PI) * 100) + '%';
                 } else {
                     return '';
                 }
             })
        })

    //#### Row Chart

    // Create a row chart and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Row Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#row-chart)
    /* dc.rowChart('#day-of-week-chart', 'chartGroup') */
    dayOfWeekChart
        .width(180)
        .height(180)
        .margins({top: 20, left: 10, right: 20, bottom: 20})
        .group(dayOfWeekGroup)
        .dimension(dayOfWeek)
        .ordering(function(p) {
            var day = p.key
            if (day === 'Sun') {
                return 0
            } else if (day === 'Mon') {
                return 1
            } else if (day === 'Tue') {
                return 2
            } else if (day === 'Wed') {
                return 3
            } else if (day === 'Thu') {
                return 4
            } else if (day === 'Fri') {
                return 5
            } else if (day === 'Sat') {
                return 6
            }
        })
        .valueAccessor(function (p) {
            return Math.abs(p.value.totalcount)
        })
        // Assign colors to each value in the x scale domain
        .ordinalColors(['#3182bd', '#99dfef', '#3182bd', '#99dfef', '#3182bd','#99dfef','#3182bd'])
        .label(function (d) {
            return d.key;
        })
        .renderLabel(true)
        // Title sets the row text
        .title(function (d) {
            var total_count = 'Total Flights: ' + d.value.totalcount;
            var percentage = 'Percentage: ' + numberFormat(d.value.totalcount * 100.0 / total_num_flights) + '%'
            return [
                total_count,
                percentage
            ].join('\n');
        })
        .elasticX(true)
        .xAxis()
        .ticks(4)
        .tickFormat(function (v) {
            return v
        })

    //#### Bar Chart

    // Create a bar chart and use the given css selector as anchor. You can also specify
    // an optional chart group for this chart to be scoped within. When a chart belongs
    // to a specific group then any interaction with such chart will only trigger redraw
    // on other charts within the same chart group.
    // <br>API: [Bar Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#bar-chart)
    /* dc.barChart('#volume-month-chart', 'chartGroup') */
    fluctuationChart
        .width(450)
        .height(200)
        .margins({top: 10, right: 50, bottom: 35, left: 65})
        .dimension(fluctuation)
        .group(filtered_delay_min_group)
        // (_optional_) whether bar should be center to its x value. Not needed for ordinal chart, `default=false`
        //.centerBar(true)
        // (_optional_) set gap between bars manually in px, `default=2`
        .gap(1)
        // (_optional_) set filter brush rounding
        .round(dc.round.floor)
        .alwaysUseRounding(true)
        .valueAccessor(function (p) {
            return p.value.count
        })
        .renderHorizontalGridLines(true)
        .x(d3.scale.linear().domain([0, 1500]))
        .elasticY(true)
        .xAxisLabel('Average Response Size \(KB\)')
        .yAxisLabel('Number of Requests')
        .renderTitle(true)
        .renderHorizontalGridLines(true)
        // Customize the filter displayed in the control span
        .filterPrinter(function (filters) {
            var filter = filters[0], s = '';
            s += numberFormat(filter[0]) + ' ~ ' + numberFormat(filter[1]) + ' mins';
            return s;
        })


    //#### Stacked Area Chart

    //Specify an area chart by using a line chart with `.renderArea(true)`.
    // <br>API: [Stack Mixin](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#stack-mixin),
    // [Line Chart](https://github.com/dc-js/dc.js/blob/master/web/docs/api-latest.md#line-chart)
    /* dc.lineChart('#monthly-move-chart', 'chartGroup') */
    moveChart
        .renderArea(true)
        .width(990)
        .height(200)
        .transitionDuration(1000)
        .margins({top: 30, right: 50, bottom: 35, left: 50})
        .dimension(moveMonths)
        .group(monthlyMoveGroup)
        .keyAccessor(function (p) {
            return p.key
        })
        .valueAccessor(function (d) {
            return d.value.totalcount;
        })
        .x(d3.time.scale().domain([new Date(1985, 0, 1), new Date(2012, 11, 31)]))
        .round(d3.time.month.round)
        .xUnits(d3.time.months)
        .elasticY(true)
        .elasticX(true)
        .renderHorizontalGridLines(true)
        .xAxisLabel('Month')
        .yAxisLabel('Number of Requests')
        .renderTitle(true)
        .title(function (d) {
            return dateFormat(d.key) + '\n' + numberFormat(d.value.totalcount)
        })
        .yAxis().tickFormat(function(v) {
            return v
        })

    //#### Rendering

    //simply call `.renderAll()` to render all charts on the page
    dc.renderAll();
});

//#### Versions

//Determine the current version of dc with `dc.version`
d3.selectAll('#version').text(dc.version);

// Determine latest stable version in the repo via Github API
d3.json('https://api.github.com/repos/dc-js/dc.js/releases/latest', function (error, latestRelease) {
    /*jshint camelcase: false */
    /* jscs:disable */
    d3.selectAll('#latest').text(latestRelease.tag_name);
});
