var dur = 100;
var bronxActive=true;
var manhattanActive=true;
var queensActive=true;
var brooklynActive=true;
var statenIslandActive=true;

var groups;
var colors = d3.scaleOrdinal(d3.schemeCategory10);
color = d3.scaleOrdinal()
              .range(["rgb(255, 179, 166) ","rgb(169, 186, 255) ","rgb(243, 195, 240)", "rgb(180, 165, 145)","rgb(170, 255, 201)"])

hours = _.range(24);

var statenIslandBtn = document.getElementById("StatenIslandBtn");
statenIslandBtn.style.backgroundColor = '#ffb3a6';

var brooklynBtn = document.getElementById("BrooklynBtn");
brooklynBtn.style.backgroundColor = '#f3c3f0';

var manhattanBtn = document.getElementById("ManhattanBtn");
manhattanBtn.style.backgroundColor = '#b4a591';

var bronxBtn = document.getElementById("BronxBtn");
bronxBtn.style.backgroundColor = '#aaffc9';

var queensBtn = document.getElementById("QueensBtn");
queensBtn.style.backgroundColor = '#a9baff';

sel_map = [[0,0], [100000,100000]];
sel_time = [0,1000000];
sel_bar = [0,1000000];
accidentsPerHour = new Uint32Array(24);

formatMonthYear = d3.timeFormat("%b-%y");
date_format = d3.timeFormat("%Y-%m-%d");



//Load in GeoJSON data
d3.json("data/boroughs.json", function(json) {
  color.domain(json.features.map(function(j) {
      return j.properties.BoroCode;
  }));

  //Bronx
  //Manhattan
  //Queens
  //StatenIsland
  //Brooklyn

  d3.csv("data/accidentsInNewYork.csv", function (data) {
    // data = bronx.concat(manhattan).concat(queens).concat(statenIsland).concat(brooklyn); 
         var accidentsPerHour = [
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 }
      ]; 
    data.forEach (function(d) {
      d.DATE = date_format(new Date(d.DATE));
      d.TIME = d.TIME.split(":")[0];
    }); 
    data.forEach (function(d) {

         if(d.BOROUGH=="BRONX"){
          accidentsPerHour[d.TIME].bronx=accidentsPerHour[d.TIME].bronx+1;
      }else if(d.BOROUGH=="MANHATTAN"){
            accidentsPerHour[d.TIME].manhattan=accidentsPerHour[d.TIME].manhattan+1;
      }else if(d.BOROUGH=="QUEENS"){
            accidentsPerHour[d.TIME].queens=accidentsPerHour[d.TIME].queens+1;
      }else if(d.BOROUGH=="BROOKLYN"){
         accidentsPerHour[d.TIME].brooklyn=accidentsPerHour[d.TIME].brooklyn+1;
      }else if(d.BOROUGH=="STATEN ISLAND"){
          accidentsPerHour[d.TIME].statenIsland=accidentsPerHour[d.TIME].statenIsland+1;
      }
    });
    data = data.filter (function(d, i) {
      if (i%20 != 0) {
        return false;
      }
      else {
        return true;
      }
    });

    // Counting Accidents per day
    accidentsPerDay = getAccidentsPerDay(data);
    // accidentsPerHour = getAccidentsPerHour(data);

    updatedKeyValueArray = accidentsPerDay;
    
    initLineChart(accidentsPerDay)
    initMapChart(data, json) // this before initBarChart
    //accidentsPerHour_all = accidentsPerHour
    initBarChart2(accidentsPerHour)

  });
});

function getAccidentsPerDay(data) {
  // Counting accidents per day
  data_per_day = d3.nest()
                   .key(function(d) { return d.DATE; })
                   .rollup(function(v) { return d3.sum(v, function(d) { return 1; }); })
                   .sortKeys(d3.ascending)
                   .entries(data);

  data_per_day = fillWithNullDays(data_per_day);

  return data_per_day;
}

function fillWithNullDays (data) {
  minDate = d3.min(data.map(function(d) { return new Date(d.key); }));
  maxDate = d3.max(data.map(function(d) { return new Date(d.key); }));



  // this fill in zeroes in days without murders
  var dateRange = d3.timeDays(minDate, maxDate);

  data = dateRange.map(function(day) {
    return _.find(data, { key: date_format(day) }) || { key: date_format(day), value: 0 };
  });

  return data;
}

function initMapChart (data, json) {
  var chartDiv = document.getElementById("d3_map");
  map_w = chartDiv.clientWidth-20;
  map_h = 550;

  //Define map projection
  var projection = d3.geoMercator()
          // .scale(50000)
          .scale(90*map_w+1300)
          .center([-74, 40.71])
          .translate([map_w * 0.5, map_h * 0.5]);

  //Define path generator
  var path = d3.geoPath()
               .projection(projection);

  //Bind data and create one path per GeoJSON feature
  //Create SVG element
  map_svg = d3.select("#d3_map")
              .append("svg")
              .attr("width", map_w)
              .attr("height", map_h)
              .append("g");

  map_svg.selectAll("path")
         .data(json.features)
         .enter()
         .append("path")
         .attr("d", path)
         .style("fill", function (d) {
          return color(d.properties.BoroCode)
         });

  dots = map_svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", function(d) { 
                  accidentsPerHour[d.TIME] = accidentsPerHour[d.TIME] + 1;
                  return "dot activeDot";
                })
                .attr("cx", function(d) {
                    return projection([d.LONGITUDE, d.LATITUDE])[0];
                })
                .attr("cy", function(d) {
                    return projection([d.LONGITUDE, d.LATITUDE])[1];
                })
                .attr("r", 2)
                .on("mouseover", function(d) {
                  if(d3.select(this).attr("class")=="dot activeDot"){
               //   console.log(""+d.UNIQUE_KEY);
                  }
                //})
               // .append("title")         //Simple tooltip
                //.text(function(d) {
                  //   return "Street Name "+d.ON_STREET_NAME+ " key " + d.UNIQUE_KEY;
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

  // make brush for map
  map_brush = d3.brush()
                .on("brush end", brushed_mapChart);

  // map brush
  map_svg.append("g")
          .attr("class", "brush")
          .call(map_brush); 
}

function initLineChart (data) {
  // Margins
  var line_m = {
      top: 10,
      right: 40,
      bottom: 30,
      left: 45
  }

  var chartDiv = document.getElementById("d3_linechart");
  var line_w = chartDiv.clientWidth-30;
  var line_h = 200;

  // create line_svg
  line_svg = d3.select("#d3_linechart")
               .append("svg") 
               .attr("width", line_w + line_m.left + line_m.right)
               .attr("height", line_h + line_m.top + line_m.bottom*2)
               // .attr("style", "paddingRight: '50'")
               .append("g")
               .attr("transform", "translate(" + line_m.left + "," + line_m.top + ")");

  // Scales
  maxValue = d3.max(data.map(function(d) { return d.value; }));
  xScale_line_svg = d3.scaleTime().domain([minDate, maxDate]).range([0, line_w]);
  yScale_line_svg = d3.scaleLinear().domain([0, maxValue]).range([line_h, 0]);

  // Axes
  xAxis_line_svg = d3.axisBottom().scale(xScale_line_svg).tickFormat(formatMonthYear);
  yAxis_line_svg = d3.axisLeft().scale(yScale_line_svg);  
  line_svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + line_h + ")").call(xAxis_line_svg);
  line_svg.append("g").attr("class", "y axis").call(yAxis_line_svg);

  // Axis labels
  line_svg.append("text")
          .attr("y", 0-line_m.left - 5)
          .attr("x", 0-(line_h * 0.5))
          .attr("dy", "1em")
          .attr("transform", "rotate(-90)")
          .style("text-anchor", "middle")
          .text("No. of Traffic accidentes");

  line_svg.append("text").style("text-anchor", "middle").text("Months")
          .attr("transform", 
            "translate(" + (line_w * 0.5) + " ," + (line_h + line_m.top + line_m.bottom) + ")");

  // Line path
  line = d3.line()
           .x(function(d) { return xScale_line_svg(new Date(d.key)); })
           .y(function(d) { return yScale_line_svg(d.value); });
  line_svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);

  // make brush for timeline
  line_brush = d3.brushX()
                .extent([[0, 0],[line_w, line_h - 1]])
                .on("brush end", brushed_timeChart);

  // timeline brush
  line_svg.append("g")
          .attr("class", "brush")
          .call(line_brush);

  line_svg.select('.brush')
          .call(line_brush);

  // line_svg.select(".brush").call(line_brush.move, [0,0]);

  init_line_svg_slider();    
}

function initBarChart2 (data) {
  var chartDiv = document.getElementById("d3_bar");
  barW = chartDiv.clientWidth-30;
  barH = 200;

  // Margins
  bar_m = {
      top: 10,
      right: 40,
      bot: 30,
      left: 45
  }

  //Create scale functions

    var stack = d3.stack()
              .keys([ "bronx", "manhattan", "queens", "brooklyn", "statenIsland" ])
              .order(d3.stackOrderDescending);
  console.log(data);
  //Data, stacked
  var series = stack(data);
  console.log(series)

  var ymax=d3.max(data, function(d) {
            return d.bronx + d.manhattan + d.queens+ d.brooklyn+ d.statenIsland;
          });
  xBarScale = d3.scaleBand()
              .range([0, barW])
              .domain(d3.range(data.length))
              .paddingInner(0.001);

  yBarScale = d3.scaleLinear()
              .range([barH,20])
              .domain([0,       
                d3.max(data, function(d) {
                  return d.bronx + d.manhattan + d.queens+ d.brooklyn+ d.statenIsland;
                })
              ]);          

  bar_svg = d3.select("#d3_bar")
              .append("svg")
              .attr("width", barW + bar_m.left + bar_m.right)
              .attr("height", barH + bar_m.top + bar_m.bot*2);
            //  .append("g")
              //.attr("transform", "translate(" + bar_m.left + "," + bar_m.top + ")");
  groups = bar_svg.selectAll("g")
        .data(series)
        .enter()
        .append("g")
        .style("fill", function(d, i) {
          console.log(i);
          console.log(colors(i))
          return colors(i);
        });

  var rects = groups.selectAll("rect")
         .data(function(d) { return d; })
         .enter()
         .append("rect")
         .attr("x", function(d, i) {
            return xBarScale(i);
         })
         .attr("y", function(d) {
            return yBarScale(d[1]);
         })
         .attr("width", xBarScale.bandwidth()-4)
         .attr("height", function(d) {
            return yBarScale(d[0]) - yBarScale(d[1])
         });

  // value labels
  bar_svg.selectAll("text")
         .data(data)
         .enter()
         .append("text")
         .text(function(d) {
            return d;
         })
         .attr("text-anchor", "middle")
         .attr("x", function(d, i) {
            return xBarScale(i)+barW/70;
         })
         .attr("y", function(d) {
            return barH - yBarScale(d) - 20;
         })
         .attr("font-family", "sans-serif")
         .attr("font-size", "6px")
         .attr("fill", "white");

  // Axes
  xAxis_bar = d3.axisBottom(xBarScale);
  yAxis_bar = d3.axisLeft(yBarScale).tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax * 0.2));
  bar_svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + barH + ")").call(xAxis_bar);
  bar_svg.append("g").attr("class", "y axis").call(yAxis_bar);    

  // Axes labels
  bar_svg.append("text")
         .attr("y", 0- bar_m.left-5)
         .attr("x", 0-(barH * 0.5))
         .attr("dy", "1em")
         .attr("transform", "rotate(-90)")
         .style("text-anchor", "middle")
         .text("No. of accidents"); 
  bar_svg.append("text").style("text-anchor", "middle").text("Hours")
         .attr("transform", "translate(" + (barW * 0.5 ) + " ," + (barH + bar_m.top + bar_m.bot) + ")");    

  // make brush for bar chart
  bar_brush = d3.brushX()
                .extent([[0, 0],[barW, barH - 1]])
                .on("brush end", brushed_barChart);

  bar_svg.append("g")
          .attr("class", "brush")
          .call(bar_brush);   

 // updateBarChart(data);           
}
function initBarChart (data) {
  var chartDiv = document.getElementById("d3_bar");
  barW = chartDiv.clientWidth-30;
  barH = 200;

  // Margins
  bar_m = {
      top: 10,
      right: 40,
      bot: 30,
      left: 45
  }

  //Create scale functions
  var ymax = d3.max(data);
  xBarScale = d3.scaleBand().range([0, barW]).domain(hours.map(function(d) { return d; })).paddingInner(0.001);
  yBarScale = d3.scaleLinear().range([barH,20]).domain([0 , ymax]);           

  bar_svg = d3.select("#d3_bar")
              .append("svg")
              .attr("width", barW + bar_m.left + bar_m.right)
              .attr("height", barH + bar_m.top + bar_m.bot*2)
              .append("g")
              .attr("transform", "translate(" + bar_m.left + "," + bar_m.top + ")");

  bar_svg.selectAll("rect")
         .data(data)
         .enter()
         .append("rect")
         .attr("x", function(d, i) {
            return xBarScale(i);
         })
         .attr("y", function(d) {
            return yBarScale(d);
         })
         .attr("width", xBarScale.bandwidth()-4)
         .attr("height", function(d) {
            return barH - yBarScale(d)
         })
         .attr("fill", function(d) {

          return "rgb(0, 0, " + Math.round(yBarScale(d)) + ")";
         });

  // value labels
  bar_svg.selectAll("text")
         .data(data)
         .enter()
         .append("text")
         .text(function(d) {
            return d;
         })
         .attr("text-anchor", "middle")
         .attr("x", function(d, i) {
            return xBarScale(i)+barW/70;
         })
         .attr("y", function(d) {
            return barH - yBarScale(d) - 20;
         })
         .attr("font-family", "sans-serif")
         .attr("font-size", "6px")
         .attr("fill", "white");

  // Axes
  xAxis_bar = d3.axisBottom(xBarScale);
  yAxis_bar = d3.axisLeft(yBarScale).tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax * 0.2));
  bar_svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + barH + ")").call(xAxis_bar);
  bar_svg.append("g").attr("class", "y axis").call(yAxis_bar);    

  // Axes labels
  bar_svg.append("text")
         .attr("y", 0- bar_m.left-5)
         .attr("x", 0-(barH * 0.5))
         .attr("dy", "1em")
         .attr("transform", "rotate(-90)")
         .style("text-anchor", "middle")
         .text("No. of accidents"); 
  bar_svg.append("text").style("text-anchor", "middle").text("Hours")
         .attr("transform", "translate(" + (barW * 0.5 ) + " ," + (barH + bar_m.top + bar_m.bot) + ")");    

  // make brush for bar chart
  bar_brush = d3.brushX()
                .extent([[0, 0],[barW, barH - 1]])
                .on("brush end", brushed_barChart);

  bar_svg.append("g")
          .attr("class", "brush")
          .call(bar_brush);   

  updateBarChart(data);             
}

function updateLineChartFromDays (noOfDays) {
  noOfDays = noOfDays
  coeff = 1000 * 60 * 60 * 24 * noOfDays;
  
  accidentsPerSomething = d3.nest()
                          .key(function(d) { return date_format(new Date(Math.round(new Date(d.key) / coeff) *coeff)); })
                          .rollup(function(v) { return d3.sum(v, function(d) { return d.value; }); })
                          .sortKeys(d3.ascending)
                          .entries(updatedKeyValueArray);

  updateLineChart(accidentsPerSomething)
}

function updateLineChart (data) {
 // minDate = d3.min(data.map(function(d) { return new Date(d.key); }));
  //maxDate = d3.max(data.map(function(d) { return new Date(d.key); }));



  //xScale_line_svg.domain([minDate, maxDate]);
  maxNo = d3.max(data.map(function(d) { return d.value; }));

  yScale_line_svg.domain([0, maxNo]);

  var formatMonthYear = d3.timeFormat("%Y");

  // Axes
 // xAxis_line_svg.scale(xScale_line_svg);
  yAxis_line_svg.scale(yScale_line_svg);  
  line_svg.select(".y.axis").transition().duration(500).call(yAxis_line_svg)
  //line_svg.select(".x.axis").transition().duration(500).call(xAxis_line_svg)

  // lines
  line = d3.line()
           .x(function(d) { return xScale_line_svg(new Date(d.key)); })
           .y(function(d) { return yScale_line_svg(d.value); });
  
  line_svg.select(".line")
          .datum(data)
  
  line_svg.select(".line")
          .transition()
          .duration(1000)
          .attr("d", line);
  
  lineChartData = data;
}

function updateBarChart2 (data) {
  var stack = d3.stack()
              .keys([ "bronx", "manhattan", "queens", "brooklyn", "statenIsland" ])
              .order(d3.stackOrderDescending);
  console.log(data);
  //Data, stacked
  var series = stack(data);

  ymax=d3.max(data, function(d) {
            return d.bronx + d.manhattan + d.queens+ d.brooklyn+ d.statenIsland;
          });
  yBarScale.domain([0, ymax]);
  yAxis_bar = d3.axisLeft(yBarScale)
            .tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax * 0.2));

  bar_svg.selectAll("rect")
         .data(data)
         .transition()
         .duration(dur)
         .attr("y", function(d) {
          return yBarScale(d[1]);
          })
         .attr("height", function(d) {
          return barH - yBarScale(d[1]);
          });

  //Update all labels
  bar_svg.selectAll("text")
         .data(data)
         .transition()
         .duration(dur)
         .text(function(d) {
            return d;
         })
         .attr("y", function(d) {
            return yBarScale(d)+15;
         });

   bar_svg.select(".y.axis")
      .transition()
      .duration(dur)
      .call(yAxis_bar.tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax * 0.2)));
}


function updateBarChart (data) {

  console.log(data);
  ymax=d3.max(data);
  yBarScale.domain([0, ymax]);
  yAxis_bar = d3.axisLeft(yBarScale)
            .tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax * 0.2));

  bar_svg.selectAll("rect")
         .data(data)
         .transition()
         .duration(dur)
         .attr("y", function(d) {
          return yBarScale(d);
          })
         .attr("height", function(d) {
          return barH - yBarScale(d);
          })
         .attr("fill", function(d) {
          return "rgb("+ Math.round(255-yBarScale(d)) +", "+ Math.round(yBarScale(d)) +", 0)";  
         });

  //Update all labels
  bar_svg.selectAll("text")
         .data(data)
         .transition()
         .duration(dur)
         .text(function(d) {
            return d;
         })
         .attr("y", function(d) {
            return yBarScale(d)+15;
         });

   bar_svg.select(".y.axis")
      .transition()
      .duration(dur)
      .call(yAxis_bar.tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax * 0.2)));
}

function init_line_svg_slider() {

  line_svg_slider = d3.sliderHorizontal()
    .min(1)
    .max(30)
    .step(1)
    .width(300)
    .on('end', val => {
      d3.select("#line_svg_line_interval").text(val);
      updateLineChartFromDays(val);
    });

  var g = d3.select("div#line_svg_slider").append("svg")
    .attr("width", 350)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  g.call(line_svg_slider);

  d3.select("#line_svg_line_interval").text((line_svg_slider.value()));
}

function reset_line_svg_slider () {
  line_svg_slider.value(1);
  updateLineChartFromDays(1);
}

function toggleBrooklyn(){
  brooklynActive = !brooklynActive;
  brushed();
}
function toggleBronx(){
  bronxActive = !bronxActive;
  brushed();
}
function toggleManhattan(){
  manhattanActive = !manhattanActive;
  brushed();
}
function toggleStatenIsland(){
  statenIslandActive = !statenIslandActive;
  brushed();
}
function toggleQueens(){
  queensActive = !queensActive;
  brushed();
}
/*function updateDots(){
  accidentsPerHour = new Uint32Array(24);
  dots = d3.selectAll('.dot');

    dots.attr("class", function(d) {
      if(bronxActive && d.BOROUGH=="BRONX" ||
       manhattanActive && d.BOROUGH=="MANHATTAN" ||
       queensActive && d.BOROUGH=="QUEENS" ||
       brooklynActive && d.BOROUGH=="BROOKLYN" ||
       statenIslandActive && d.BOROUGH=="STATEN ISLAND"){
          accidentsPerHour[d.TIME] = accidentsPerHour[d.TIME] + 1;
          this.parentNode.appendChild(this); 
       return "dot activeDot";
      } else { 
        return "dot noneActiveDot";
        }
  });

  updateBarChart(accidentsPerHour);
}*/

function brushed_timeChart () {
  sel = d3.event.selection
  sel_time = sel ? sel : [0,1000000];
  brushed()
}

function brushed_barChart () {
  sel = d3.event.selection
  sel_bar = sel ? sel : [0,1000000];
  brushed()
}

function brushed_mapChart () {
  sel = d3.event.selection
  if (sel == null) {
    sel_map = [[0,0], [100000,100000]];
    fillDots();
  }
  else {
    sel_map = sel;
  }
  brushed()
}

function brushed (from) {
/*  a1 = new Uint32Array(24);
  a2 = new Uint32Array(24);
  a3 = new Uint32Array(24);
  a4 = new Uint32Array(24);
  a5 = new Uint32Array(24);
  accidentsPerHour = [
    Array.from(a1),
    Array.from(a2),
    Array.from(a3),
    Array.from(a4),
    Array.from(a5)
    ];*/
        var accidentsPerHour = [
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 },
        { bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 }
      ];
  var activeData = [];

  dots = d3.selectAll('.dot');

  var x0 = sel_map[0][0],
      x1 = sel_map[1][0],
      y0 = sel_map[0][1],
      y1 = sel_map[1][1];

  var t0 = sel_time[0],
      t1 = sel_time[1];

  var b0 = sel_bar[0],
      b1 = sel_bar[1];      

  brushedDataSet=[];
  var dotDate;
  dots.attr("class", function(d) {
    dotDate = xScale_line_svg(new Date(d.DATE));
    var cx = parseFloat(d3.select(this).attr("cx"));
    var cy = parseFloat(d3.select(this).attr("cy"));

    // checking if the dot is inside both the timeline and map interval 
    // if(x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 && t0 <= dotDate && dotDate <= t1){
    if(x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 && t0 <= dotDate && dotDate <= t1 && b0 <= xBarScale(d.TIME) && xBarScale(d.TIME) <= b1){
      if(bronxActive && d.BOROUGH=="BRONX"){
          accidentsPerHour[d.TIME].bronx=accidentsPerHour[d.TIME].bronx+1;
          activeData.push(d);
          return "dot activeDot";
      }else if(manhattanActive && d.BOROUGH=="MANHATTAN"){
            accidentsPerHour[d.TIME].manhattan=accidentsPerHour[d.TIME].manhattan+1;
       activeData.push(d);
        return "dot activeDot";
      }else if(queensActive && d.BOROUGH=="QUEENS"){
            accidentsPerHour[d.TIME].queens=accidentsPerHour[d.TIME].queens+1;
            activeData.push(d);
        return "dot activeDot";
      }else if(brooklynActive && d.BOROUGH=="BROOKLYN"){
         accidentsPerHour[d.TIME].brooklyn=accidentsPerHour[d.TIME].brooklyn+1;
         activeData.push(d);
        return "dot activeDot";
      }else if(statenIslandActive && d.BOROUGH=="STATEN ISLAND"){
          accidentsPerHour[d.TIME].statenIsland=accidentsPerHour[d.TIME].statenIsland+1;
          activeData.push(d);
          return "dot activeDot";
      }
    }else { 
        return "dot noneActiveDot";
    }        
  });
 /* var data1 = [];
      for (var i = 0; i < 24; i++) {
     data1.push(accidentsPerHour[0][i]+accidentsPerHour[1][i]+accidentsPerHour[2][i]+accidentsPerHour[3][i]+accidentsPerHour[4][i]);
    };
 console.log(data1);*/
 // updateBarChart2(accidentsPerHour);

  accidentsPerDay = getAccidentsPerDay(activeData);
  //if(accidentsPerDay.length > 0){
    updateLineChart(accidentsPerDay);
  //}
  
}



function fillDots () {
    d3.selectAll('.dot')
      .attr("class", "dot activeDot");
}

function reset_brush() {
  sel_time = [0,1000000];
  sel_bar = [0,1000000];
  sel_map = [[0,0], [100000,100000]];
  
  // line_svg.select(".brush").call(brush.move, [0,0]);
  // bar_svg.select(".brush").call(brush.move, [0,0]);
  // map_svg.select(".brush").call(brush.move, [[0,0],[0,0]]);

  fillDots();
  brushed()
}

function animate_time (brushSize, speed) {
  var brushSize, transVar;

  brushSize = document.getElementById('textbox_brushSize').value
  transVar = document.getElementById('textbox_brushSpeed').value

  if(!brushSize) {
    brushSize = 100;
  }
  if(!transVar) {
    transVar = 5000;
  }
  

  line_svg.select(".brush").call(line_brush.move, [0,brushSize]);
  line_svg.select(".brush")
          .transition()
          .ease(d3.easeLinear)
          .duration(transVar)
          .call(line_brush.move, [xScale_line_svg.range()[1] - brushSize, xScale_line_svg.range()[1]]);
}

function hideShow (id) {
  var id_button = id + "_button";
  var id_text = id + "_text";
  var x = document.getElementById(id);
  var xText = document.getElementById(id_text);
  var xButton = document.getElementById(id_button);


  if (x.style.display === "none") {
    x.style.display = "block";
    xText.style.display = "block";
    xButton.value = "Hide" + xButton.text;
  } else {
    x.style.display = "none";
    xText.style.display = "none";
    xButton.value = "Show" + xButton.text;
  } 
}

d3.graphScroll()
  .sections(d3.selectAll('#steps > .step'))
  .on('active', function(i){
    currentSection = i
    // if (i==3) {
    //   animate_time();
    // }
    //console.log("Section " + i) 
})

d3.graphScroll()
  .graph(d3.select('#fixedarea'))
  .container(d3.select('#fixedcontainer'))  


$('.go-to-bottom').click( function(e) {
  e.preventDefault(); 
  document.body.scrollIntoView(false);
  return false; 
});