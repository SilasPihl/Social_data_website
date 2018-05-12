initBubbles();

var dur = 100;
var bronxActive=true;
var manhattanActive=true;
var queensActive=true;
var brooklynActive=true;
var statenIslandActive=true;

var groups;
var rects;
colors = d3.scaleOrdinal().range(["rgb(255, 179, 166) ","rgb(169, 186, 255) ","rgb(243, 195, 240)", "rgb(180, 165, 145)","rgb(170, 255, 201)"])
// colors_bar = d3.scaleOrdinal().range([ "rgb(255, 179, 166) ", "rgb(170, 255, 201)", "rgb(243, 195, 240)","rgb(180, 165, 145)","rgb(169, 186, 255) "])
colors_bar = d3.scaleOrdinal().range([ "rgb(170, 255, 201)","rgb(180, 165, 145)", "rgb(169, 186, 255) ", "rgb(243, 195, 240)","rgb(255, 179, 166) "])

var accidentsPerHour_empty = [
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

hours = _.range(24);

var statenIslandBtn = document.getElementById("StatenIslandBtn");
var brooklynBtn = document.getElementById("BrooklynBtn");
var manhattanBtn = document.getElementById("ManhattanBtn");
var bronxBtn = document.getElementById("BronxBtn");
var queensBtn = document.getElementById("QueensBtn");

sel_map = [[0,0], [100000,100000]];
sel_time = [0,1000000];
sel_bar = [0,1000000];
accidentsPerHour = new Uint32Array(24);

formatMonthYear = d3.timeFormat("%b-%y");
date_format = d3.timeFormat("%Y-%m-%d");

//Load in GeoJSON data
d3.json("data/boroughs.json", function(json) {
  colors.domain(json.features.map(function(j) {
      return j.properties.BoroCode;
  }));
  
  manhattanBtn.style.backgroundColor = colors(1);
  bronxBtn.style.backgroundColor = colors(2);
  brooklynBtn.style.backgroundColor = colors(3);
  queensBtn.style.backgroundColor = colors(4);
  statenIslandBtn.style.backgroundColor = colors(5);
  
  //Bronx
  //Manhattan
  //Queens
  //StatenIsland
  //Brooklyn
  d3.csv("data/accidentsInNewYorkReduced.csv", function (data) {
    data.forEach (function(d) {
      d.DATE = date_format(new Date(d.DATE));
      d.TIME = d.TIME.split(":")[0];
    }); 

    // data = data.filter (function(d, i) {
    //   if (i%40 != 0) {
    //     return false;
    //   }
    //   else {
    //     return true;
    //   }
    // });

    var accidentsPerHour = JSON.parse( JSON.stringify( accidentsPerHour_empty ) );

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


    // Counting Accidents per day
    accidentsPerDay = getAccidentsPerDay(data);
    updatedKeyValueArray = accidentsPerDay;
    initLineChart(accidentsPerDay)
    initMapChart(data, json) // this before initBarChart
    initBarChart(accidentsPerHour)

  });
});


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
  var stack = d3.stack()
              .keys([ "bronx", "manhattan", "queens", "brooklyn", "statenIsland" ])
              .order(d3.stackOrderDescending);

  //Data, stacked
  var series = stack(data);

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
              .attr("height", barH + bar_m.top + bar_m.bot*2)
              .append("g")
              .attr("transform", "translate(" + bar_m.left + "," + bar_m.top + ")");
  
  groups = bar_svg.selectAll("g")
        .data(series)
        .enter()
        .append("g")
        .style("fill", function(d, i) {
          return colors_bar(i);
        });

  rects = groups.selectAll("rect")
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
}

function updateBarChart (data) {
  var stack = d3.stack()
              .keys([ "bronx", "manhattan", "queens", "brooklyn", "statenIsland" ])
              .order(d3.stackOrderDescending);
  //Data, stacked
  var series = stack(data);
  // console.log(data);
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
  yAxis_bar = d3.axisLeft(yBarScale)
            .tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax * 0.2));

  groups.data(series)
        .enter()
        .style("fill", function(d, i) {
          return colors_bar(i);
        });

  rects.data(function(d) { return d; })
         .transition()
         .ease(d3.easeLinear)
         .duration(1000)
         .attr("y", function(d) {
          return yBarScale(d[1]);
          })
         .attr("height", function(d) {
            return yBarScale(d[0]) - yBarScale(d[1])
         });

  //Update all labels
  bar_svg.selectAll("text")
         .data(data)
         .transition()
         .ease(d3.easeLinear)
         .duration(1000)
         .text(function(d) {
            return d;
         })
         .attr("y", function(d) {
            return yBarScale(d)+15;
         });

   bar_svg.select(".y.axis")
      .transition()
      .duration(1000)
      .call(yAxis_bar.tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax * 0.2)));
}


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
  map_h = chartDiv.clientWidth-20;

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
          return colors(d.properties.BoroCode)
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

  init_line_svg_slider();    
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
  maxNo = d3.max(data.map(function(d) { return d.value; }));
  yScale_line_svg.domain([0, maxNo]);

  var formatMonthYear = d3.timeFormat("%Y");

  // Axes
  yAxis_line_svg.scale(yScale_line_svg);  
  line_svg.select(".y.axis").transition().duration(500).call(yAxis_line_svg)

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

  var g = d3.select("#line_svg_slider").append("svg")
    .attr("width", 350)
    .attr("height", 65)
    .style("margin-top",'-20px')
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

function toggleOnlyQueens(){
  queensActive = true;
  bronxActive = false;
  manhattanActive = false;
  statenIslandActive = false;
  brooklynActive = false;
  brushed();
}

function toggleOnlyBronx(){
  queensActive = false;
  bronxActive = true;
  manhattanActive = false;
  statenIslandActive = false;
  brooklynActive = false;
  brushed();
}

function toggleEverything(){
  queensActive = true;
  bronxActive = true;
  manhattanActive = true;
  statenIslandActive = true;
  brooklynActive = true;
  brushed();
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
  }
  else {
    sel_map = sel;
  }
  brushed()
}

function brushed () {
  var accidentsPerHour = JSON.parse( JSON.stringify( accidentsPerHour_empty ) );
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
      } else if(manhattanActive && d.BOROUGH=="MANHATTAN"){
            accidentsPerHour[d.TIME].manhattan=accidentsPerHour[d.TIME].manhattan+1;
       activeData.push(d);
        return "dot activeDot";
      } else if(queensActive && d.BOROUGH=="QUEENS"){
            accidentsPerHour[d.TIME].queens=accidentsPerHour[d.TIME].queens+1;
            activeData.push(d);
        return "dot activeDot";
      } else if(brooklynActive && d.BOROUGH=="BROOKLYN"){
         accidentsPerHour[d.TIME].brooklyn=accidentsPerHour[d.TIME].brooklyn+1;
         activeData.push(d);
        return "dot activeDot";
      } else if(statenIslandActive && d.BOROUGH=="STATEN ISLAND"){
          accidentsPerHour[d.TIME].statenIsland=accidentsPerHour[d.TIME].statenIsland+1;
          activeData.push(d);
          return "dot activeDot";
      } else {
        return "dot noneActiveDot";
      }
    } else { 
        return "dot noneActiveDot";
    }        
  });
  updateBarChart(accidentsPerHour);
  accidentsPerDay = getAccidentsPerDay(activeData);
  updateLineChart(accidentsPerDay);
}

function fillDots () {
    d3.selectAll('.dot')
      .attr("class", "dot activeDot");
}

function reset_brush() {
  sel_time = [0,1000000];
  sel_bar = [0,1000000];
  sel_map = [[0,0], [100000,100000]];
  
  line_svg.select(".brush").call(line_brush.move, [0,0]);
  bar_svg.select(".brush").call(bar_brush.move, [0,0]);
  map_svg.select(".brush").call(map_brush.move, [[0,0],[0,0]]);
  brushed()
}

function animate_time (brushSize, speed) {
  var brushSize, transVar;

  brushSize = 100;
  transVar = 5000;

  line_svg.select(".brush").call(line_brush.move, [0,0]);
  bar_svg.select(".brush").call(bar_brush.move, [0,0]);
  map_svg.select(".brush").call(map_brush.move, [[0,0],[0,0]]);

  line_svg.select(".brush").call(line_brush.move, [0,brushSize]);
  line_svg.select(".brush")
          .transition()
          .ease(d3.easeLinear)
          .duration(transVar)
          .call(line_brush.move, [xScale_line_svg.range()[1] - brushSize, xScale_line_svg.range()[1]]);
}

//Lav brush på det sydøstlige hjørne af Queens    
function animateSection1(){
  reset_brush();
  map_svg.select(".brush").call(map_brush.move, [[10,10],[35,25]])
  map_svg.select(".brush")
         .transition()
         .ease(d3.easeLinear)
         .duration(5000)
         .call(map_brush.move, [[250,180],[300,230]]);
}

//Lav brush på det nordvestlige hjørne af Staten Island
function animateSection2(){
  reset_brush();
  map_svg.select(".brush")
        .transition()
        .ease(d3.easeLinear)
        .duration(5000)
        .call(map_brush.move, [[40,200],[90,230]]);
}

//Vis alt data og lav bar chart brush på 14-18
function animateSection3(){
  reset_brush();
  //bar_svg.select(".brush").call(bar_brush.move, [260,359]);
  bar_svg.select(".brush").call(bar_brush.move, [10,10])
  bar_svg.select(".brush")
         .transition()
         .ease(d3.easeLinear)
         .duration(5000)
         .call(bar_brush.move, [260,359]);
}

//1. Sæt Queens til eneste datasæt
//2. Vent
//3. Sæt Bronx til eneste datasæt
//4. Vent
//5. Nulstil
function animateSection4(){
  reset_brush();
  toggleOnlyQueens();
  wait(5000);
  toggleOnlyBronx();
  wait(5000);
  toggleEverything();
  reset_brush();
}

function wait(ms){
   var start = new Date().getTime();
   var end = start;
   while(end < start + ms) {
     end = new Date().getTime();
  }
}

d3.graphScroll()
  .sections(d3.selectAll('#steps > .step'))
  .on('active', function(i){
    console.log(i)
    // currentSection = i
    // switch (currentSection){
    //   case 1:
    //     animateSection1();
    //     break;
    //   case 2:
    //     animateSection2();
    //     break;
    //   case 3:
    //     animateSection3();
    //     break;
    //   case 4:
    //     animateSection4();
    //     break;

    // }


    // if (i==3) {
    //   animate_time();
    // }
})

d3.graphScroll()
  .graph(d3.select('#fixedarea'))
  .container(d3.select('#fixedcontainer'))  


$('.go-to-bottom').click( function(e) {
  e.preventDefault(); 
  document.body.scrollIntoView(false);
  return false; 
});

function initBubbles() {

  d3.csv("data/countAllUniqueContributingFactor.csv", function(d) {
    d.value = +d.value;
    if (d.value) return d;
  }, function(error, classes) {
    if (error) throw error;

  var width = 500,
      height = 500;

  var factors_svg = d3.select("#d3_bubbles")
                      .attr("height", height)
                      .attr("width", height);

  var format = d3.format(",d");
  var color = d3.scaleOrdinal(d3.schemeCategory20c);
  var pack = d3.pack()
      .size([width, height])
      .padding(1.5);


    var root = d3.hierarchy({children: classes})
        .sum(function(d) { return d.value; })
        .each(function(d) {
          if (id = d.data.id) {
            var id, i = id.lastIndexOf(".");
            d.id = id;
            d.package = id.slice(0, i);
            d.class = id.slice(i + 1);
          }
        });

    var node = factors_svg.selectAll(".node")
      .data(pack(root).leaves())
      .enter().append("g")
        .attr("class", "node")
        .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });

    node.append("circle")
        .attr("id", function(d) { return d.id; })
        .attr("r", function(d) { return d.r; })
        .style("font-size", function(d) {
          return "30px";
        })
        .style("fill", function(d) { return color(d.package); });

    node.append("text")
        // .attr("clip-path", function(d) { return "url(#clip-" + d.id + ")"; })
        .selectAll("tspan")
        .data(function(d) { 
          return d.class.split(/(?=[A-Z][^A-Z])/g); 
        })
        .enter().append("tspan")

        .style("font-size", function(d) { 
          var val = (this.parentNode.__data__.data.percent)*5 + 0.6;
          return val + "em"
        })
        .attr("x", 0)
        .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10*(1+this.parentNode.__data__.data.percent*5); })
        .text(function(d) { return d; });

    node.append("title")
        .text(function(d) { return d.id + "\nNo. of accidents: " + format(d.value) + "\nPercent of top 20: " + (Number(this.parentNode.__data__.data.percent)*100.00).toFixed(1) + "%"; });
  });

}