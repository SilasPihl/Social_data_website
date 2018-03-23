
//Width and height
var w = 1000;
var h = 600;

//Define map projection
var projection = d3.geoMercator()
        .scale(50000)
        .center([-74, 40.75])
        .translate([w/2, h/2]);

//Define path generator
var path = d3.geoPath()
                 .projection(projection);

//Create SVG element
var map_svg = d3.select("#part2_map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g");

var color = d3.scaleOrdinal()
              .range(["rgb(12, 150, 50)","rgb(0, 128, 128) ","rgb(0, 0, 128) ","rgb(128, 0, 0)", "rgb(200, 150, 180)"])

var xScale;
var yScale;
var xAxis;
var yAxis;
var dots;
var time_svg;
var brush;

//Load in GeoJSON data
d3.json("data/boroughs.json", function(json) {
    color.domain(json.features.map(function(j) {
        return j.properties.BoroCode;
    }));

    //Bind data and create one path per GeoJSON feature
    map_svg.selectAll("path")
       .data(json.features)
       .enter()
       .append("path")
       .attr("d", path)
       .style("fill", function (d) {
        return color(d.properties.BoroCode)
       });

  d3.csv("data/all_murder.csv", function (data) {
      
    var data_format = d3.timeFormat("%Y-%m-%d");

    data.forEach (function(d) {
        d.RPT_DT = data_format(new Date(d.RPT_DT));
    }) 

    dots = map_svg.selectAll("circle")
                  .data(data)
                  .enter()
                  .append("circle")
                  .attr("class", "dot")
                  .attr("cx", function(d) {
                      return projection([d.Longitude, d.Latitude])[0];
                  })
                  .attr("cy", function(d) {
                      return projection([d.Longitude, d.Latitude])[1];
                  })
                  .attr("r", 2)
                  .style("fill", "yellow")
                  .style("stroke", "gray")
                  .style("stroke-width", 0.25)
                  .style("opacity", 0.75)
                  .append("title")         //Simple tooltip
                  .text(function(d) {
                       return new Date(d.key);
                  });

    map_svg.selectAll("text")
        .data(json.features)
        .enter()
        .append("text")
        .attr("fill", "black")
        .attr("class", "map-label")
        .attr("transform", function(d) {
            var c = path.centroid(d);
            return "translate("+c[0]+","+c[1]+")"
        })
        .attr("text-anchor", "middle")
        .text(function(d) {
            return d.properties.BoroName;
        });
 

 // TODO: Fill in days with 0 occurrences

    // Counting murders per day
    var murdersPerDay = d3.nest()
      .key(function(d) { return d.RPT_DT; })
      .rollup(function(v) { return d3.sum(v, function(d) { return 1; }); })
      .sortKeys(d3.ascending)
      .entries(data);

    createLineChart(murdersPerDay)

 function createLineChart (data) {
    // Margins
    var m = {
        top: 10,
        right: 40,
        bottom: 30,
        left: 40
    }

    var w = 800;
    var h = 200;

    var minDate = d3.min(data.map(function(d) { return new Date(d.key); }));
    var maxDate = d3.max(data.map(function(d) { return new Date(d.key); }));

    xScale = d3.scaleTime()
               .domain([minDate, maxDate])
               .range([0, w])

    yScale = d3.scaleLinear()
               .domain([0, d3.max(data.map(function(d) { return d.value; }))])
               .range([h, 0])

    var formatYear = d3.timeFormat("%Y");

    xAxis = d3.axisBottom()
              .scale(xScale)
              // .ticks(10)
              .tickFormat(formatYear);

    yAxis = d3.axisLeft()
              // .ticks(10)
              .scale(yScale);

    var line = d3.line()
                 // .defined(function(d) {
                 //  return d.value >= 0 && d.value < 1000 
                 // })
                 .x(function(d) { return xScale(new Date(d.key)); })
                 .y(function(d) { return yScale(new Date(d.value)); })

    // access div element
    time_svg = d3.select("#part2_linechart")
                .append("svg")
                .attr("width", w + m.left + m.right)
                .attr("height", h + m.top + m.bottom*2)
                .append("g")
                .attr("transform", "translate(" + m.left + "," + m.top + ")");

    time_svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

    time_svg.append("g")
            .attr("class", "axis")
            .call(yAxis);

    // append bins
    time_svg.append("path")
       .datum(data)
       .attr("class", "line")
       .attr("d", line);

    // append labels
    time_svg.append("text")
        .attr("x", 0-(h / 2))
        .attr("y", 0-m.left)
        .attr("dy", "1em")
        .attr("transform", "rotate(-90)")
        .style("text-anchor", "middle")
        .text("# of Murders Committed");

    time_svg.append("text")
        .attr("transform",
            "translate(" + (w / 2) + " ," +
            (h + m.bottom) + ")")
        .style("text-anchor", "middle")
        .text("Day");




    // make brush
    brush = d3.brushX()
                  .extent([[0, 0],[w, h - 1]])
                  .on("brush end", brushed);

    // brush
    time_svg.append("g")
        .attr("class", "brush")
        .call(brush)
        .call(brush.move, [600, 700]);

    // time_svg.select('.brush')
    //     .call(brush);
}

// TODO Make functionality to remove brush and show all values again

function brushed () {
  var sel = d3.event.selection
  if (sel != null) {
    d3.selectAll('.dot')
      .style("fill", function(d) {
        var dotDate = xScale(new Date(d.RPT_DT));
        if (sel[0] <= dotDate && dotDate <= sel[1]) {
            return "yellow";
        } else { 
            return "transparent";
        }
        })
      .style("stroke", function(d) {
        var dotDate = xScale(new Date(d.RPT_DT));
        if (sel[0] <= dotDate && dotDate <= sel[1]) {
            return "gray";
        } else { 
            return "transparent";
        }
        });

  }
}



  });
});
function animate_time () {
  time_svg.select(".brush").call(brush.move, [0,100]);
  
  time_svg.select(".brush")
        .transition()
        .ease(d3.easeLinear)
        .duration(10000)
        .call(brush.move, [xScale.range()[1] - 100, xScale.range()[1]])
}


// TODO lav en remove map labels
