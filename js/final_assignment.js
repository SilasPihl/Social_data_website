initBubbles();

var dur = 100;
var bronxActive        = true;
var manhattanActive    = true;
var queensActive       = true;
var brooklynActive     = true;
var statenIslandActive = true;

var groups;
var rects;
colors     = d3.scaleOrdinal().range(["rgb(255, 179, 166) ","rgb(169, 186, 255) ","rgb(243, 195, 240)", "rgb(180, 165, 145)","rgb(170, 255, 201)"])
colors_bar = d3.scaleOrdinal().range([ "rgb(170, 255, 201)","rgb(180, 165, 145)", "rgb(169, 186, 255) ", "rgb(243, 195, 240)","rgb(255, 179, 166) "])
color_point = 
  {
    "MANHATTAN": "rgb(180, 165, 145)",
    "STATEN ISLAND": "rgb(255, 179, 166)",
    "BRONX" : "rgb(170, 255, 201)",
    "QUEENS" : "rgb(169, 186, 255)",
    "BROOKLYN": "rgb(243, 195, 240)"
  }

var accidentsPerHour_empty = Array(24).fill({ bronx: 0, brooklyn: 0, manhattan: 0, queens: 0, statenIsland: 0 });

var statenIslandBtn = document.getElementById("StatenIslandBtn");
var brooklynBtn     = document.getElementById("BrooklynBtn");
var manhattanBtn    = document.getElementById("ManhattanBtn");
var bronxBtn        = document.getElementById("BronxBtn");
var queensBtn       = document.getElementById("QueensBtn");

sel_map  = [[0,0], [100000,100000]];
sel_time = [0,1000000];
sel_bar  = [0,1000000];
accidentsPerHour = new Uint32Array(24);


map_canvas_active = true;
lasso_active = false;
inCanvasMode = false;

formatMonthYear = d3.timeFormat("%b-%y");
date_format = d3.timeFormat("%Y-%m-%d");

function initInteractive () {

  //Load in GeoJSON data
  d3.json("data/boroughs.json", function(json) {
    colors.domain(json.features.map(function(j) {
        return j.properties.BoroCode;
    }));
    
    manhattanBtn.style.backgroundColor    = colors(1);
    bronxBtn.style.backgroundColor        = colors(2);
    brooklynBtn.style.backgroundColor     = colors(3);
    queensBtn.style.backgroundColor       = colors(4);
    statenIslandBtn.style.backgroundColor = colors(5);

    d3.csv("data/accidentsInNewYorkReduced.csv", function (data) {
      var accidentsPerHour = JSON.parse( JSON.stringify( accidentsPerHour_empty ) );
      
      data.forEach (function(d) {
        d.DATE = date_format(new Date(d.DATE));
        d.TIME = d.TIME.split(":")[0];

        if (d.BOROUGH=="BRONX"){
            accidentsPerHour[d.TIME].bronx += 1;
        } else if(d.BOROUGH=="MANHATTAN"){
            accidentsPerHour[d.TIME].manhattan += 1;
        } else if(d.BOROUGH=="QUEENS"){
            accidentsPerHour[d.TIME].queens += 1;
        } else if(d.BOROUGH=="BROOKLYN"){
            accidentsPerHour[d.TIME].brooklyn += 1;
        } else if(d.BOROUGH=="STATEN ISLAND"){
            accidentsPerHour[d.TIME].statenIsland += 1;
        }
      }); 

      data = data.filter (function(d) {
        if (d.BOROUGH) {
          return true;
        }
        else {
          return false;
        }
      })

      // Counting Accidents per day
      accidentsPerDay = getAccidentsPerDay(data);
      
      if (inCanvasMode) {
        initMapChartCanvas(data, json) // this before initBarChart
      }
      else {
        initMapChart(data, json) // this before initBarChart
      }    
      initLineChart(accidentsPerDay)
      init_line_svg_slider();    

      initBarChart(accidentsPerHour)

    });
  });

} 
initInteractive()

function reloadInteractiveD3() {
  removeD3()
  initInteractive()
}

function removeD3() {
  $( "#d3_map" ).empty();
  $( "#d3_bar" ).empty();
  $( "#d3_linechart" ).empty();
  $( "#line_svg_slider" ).empty();
  if (lasso_active) {
    $("#changeBrushOnMap").html('Change to lasso brush');
  }
  reset_buttons()
}

function initBarChart (data) {
  var chartDiv = document.getElementById("d3_bar");
  barW = chartDiv.clientWidth-30;
  barH = barW/2.65;

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

  var ymax = d3.max(data, function(d) {
              return d.bronx + d.manhattan + d.queens+ d.brooklyn+ d.statenIsland;
             });

  xBarScale = d3.scaleBand()
                .range([0, barW])
                .domain(d3.range(data.length))
                .paddingInner(0.001);

  yBarScale = d3.scaleLinear()
                .range([barH,20])
                .domain([0, d3.max(data, function(d) {
                  return d.bronx + d.manhattan + d.queens+ d.brooklyn+ d.statenIsland;
                })]);          

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

  var ymax = d3.max(data, function(d) {
              return d.bronx + d.manhattan + d.queens+ d.brooklyn+ d.statenIsland;
             });

  // scaling
  xBarScale = d3.scaleBand()
                .range([0, barW])
                .domain(d3.range(data.length))
                .paddingInner(0.001);

  yBarScale = d3.scaleLinear()
                .range([barH,20])
                .domain([0, d3.max(data, function(d) {
                  return d.bronx + d.manhattan + d.queens+ d.brooklyn+ d.statenIsland;
                })]); 
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

   bar_svg.select(".y.axis")
          .transition()
          .duration(1000)
          .call(yAxis_bar.tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax * 0.2)));
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
  map_canvas_active = false;
  var chartDiv = document.getElementById("d3_map");
  map_w = chartDiv.clientWidth-20;
  map_h = chartDiv.clientWidth;

  xScale_map = d3.scaleLinear().domain([0, 100]).range([0, map_w]);
  yScale_map = d3.scaleLinear().domain([0, 100]).range([0, map_h]);

  into_xScale_map = d3.scaleLinear().domain([0, map_w]).range([0, 100]);
  into_yScale_map = d3.scaleLinear().domain([0, map_h]).range([0, 100]);

  //Define map projection
  var projection = d3.geoMercator()
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
              // .append("g");

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
                  }
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

  appendBrush("normal");
}

function initMapChartCanvas (data, json) {
  map_canvas_active = true;

  var chartDiv = document.getElementById("d3_map");
  map_w = chartDiv.clientWidth-20;
  map_h = chartDiv.clientWidth;
  pointWidth = 2;
  pointMargin = 3;

  xScale_map = d3.scaleLinear().domain([0, 100]).range([0, map_w]);
  yScale_map = d3.scaleLinear().domain([0, 100]).range([0, map_h]);

  into_xScale_map = d3.scaleLinear().domain([0, map_w]).range([0, 100]);
  into_yScale_map = d3.scaleLinear().domain([0, map_h]).range([0, 100]);

  //Define map projection
  projection = d3.geoMercator()
          .scale(80*map_w+1300)
          .center([-74, 40.71])
          .translate([map_w * 0.5, map_h * 0.5]);

  //Define path generator
  var path = d3.geoPath().projection(projection);

  screenScale = window.devicePixelRatio || 1;
  
  map_svg = d3.select("#d3_map")
                .append("svg")
                .attr("width", map_w)
                .attr("height", map_h)
                .append("g")
                .attr("width", map_w)
                .attr("height", map_h);

  // background
  map_svg.append("rect")
    .attr("x", map_w)
    .attr("y", map_h)
    .attr("width", map_w)
    .attr("height", map_h)
    .attr("class", "bg");                

  

  // CANVAS PART
  var foreignObject = map_svg.append("foreignObject")
                             .attr("x", 0)
                             .attr("y", 0)
                             .attr("width", map_w)
                             .attr("height", map_h)
                             .attr("class", "overlay");

  // add embedded body to foreign object
  var foBody = foreignObject.append("xhtml:body")
                            .style("margin", "0px")
                            .style("padding", "0px")
                            .style("background-color", "none")
                            .style("opacity", 1)
                            .style("position", 'relative')
                            .style("width", map_w + "px")
                            .style("height", map_h + "px");

  map_canvas = foBody.append('canvas')
                     .attr('width', map_w * screenScale)
                     .attr('height', map_h * screenScale)
                     .style('width', `${map_w}px`)
                     .style('height', `${map_h}px`)

  minX = d3.min(data.map(function(d) { return projection([d.LONGITUDE, d.LATITUDE])[0];}));
  maxX = d3.max(data.map(function(d) { return projection([d.LONGITUDE, d.LATITUDE])[0];}));
  minY = d3.min(data.map(function(d) { return projection([d.LONGITUDE, d.LATITUDE])[1]; }));
  maxY = d3.max(data.map(function(d) { return projection([d.LONGITUDE, d.LATITUDE])[1]; }));

  var CanvasXScale = d3.scaleLinear().domain([minX, maxX]).range([0, map_w]);
  var CanvasYScale = d3.scaleLinear().domain([minY, maxY]).range([0, map_h]);

  points = []
  data.forEach (d => {
    d.x = projection([d.LONGITUDE, d.LATITUDE])[0];
    d.y = projection([d.LONGITUDE, d.LATITUDE])[1];
    d.BOROUGH = d.BOROUGH;
    d.state = "active";
    d.TIME = d.TIME;
    d.date = d.DATE;
    d.color = color_point[d.BOROUGH] ? color_point[d.BOROUGH] : "black";
  });
  points = data;

  map_canvas.node().getContext('2d').scale(screenScale, screenScale);

  draw(map_canvas.node().getContext('2d'), points);

  map_svg.selectAll("path")
         .data(json.features)
         .enter()
         .append("path")
         .attr("d", path)
         .style("opacity", 0.4)
         .style("fill", function (d) {
          return colors(d.properties.BoroCode)
         });

  map_svg.selectAll("text")
       .data(json.features)
       .enter()
       .append("text")
       .attr("fill", "black")
       .attr("class", "map-label")
       .style("position", "relative")
       .attr("transform", function(d) {
           var c = path.centroid(d);
           return "translate("+c[0]+","+c[1]+")"
       })
       .attr("text-anchor", "middle")
       .text(function(d) {
           return d.properties.BoroName;
       });

  appendBrush("normal");
}

function appendBrush(brush) {
  if (brush == "lasso") {
    lasso_active = true;
    map_svg.selectAll(".brush").remove();
    map_svg.selectAll(".lasso-group").remove();
     // attach lasso to interaction SVG
    lassoInstance = lasso("d3_map").on('end', brushed_mapChart_lasso)
      // .on('start', handleLassoStart);

    map_svg.append("g")
            .attr("class", "brush")
            .call(lassoInstance); 
  }
  else if (brush == "normal") {
    lasso_active = false;
    map_svg.selectAll(".brush").remove();
    map_svg.selectAll(".lasso-group").remove();
     // make brush for map
    map_brush = d3.brush()
                  .on("brush end", brushed_mapChart);

    // map brush
    map_svg.append("g")
            .attr("class", "brush")
            .call(map_brush); 
    
    sel_map = [[0,0], [100000,100000]];
  }
}

function changeBrush (brush) {
  appendBrush(brush);
  brushed();
}
// reset selected points when starting a new polygon
function handleLassoStart(lassoPolygon) {
  updateSelectedPoints([]);
}


function updateSelectedPoints(selectedPoints) {
  // if no selected points, reset to all tomato
  if (!selectedPoints.length) {
    // reset all
    points.forEach(function (d) {
      d.color = color_point[d.BOROUGH];
      d.state = 'active';
    });

    // otherwise gray out selected and color selected black
  } else {
    points.forEach(function (d) {
      d.color = '#eee';
      d.stroke = 'none';
      d.state = 'notactive';
    });
    selectedPoints.forEach(function (d) {
      d.color = color_point[d.BOROUGH];
      d.state = 'active';
    });
  }

  // redraw with new colors
  // draw(map_canvas.node().getContext('2d'), points);
  drawPoints();
}

function drawPoints () {
  draw(map_canvas.node().getContext('2d'), points);
}

function draw(canvas, points) {
  const context = canvas;
  context.save();

  // remove what is on the canvas
  context.beginPath();
  context.clearRect(0, 0, map_w, map_h);

  context.globalAlpha = 1;
  // draw each point as an arc
  var circ = 2 * Math.PI
  for (let i = 0; i < points.length; ++i) {
    const point = points[i];
    context.beginPath();
    context.arc(point.x, point.y, pointWidth, 0, circ, false);
    context.fillStyle = point.color;
    context.fill();
    context.lineWidth = 1;
    if (point.state == 'active') {
      context.strokeStyle = 'black';
      context.stroke();
    }

    // const point = points[i];
    // context.fillStyle = point.color;
    // context.fillRect(point.x, point.y, pointWidth, pointWidth);
    // context.fill();
    // context.lineWidth = 1;
    // context.strokeStyle = 'black';
    // context.stroke();
  }
  context.restore();
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
  var line_h = line_w/2.65;

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

function updateLineChartFromDays (noOfDays) {
  noOfDays = noOfDays
  coeff = 1000 * 60 * 60 * 24 * noOfDays;
  
  accidentsPerSomething = d3.nest()
                          .key(function(d) { return date_format(new Date(Math.round(new Date(d.key) / coeff) *coeff)); })
                          .rollup(function(v) { return d3.sum(v, function(d) { return d.value; }); })
                          .sortKeys(d3.ascending)
                          .entries(accidentsPerDay);

  updateLineChart(accidentsPerSomething)
}

// others
function init_line_svg_slider() {
  var chartDiv = document.getElementById("line_svg_slider");
  slider_w = chartDiv.clientWidth+30;

  line_svg_slider = d3.sliderHorizontal()
                      .step(1)
                      .min(1)
                      .max(30)
                      .ticks(5)
                      .width(slider_w-50)
                      .on('end', val => {
                        updateLineChartFromDays(val);
                      });

  slider = d3.select("#line_svg_slider").append("svg")
            .attr("width", slider_w)
            .attr("height", 65)
            .style("margin-top",'-20px')
            .append("g")
            .attr("transform", "translate(30,30)");

  slider.call(line_svg_slider);
}

function reset_line_svg_slider () {
  line_svg_slider.value(1);
  updateLineChartFromDays(1);
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

function reset_buttons() {
  queensActive       = true; changeAria("QueensBtn", "true");
  bronxActive        = true; changeAria("BronxBtn", "true");
  manhattanActive    = true; changeAria("ManhattanBtn", "true");
  statenIslandActive = true; changeAria("StatenIslandBtn", "true");
  brooklynActive     = true; changeAria("BrooklynBtn", "true");
}

function changeAria(id, bool) {
  $("#" + id).attr("aria-pressed",bool)
}

function toggleBrooklyn(){
  brooklynActive = !brooklynActive;
  changeAria("BrooklynBtn", "true");
  brushed();
}
function toggleBronx(){
  bronxActive = !bronxActive;
  changeAria("BronxBtn", "true");
  brushed();
}
function toggleManhattan(){
  manhattanActive = !manhattanActive;
  changeAria("ManhattanBtn", "true");
  brushed();
}
function toggleStatenIsland(){
  statenIslandActive = !statenIslandActive;
  changeAria("StatenIslandBtn", "true");
  brushed();
}
function toggleQueens(){
  queensActive = !queensActive;
  changeAria("QueensBtn", "true");
  brushed();
}

function toggleOnlyManhattan(){
  queensActive       = false; changeAria("QueensBtn", "false");
  bronxActive        = false; changeAria("BronxBtn", "false");
  manhattanActive    = true;  changeAria("ManhattanBtn", "true");
  statenIslandActive = false; changeAria("StatenIslandBtn", "false");
  brooklynActive     = false; changeAria("BrooklynBtn", "false");
  brushed();
}

function toggleOnlyQueens(){
  queensActive       = true;  changeAria("QueensBtn", "true");
  bronxActive        = false; changeAria("BronxBtn", "false");
  manhattanActive    = false; changeAria("ManhattanBtn", "false");
  statenIslandActive = false; changeAria("StatenIslandBtn", "false");
  brooklynActive     = false; changeAria("BrooklynBtn", "false");
  brushed();
}

function toggleOnlyBronx(){
  queensActive       = false; changeAria("QueensBtn", "false");
  bronxActive        = true;  changeAria("BronxBtn", "true");
  manhattanActive    = false; changeAria("ManhattanBtn", "false");
  statenIslandActive = false; changeAria("StatenIslandBtn", "false");
  brooklynActive     = false; changeAria("BrooklynBtn", "false");
  brushed();
}

function toggleEverything(){
  reset_buttons();
  brushed();
}

function toggleNothing(){
  queensActive       = false; changeAria("QueensBtn", "false");
  bronxActive        = false; changeAria("BronxBtn", "false");
  manhattanActive    = false; changeAria("ManhattanBtn", "false");
  statenIslandActive = false; changeAria("StatenIslandBtn", "false");
  brooklynActive     = false; changeAria("BrooklynBtn", "false");
  brushed();
}

// brush stuff
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

function brushed_mapChart_lasso (lassoPolygon) {
  sel_map = lassoPolygon
  brushed()
}

function brushed_mapChart () {
  sel = d3.event.selection
  // console.log(toGlobalMapScale(sel))
  if (sel == null) {
    sel_map = [[0,0], [100000,100000]];
  }
  else {
    sel_map = sel;
  }
  brushed()
}

function brushed() {
  if(map_canvas_active) {
    brushed_with_canvas()
  }
  else {
    brushed_NoCanvas();
  }
}

function toggleChangeBrushOnMap(force) {
  if (lasso_active || force == "normal") {
    changeBrush("normal")
    $("#changeBrushOnMap").html('Change to lasso brush');
    
  }
  else {
    changeBrush("lasso")
    $("#changeBrushOnMap").html('Change to normal brush');
  }
}

function toggleCanvas() {
  if (inCanvasMode) {
    inCanvasMode = false;
    reloadInteractiveD3();
    $("#changeBrushOnMap").html('Change to normal brush');
  }
  else {
    inCanvasMode = true;
    reloadInteractiveD3();
    $("#tryCanvas").html('Go back to map with SVG circles');
  }
}

function brushed_with_canvas () {
  var accidentsPerHour = JSON.parse( JSON.stringify( accidentsPerHour_empty ) );
  var activeData = [];

  if (!lasso_active){
    var x0 = sel_map[0][0],
        x1 = sel_map[1][0],
        y0 = sel_map[0][1],
        y1 = sel_map[1][1];
  }
  
  var t0 = sel_time[0],
      t1 = sel_time[1];

  var b0 = sel_bar[0],
      b1 = sel_bar[1];      

  brushedDataSet=[];
  var dotDate;

  var selectedPoints = points.filter(function (d) {
  
    dotDate = xScale_line_svg(new Date(d.DATE));
    var cx = d.x;
    var cy = d.y;

    var inMap = false;

    if (lasso_active){
      if (sel_map.length <= 2 || d3.polygonContains(sel_map, [cx, cy])) {
      inMap = true;
      }
    }
    else {
      inMap = x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
    }
    
    // checking if the dot is inside both the timeline and map interval 
    // if(x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 && t0 <= dotDate && dotDate <= t1){
    if (inMap && t0 <= dotDate && dotDate <= t1 && b0 <= xBarScale(d.TIME) && xBarScale(d.TIME) <= b1){
        if(bronxActive && d.BOROUGH=="BRONX"){
            accidentsPerHour[d.TIME].bronx += 1;
            activeData.push(d);
            d.state = "active"
            return true;
        } else if(manhattanActive && d.BOROUGH=="MANHATTAN"){
            accidentsPerHour[d.TIME].manhattan += 1;
            activeData.push(d);
            d.state = "active"
            return true;
        } else if(queensActive && d.BOROUGH=="QUEENS"){
            accidentsPerHour[d.TIME].queens += 1;
            activeData.push(d);
            d.state = "active"
            return true;
        } else if(brooklynActive && d.BOROUGH=="BROOKLYN"){
            accidentsPerHour[d.TIME].brooklyn += 1;
            activeData.push(d);
            d.state = "active"
            return true;
        } else if(statenIslandActive && d.BOROUGH=="STATEN ISLAND"){
            accidentsPerHour[d.TIME].statenIsland += 1;
            activeData.push(d);
            d.state = "active"
            return true;
        } else {
            d.state = "notactive"
            return false;
        }
    } else { 
          d.state = "notactive"
        return false;
    }               
  });
  updateSelectedPoints(selectedPoints);
  updateBarChart(accidentsPerHour);
  accidentsPerDay = getAccidentsPerDay(activeData);
  updateLineChart(accidentsPerDay);
}

function brushed_NoCanvas () {
  var accidentsPerHour = JSON.parse( JSON.stringify( accidentsPerHour_empty ) );
  var activeData = [];

  dots = d3.selectAll('.dot');

  if (!lasso_active){
    var x0 = sel_map[0][0],
        x1 = sel_map[1][0],
        y0 = sel_map[0][1],
        y1 = sel_map[1][1];
  }

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


    var inMap = false;
    if (lasso_active){
      if (sel_map.length <= 2 || d3.polygonContains(sel_map, [cx, cy])) {
      inMap = true;
      }
    }
    else {
      inMap = x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
    }

    // checking if the dot is inside both the timeline and map interval 
    // if(x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 && t0 <= dotDate && dotDate <= t1){
    if(inMap && t0 <= dotDate && dotDate <= t1 && b0 <= xBarScale(d.TIME) && xBarScale(d.TIME) <= b1){
      if(bronxActive && d.BOROUGH=="BRONX"){
          accidentsPerHour[d.TIME].bronx += 1;
          activeData.push(d);
          return "dot activeDot";
      } else if(manhattanActive && d.BOROUGH=="MANHATTAN"){
          accidentsPerHour[d.TIME].manhattan += 1;
          activeData.push(d);
          return "dot activeDot";
      } else if(queensActive && d.BOROUGH=="QUEENS"){
          accidentsPerHour[d.TIME].queens += 1;
          activeData.push(d);
          return "dot activeDot";
      } else if(brooklynActive && d.BOROUGH=="BROOKLYN"){
          accidentsPerHour[d.TIME].brooklyn += 1;
          activeData.push(d);
          return "dot activeDot";
      } else if(statenIslandActive && d.BOROUGH=="STATEN ISLAND"){
          accidentsPerHour[d.TIME].statenIsland += 1;
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

function reset_brush() {
  reset_buttons()

  sel_time = [0,1000000];
  sel_bar = [0,1000000];
  sel_map = [[0,0], [100000,100000]];
  
  line_svg.select(".brush").call(line_brush.move, [0,0]);
  bar_svg.select(".brush").call(bar_brush.move, [0,0]);

  if (lasso_active) {
    changeBrush("lasso")
  }
  else {
    changeBrush("normal")
  }
  brushed()
}

function fillDots () {
    d3.selectAll('.dot')
      .attr("class", "dot activeDot");
}

// animation stuff
function animate_time (brushSize, speed) {
  toggleChangeBrushOnMap("normal");

  var brushSize, transVar;

  brushSize = 200;
  transVar = 5000;

  line_svg.select(".brush").call(line_brush.move, [0,0]);
  bar_svg.select(".brush").call(bar_brush.move, [0,0]);
  map_svg.select(".brush").call(map_brush.move, [[0,0],[0,0]]);

  bar_svg.select(".brush").call(bar_brush.move, [0,brushSize]);
  bar_svg.select(".brush")
         .transition()
         .ease(d3.easeLinear)
         .duration(transVar)
         .call(bar_brush.move, [xBarScale.range()[1] - brushSize, xBarScale.range()[1]]);
}

function toLocalMapScale(x0, y0, x1, y1) {
  return [[xScale_map(x0), yScale_map(y0)], [xScale_map(x1), yScale_map(y1)]]
}

function toGlobalMapScale(arr) {
  return "" + into_xScale_map(arr[0][0]) + ", " + into_yScale_map(arr[0][1]) + ", " + into_xScale_map(arr[1][0]) + ", " + into_yScale_map(arr[1][1])
}

function toLocalMapScale(x0, y0, x1, y1) {
  return [[xScale_map(x0), yScale_map(y0)], [xScale_map(x1), yScale_map(y1)]]
}

function toGlobalMapScaleLasso(arr) {
  var arrayString = "[";
  for (var i = 0; i < arr.length; i++) {
   var globalX = into_xScale_map(arr[i][0])
   var globalY = into_xScale_map(arr[i][1])
   arrayString += ("["+ globalX + "," + globalY + "],")
  }
  arrayString += "]";
  console.log(arrayString)
  // return "" + into_xScale_map(arr[0][0]) + ", " + into_yScale_map(arr[0][1]) + ", " + into_xScale_map(arr[1][0]) + ", " + into_yScale_map(arr[1][1])
}

function toLocalMapScaleLasso(arr) {
  var lassoArray = [];
  for (var i = 0; i < arr.length; i++) {
   var localX = arr[i][0]
   var localY = arr[i][1]
   lassoArray.push([xScale_map(localX), yScale_map(localY)])
  }
  return lassoArray;
}

function beginAnimation (id) {
  $("#" + id).html('Animating...');
}

function doneAnimation (id) {
  $("#" + id).html('See animation!');
}

function animate (id, ms, _animateFunction) {
  toggleChangeBrushOnMap("normal");
  beginAnimation(id);
  _animateFunction()
  setTimeout(function() {
    doneAnimation(id);
  }, ms);
}

//Lav brush på det sydøstlige hjørne af Queens    
function animateAirPort(){
  toggleChangeBrushOnMap("normal");
  animate ("animateAirPort_btn", 4000, () => animateAirPort_aux())
}

function animateAirPort_aux (){
  toggleChangeBrushOnMap("normal");
  reset_brush();
  map_svg.select(".brush").call(map_brush.move, toLocalMapScale(50,50,10,10))
  map_svg.select(".brush")
         .transition()
         .ease(d3.easeLinear)
         .duration(3000)
         .call(map_brush.move, toLocalMapScale(72.26938691529088, 58.64848743785511, 86.73479572032232, 71.19394198330966));
}

//Lav brush på det nordvestlige hjørne af Staten Island
function animateStatenIsland(){
  toggleChangeBrushOnMap("normal");
  animate ("animateStatenIsland_btn", 4000, () => animateStatenIsland_aux())
}

function animateStatenIsland_aux(){
  toggleChangeBrushOnMap("normal");
  reset_brush();
  map_svg.select(".brush").call(map_brush.move, toLocalMapScale(50,50,10,10))
  map_svg.select(".brush")
         .transition()
         .ease(d3.easeLinear)
         .duration(3000)
         .call(map_brush.move, toLocalMapScale(12.618296529968454, 63.09148264984227, 32.391167192429023, 74.55520504731862));
}

//Vis alt data og lav bar chart brush på 14-18
function animateBarChart1418(){ 
  toggleChangeBrushOnMap("normal");
  animate ("animateBarChart1418_btn", 6000, () => animateBarChart1418_aux())
}

function animateBarChart1418_aux(){
  toggleChangeBrushOnMap("normal");
  reset_brush();
  bar_svg.select(".brush").call(bar_brush.move, [xBarScale(0),xBarScale(23)])
  bar_svg.select(".brush")
         .transition()
         .ease(d3.easeLinear)
         .duration(5000)
         .call(bar_brush.move, [xBarScale(14),xBarScale(19)]);
}

//1. Sæt Queens til eneste datasæt
//2. Vent
//3. Sæt Bronx til eneste datasæt
//4. Vent
//5. Nulstil
function animateButtons_1(){
  animate ("animateButtons_1_btn", 2000, () => animateButtons_1_aux())
}

function animateButtons_1_aux(){
  reset_brush();
  toggleOnlyManhattan();
}

function animateButtons_2(){
  animate ("animateButtons_2_btn", 5000, () => animateButtons_2_aux())
}

function animateButtons_2_aux(){
  reset_brush();
  toggleOnlyManhattan();

  setTimeout(function() {
    toggleQueens();
  }, 3000);
}

automateAnimations = false;
function toggleAutomateAnimations () {
  automateAnimations = !automateAnimations
}

d3.graphScroll()
  .sections(d3.selectAll('#steps > .step'))
  .on('active', function(i){
    currentSection = i
    if (automateAnimations) {
      switch (currentSection){
      case 3:
        animateAirPort();
        break;
      case 4:
        animateStatenIsland();
        break;
      case 5:
        animateBarChart1418();
        break;
      case 6:
        animateButtons_1();
        break;
      case 7:
        animateButtons_2();
        break;
      }  
    }
})

d3.graphScroll()
  .graph(d3.select('#fixedarea'))
  .container(d3.select('#fixedcontainer'))  


$('#go-to-bottom').click( function(e) {
  e.preventDefault(); 
  document.body.scrollIntoView(false);
  return false; 
});


// init bubble chart
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

