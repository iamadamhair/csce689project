var t;
var animating = true;

var margin = { top: 10, right: 10, bottom: 100, left: 50 };
var width = 400;
var height = 500;

var dataXRange = { min: 0, max: 40 };
var dataYRange = { min: 0, max: 100 };
var xAxisLabelHeader = "X Header";
var yAxisLabelHeader = "Y Header";
var circleRadius = 4;

var dots;
var data;
var chart;
var chartWidth = width - margin.left - margin.right;
var chartHeight = height - margin.top - margin.bottom;

var stoppingPoint;

var increment = 1;

var x = d3.scaleLinear().range([0, chartWidth]);
var y = d3.scaleLinear().range([chartHeight, 0]);

init();


function pause() {
    if (animating) {
        t.stop(); 
        animating = false;
        document.getElementById("pauseButton").value = "Start";
    } else {
        t = d3.interval(function() {
                x.domain([dataXRange.min + increment, dataXRange.max + increment]);

                chart.select("g.x.axis").call(chart.xAxis);
                increment = increment + 1;

                drawDots();
                if (dataXRange.min + increment > stoppingPoint) {
                    t.stop();
                }

            }, 200);
        animating = true;
        document.getElementById("pauseButton").value = "Pause";

    }
}

function reset() {
    t.stop(); 
    chart.plotArea.selectAll(".dot").data(data).remove();
    increment = 0;

    t = d3.interval(function() {
            x.domain([dataXRange.min + increment, dataXRange.max + increment]);

            chart.select("g.x.axis").call(chart.xAxis);
            increment = increment + 1;

            drawDots();
            if (dataXRange.min + increment > stoppingPoint) {
                t.stop();
            }

        }, 200);
    animating = true;
    document.getElementById("pauseButton").value = "Pause";
}

function init() {


    // load data from json
    d3.json("./data/stream_1.json", function(error, json) {
        if (error) {
            return console.warn(error);
        } else {
            data = json;
            console.log("JSON loaded");
            initializeChart();
            createAxes();

            stoppingPoint = d3.max(data, function(d) {return +d.xVal});
                                    
            t = d3.interval(function() {
                x.domain([dataXRange.min + increment, dataXRange.max + increment]);

                chart.select("g.x.axis").call(chart.xAxis);
                increment = increment + 1;

                drawDots();
                if (dataXRange.min + increment > stoppingPoint) {
                    t.stop();
                }

            }, 200);
            // you could load more data here using d3.json() again...
            drawDots();
        }
    });

}//end init

function initializeChart() {
    chart = d3.select("#chartDiv").append("svg")
        .attr("width", width)
        .attr("height", height);

    chart.plotArea = chart.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
}

function createAxes() {

    // x axis
    x.domain([dataXRange.min, dataXRange.max]);

    chart.xAxis = d3.axisBottom()
        .tickSizeOuter(0)
        .scale(x);

    chart.xAxisContainer = chart.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(" + (margin.left) + ", " + (chartHeight + margin.top) + ")")
        .call(chart.xAxis);

    // x axis header label
    chart.append("text")
        .attr("class", "x axis scatter-xaxis-label")
        .style("font-size", "12px")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (margin.left + chartWidth / 2.0) + ", " + (chartHeight + (margin.bottom / 2.0)) + ")")
        .text(xAxisLabelHeader);

    // y axis labels
    y.domain([dataYRange.min, dataYRange.max]);

    chart.yAxis = d3.axisLeft()
        .scale(y);

    chart.yAxisContainer = chart.append("g")
        .attr("class", "y axis scatter-yaxis")
        .attr("transform", "translate(" + margin.left + ", " + margin.top + ")")
        .call(chart.yAxis);

    // y axis header label
    chart.append('text')
        .style("font-size", "12px")
        .attr("class", "heatmap-yaxis")
        .attr("text-anchor", "middle")
        .attr("transform", "translate(" + (margin.left / 2.0) + ", " + (chartHeight / 2.0) + ") rotate(-90)")
        .text(yAxisLabelHeader);
}

function distance(x1, y1, x2, y2) {
    return Math.sqrt(Math.pow(x2-x1,2) + Math.pow(y2-y1,2));
}

function drawDots() {
    // do something with the data here!

    // plot dots
    dots = chart.plotArea.selectAll(".dot")
        .data(data.filter(function(d) { if (d.xVal >= dataXRange.min+increment-1 && d.xVal <= dataXRange.max+increment) return d.id}));
    
    dots.attr("cx", function(d) { return x(d.xVal); })
            .attr("cy", function(d) { return y(d.yVal); });
    
    dots.enter().append("circle")
            .attr("class", "dot")
            .style("fill","maroon")
            .attr("cx", function(d) { return x(d.xVal); })
            .attr("cy", function(d) { return y(d.yVal); })
            .attr("r", circleRadius)
            .on("mouseover", function(d) {
                    chart.plotArea.selectAll(".dot")
                    .filter(function(b) {if (distance(+b.xVal, +b.yVal, +d.xVal, +d.yVal) <= circleRadius*3) return b.id})                    .style("fill","steelblue");             
            })
            .on("mouseout", function(d) {
                chart.plotArea.selectAll(".dot")
                .style("fill","maroon");
            });
    
    dots.exit().remove();
}

