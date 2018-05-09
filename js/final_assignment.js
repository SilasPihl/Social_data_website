var dur = 100;
var bronxActive=true;
var manhattanActive=true;
var queensActive=true;
var brooklynActive=true;
var statenIslandActive=true;

color = d3.scaleOrdinal()
              .range(["rgb(12, 150, 50)","rgb(0, 128, 128) ","rgb(0, 0, 128) ","rgb(128, 0, 0)", "rgb(200, 150, 180)"])

hours = _.range(24);

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
  d3.csv("data/all1718Bronx.csv", function (bronx) {
    d3.csv("data/all1718Manhattan.csv", function (manhattan) {
      d3.csv("data/all1718Queens.csv", function (queens) {
        d3.csv("data/all1718StatenIsland.csv", function (statenIsland) {
          d3.csv("data/all1718Brooklyn.csv", function (brooklyn) {
            data = bronx.concat(manhattan).concat(queens).concat(statenIsland).concat(brooklyn);  
            console.log("data: + "+ data.length + " bronx: "+ bronx.length+ " manhattan: "+ manhattan.length);  
            data.forEach (function(d) {
              //console.log(d.ON_STREET_NAME);
              d.DATE = date_format(new Date(d.DATE));
              d.TIME = d.TIME.split(":")[0];
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
            accidentsPerHour_all = accidentsPerHour
            initBarChart(accidentsPerHour)

          });
        });
      });
    });
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

  // console.log("minDate equals " + minDate);
  // console.log("maxDate equals " + maxDate);

  // this fill in zeroes in days without murders
  var dateRange = d3.timeDays(minDate, maxDate);

  data = dateRange.map(function(day) {
    return _.find(data, { key: date_format(day) }) || { key: date_format(day), value: 0 };
  });

  return data;
}

function initMapChart (data, json) {
  var chartDiv = document.getElementById("d3_map");
  map_w = chartDiv.clientWidth;
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
                  console.log(""+d.UNIQUE_KEY);
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
      left: 40
  }
  var chartDiv = document.getElementById("d3_linechart");
  var time_w = chartDiv.clientWidth;
  var time_h = 200;

  // create time_svg
  time_svg = d3.select("#d3_linechart")
               .append("svg") 
               .attr("width", time_w + line_m.left + line_m.right)
               .attr("height", time_h + line_m.top + line_m.bottom*2)
               .append("g")
               .attr("transform", "translate(" + line_m.left + "," + line_m.top + ")");

  // Scales
  maxValue = d3.max(data.map(function(d) { return d.value; }));
  xScale_time_svg = d3.scaleTime().domain([minDate, maxDate]).range([0, time_w]);
  yScale_time_svg = d3.scaleLinear().domain([0, maxValue]).range([time_h, 0]);

  // Axes
  xAxis_time_svg = d3.axisBottom().scale(xScale_time_svg).tickFormat(formatMonthYear);
  yAxis_time_svg = d3.axisLeft().scale(yScale_time_svg);  
  time_svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + time_h + ")").call(xAxis_time_svg);
  time_svg.append("g").attr("class", "y axis").call(yAxis_time_svg);

  // Axis labels
  time_svg.append("text")
          .attr("y", 0-line_m.left*1.2)
          .attr("x", 0-(time_h * 0.5))
          .attr("dy", "1em")
          .attr("transform", "rotate(-90)")
          .style("text-anchor", "middle")
          .text("No. of Traffic accidentes");

  time_svg.append("text").style("text-anchor", "middle").text("Months")
          .attr("transform", 
            "translate(" + (time_w * 0.5) + " ," + (time_h + line_m.top + line_m.bottom) + ")");

  // Line path
  line = d3.line()
           .x(function(d) { return xScale_time_svg(new Date(d.key)); })
           .y(function(d) { return yScale_time_svg(d.value); });
  time_svg.append("path")
          .datum(data)
          .attr("class", "line")
          .attr("d", line);

  // make brush for timeline
  time_brush = d3.brushX()
                .extent([[0, 0],[time_w, time_h - 1]])
                .on("brush end", brushed_timeChart);

  // timeline brush
  time_svg.append("g")
          .attr("class", "brush")
          .call(time_brush);

  time_svg.select('.brush')
          .call(time_brush);

  // time_svg.select(".brush").call(time_brush.move, [0,0]);

  init_time_svg_slider();    
}

function initBarChart (data) {
  var chartDiv = document.getElementById("d3_bar");
  barW = chartDiv.clientWidth;
  barH = 200;

  // Margins
  bar_m = {
      top: 10,
      right: 40,
      bot: 30,
      left: 40
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
         .attr("font-size", "10px")
         .attr("fill", "white");

  // Axes
  xAxis_bar = d3.axisBottom(xBarScale);
  yAxis_bar = d3.axisLeft(yBarScale).tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax * 0.2));
  bar_svg.append("g").attr("class", "x axis").attr("transform", "translate(0," + barH + ")").call(xAxis_bar);
  bar_svg.append("g").attr("class", "y axis").call(yAxis_bar);    

  // Axes labels
  bar_svg.append("text")
         .attr("y", 0- bar_m.left*1.20)
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
  minDate = d3.min(data.map(function(d) { return new Date(d.key); }));
  maxDate = d3.max(data.map(function(d) { return new Date(d.key); }));

  // console.log("minDate equals " + minDate);
  // console.log("maxDate equals " + maxDate);

  xScale_time_svg.domain([minDate, maxDate]);
  maxNo = d3.max(data.map(function(d) { return d.value; }));
  // console.log(maxNo);
  yScale_time_svg.domain([0, maxNo]);

  var formatMonthYear = d3.timeFormat("%Y");

  // Axes
  xAxis_time_svg.scale(xScale_time_svg);
  yAxis_time_svg.scale(yScale_time_svg);  
  time_svg.select(".y.axis").transition().duration(500).call(yAxis_time_svg)
  time_svg.select(".x.axis").transition().duration(500).call(xAxis_time_svg)

  // lines
  line = d3.line()
           .x(function(d) { return xScale_time_svg(new Date(d.key)); })
           .y(function(d) { return yScale_time_svg(d.value); });
  
  time_svg.select(".line")
          .datum(data)
  
  time_svg.select(".line")
          .transition()
          .duration(1000)
          .attr("d", line);
  
  lineChartData = data;
}

function updateBarChart (data) {
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
          return "rgb(0, 0, " + Math.round(255-yBarScale(d)) + ")";
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

function init_time_svg_slider() {

  time_svg_slider = d3.sliderHorizontal()
    .min(1)
    .max(30)
    .step(1)
    .width(300)
    .on('end', val => {
      d3.select("#time_svg_time_interval").text(val);
      updateLineChartFromDays(val);
    });

  var g = d3.select("div#time_svg_slider").append("svg")
    .attr("width", 350)
    .attr("height", 100)
    .append("g")
    .attr("transform", "translate(30,30)");

  g.call(time_svg_slider);

  d3.select("#time_svg_time_interval").text((time_svg_slider.value()));
}

function reset_time_svg_slider () {
  time_svg_slider.value(1);
  updateLineChartFromDays(1);
}

function toggleBrooklyn(){
  brooklynActive = !brooklynActive;
  updateDots();
}
function toggleBronx(){
  bronxActive = !bronxActive;
  updateDots();
}
function toggleManhattan(){
  manhattanActive = !manhattanActive;
  updateDots();
}
function toggleStatenIsland(){
  statenIslandActive = !statenIslandActive;
  updateDots();
}
function toggleQueens(){
  queensActive = !queensActive;
  updateDots();
}
function updateDots(){
  dots = d3.selectAll('.dot');
  console.log(brooklynActive)
    dots.attr("class", function(d) {
      if(bronxActive && d.BOROUGH=="BRONX" ||
       manhattanActive && d.BOROUGH=="MANHATTAN" ||
       queensActive && d.BOROUGH=="QUEENS" ||
       brooklynActive && d.BOROUGH=="BROOKLYN" ||
       statenIslandActive && d.BOROUGH=="STATEN ISLAND"){
          this.parentNode.appendChild(this); 
       return "dot activeDot";
      } else { 
        return "dot noneActiveDot";
        }
  });
}

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
  accidentsPerHour = new Uint32Array(24);

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
    dotDate = xScale_time_svg(new Date(d.DATE));
    var cx = parseFloat(d3.select(this).attr("cx"));
    var cy = parseFloat(d3.select(this).attr("cy"));

    // checking if the dot is inside both the timeline and map interval 
    // if(x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 && t0 <= dotDate && dotDate <= t1){
    if(x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 && t0 <= dotDate && dotDate <= t1 && b0 <= xBarScale(d.TIME) && xBarScale(d.TIME) <= b1){
        accidentsPerHour[d.TIME]=accidentsPerHour[d.TIME]+1;
        return "dot activeDot";
    } else { 
     
        return "dot noneActiveDot";
    }        
  });

  updateBarChart(accidentsPerHour);
}



function fillDots () {
    d3.selectAll('.dot')
      .attr("class", "dot activeDot");
}

function reset_brush() {
  sel_time = [0,1000000];
  sel_bar = [0,1000000];
  sel_map = [[0,0], [100000,100000]];
  
  // time_svg.select(".brush").call(brush.move, [0,0]);
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
  
  // console.log("Brush size = " + brushSize);
  // console.log("Transition variation = " + transVar);
  time_svg.select(".brush").call(brush.move, [0,brushSize]);
  time_svg.select(".brush")
          .transition()
          .ease(d3.easeLinear)
          .duration(transVar)
          .call(brush.move, [xScale_time_svg.range()[1] - brushSize, xScale_time_svg.range()[1]]);
}

function hideShow (id) {
  var id_button = id + "_button";
  var id_text = id + "_text";
  var x = document.getElementById(id);
  var xText = document.getElementById(id_text);
  var xButton = document.getElementById(id_button);

  console.log("Changing visability of: " + id);

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