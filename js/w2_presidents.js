var margin = {top: 30, right: 20, bottom: 33, left: 50},
width = 600 - margin.left - margin.right,
height = 270 - margin.top - margin.bottom;

// Adds the svg canvas
var svg = d3.select("body")
  .append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Set the ranges
var x = d3.scale.linear().range([0, width]);
var y = d3.scale.linear().range([height, 0]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
  .orient("bottom").ticks(9);

var yAxis = d3.svg.axis().scale(y)
  .orient("left").ticks(0);

// Get the data
d3.csv("data/president.csv", function( data) {
  // if (error) throw error;
  data.forEach(function(d) {
      d.y = Math.round(Math.random() * 30); //New random 
      d.x = +d.months;
      // d.close = +d.no;
  });

  // Scale the range of the data
  x.domain(d3.extent(data, function(d) { return d.x; }));
  y.domain([0, d3.max(data, function(d) { return d.y; })]);

  // Add the scatterplot
  svg.selectAll("dot")
  .data(data)
  .enter().append("circle")
  .attr("class","circle")
  .attr("r", 3.5)
  .attr("cx", function(d) { return x(d.x); })
  .attr("cy", function(d) { return y(d.y); })
  .attr("fill","white")
  .attr("stroke", "black")
  .attr("stroke-width","1");

  // Add the X Axis
  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

  // Add the Y Axis
  svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);


          // text label for the y axis
  svg.append("text")
    .attr("transform",
          "translate(" + (width/2) + " ," + 
                         (height + margin.top + 20) + ")")
    .attr("y", 0 - margin.bottom)
    .attr("x",0 - margin.right)
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Months in office");   

});