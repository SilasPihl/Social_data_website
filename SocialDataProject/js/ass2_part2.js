
//Width and height
var w = 1000;
var h = 550;
var dur = 100;
  console.log("TEEEST3");

//Define map projection
var projection = d3.geoMercator()
        .scale(50000)
        .center([-74, 40.71])
        .translate([w/2, h/2]);

//Define path generator
var path = d3.geoPath()
             .projection(projection);

var color = d3.scaleOrdinal()
              .range(["rgb(12, 150, 50)","rgb(0, 128, 128) ","rgb(0, 0, 128) ","rgb(128, 0, 0)", "rgb(200, 150, 180)"])

var barPadding = 1;

//Create SVG element
map_svg = d3.select("#part2_map")
            .append("svg")
            .attr("width", w)
            .attr("height", h)
            .append("g");

var dataset_all= [320, 292, 280, 260, 285, 198, 99, 88, 101, 83, 102, 108, 167, 144, 152, 178, 140, 207, 237, 246, 247, 309, 343, 323];
var dataset = dataset_all;
var hours=['0','1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23'];
var barH = 200
var barW = 800

// Margins
var bar_m = {
    t: 10,
    r: 40,
    b: 30,
    l: 40
}

sel_map = [[0,0], [100000,100000]];
sel_time = [0,1000000];
sel_bar = [0,1000000];

//Create scale functions
xBarScale = d3.scaleBand()
              .domain(hours.map(function(d) { return d; }))
              .range([60, barW])
              .paddingInner(0.001);

var ymax = d3.max(dataset);

yBarScale = d3.scaleLinear()
              .domain([0 , ymax])
              .range([barH,20]);           

//Define X axis
xAxis = d3.axisBottom(xBarScale);
        
//Define Y axis
yAxis = d3.axisLeft(yBarScale)
          .tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax/5));

bar_svg = d3.select("#part2_bar")
            .append("svg")
            .attr("width", barW + bar_m.l + bar_m.r)
            .attr("height", barH + bar_m.t + bar_m.b);

bar_svg.selectAll("rect")
       .data(dataset)
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

bar_svg.selectAll("text")
       .data(dataset)
       .enter()
       .append("text")
       .text(function(d) {
          return d;
       })
       .attr("text-anchor", "middle")
       .attr("x", function(d, i) {
          return xBarScale(i)+14;
       })
       .attr("y", function(d) {
          return barH - yBarScale(d) + 14;
       })
       .attr("font-family", "sans-serif")
       .attr("font-size", "11px")
       .attr("fill", "white");

//Create X axis
bar_svg.append("g")
       .attr("class", "x axis")
       .attr("transform", "translate(0," + barH + ")")
       .call(xAxis);

//Create Y axis
bar_svg.append("g")
       .attr("class", "y axis")
       .attr("transform", "translate(60," + 0 + ")")
       .call(yAxis.tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax/5)));    

// Create xAxis label
bar_svg.append("text")
       .attr("transform", "translate(" + (barW/2 + bar_m.l) + " ," + (barH + bar_m.t + bar_m.b) + ")")
       .style("text-anchor", "middle")
       .text("Hours");    

// Create yAxis label
bar_svg.append("text")
       .attr("transform", "rotate(-90)")
       .attr("y", 0 - 0)
       .attr("x", 0 - (barH / 2))
       .attr("dy", "1em")
       .style("text-anchor", "middle")
       .text("# of Murders"); 

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
  console.log("TEEEST2");

  d3.csv("data/Motor.csv", function (data) {
      
  date_format = d3.timeFormat("%Y-%m-%d");
  data.forEach (function(d) {
    //console.log(d.ON_STREET_NAME);
    d.DATE = date_format(new Date(d.DATE));
    d.TIME = d.TIME.split(":")[0];
  }); 

  console.log("TEEEST1");
  dots = map_svg.selectAll("circle")
                .data(data)
                .enter()
                .append("circle")
                .attr("class", "dot activeDot")
                .attr("cx", function(d) {
                    return projection([d.LONGITUDE, d.LATITUDE])[0];
                })
                .attr("cy", function(d) {
                    return projection([d.LONGITUDE, d.LATITUDE])[1];
                })
                .attr("r", 2)
                .append("title")         //Simple tooltip
                .text(function(d) {
                     return d.ON_STREET_NAME;
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
             return d.properties.BOROUGH;
         });
         
  // Counting murders per day
  accidentsPerDay = d3.nest()
                    .key(function(d) { return d.DATE; })
                    .rollup(function(v) { return d3.sum(v, function(d) { return 1; }); })
                    .sortKeys(d3.ascending)
                    .entries(data);

  createLineChart(accidentsPerDay);
  
  });
});

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

  minDate = d3.min(data.map(function(d) { return new Date(d.key); }));
  maxDate = d3.max(data.map(function(d) { return new Date(d.key); }));
  console.log("min: "+minDate);
    console.log("max: "+maxDate);


  // this fill in zeroes in days without murders
  var dateRange = d3.timeDays(minDate, maxDate);

  data = dateRange.map(function(day) {
    return _.find(data, { key: date_format(day) }) || { key: date_format(day), value: 0 };
  });

  xScale = d3.scaleTime()
             .domain([minDate, maxDate])
             .range([0, w]);

  yScale = d3.scaleLinear()
             .domain([0, d3.max(data.map(function(d) { return d.value; }))])
             .range([h, 0]);

  var formatYear = d3.timeFormat("%Y");

  xAxis = d3.axisBottom()
            .scale(xScale)
            .tickFormat(formatYear);

  yAxis = d3.axisLeft()
            .scale(yScale);

  line = d3.line()
           .x(function(d) { return xScale(new Date(d.key)); })
           .y(function(d) { return yScale(new Date(d.value)); });

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
          .text("# of Traffic accidentes");

  time_svg.append("text")
          .attr("transform",
              "translate(" + (w / 2) + " ," +
              (h + m.bottom) + ")")
          .style("text-anchor", "middle")
          .text("Day");

  // make brush for timeline
  brush = d3.brushX()
                .extent([[0, 0],[w, h - 1]])
                .on("brush end", brushed);

  // make brush for bar chart
  bar_brush = d3.brushX()
                .extent([[0, 0],[w, h - 1]])
                .on("brush end", from_bar_brushed);

  // make brush for map
  map_brush = d3.brush()
                .on("brush end", brushed);

  // timeline brush
  time_svg.append("g")
          .attr("class", "brush")
          .call(brush);

  bar_svg.append("g")
          .attr("class", "brush")
          .call(bar_brush);

  // map brush
  map_svg.append("g")
          .attr("class", "brush")
          .call(map_brush);

  time_svg.select('.brush')
      .call(brush);

  time_svg.select(".brush").call(brush.move, [0,0]);

  change_bar_chart(dataset_all);      
}

fromBar = false;

function from_bar_brushed() {
  fromBar = true;
  brushed();
}

function brushed () {
  sel = d3.event.selection
  
  dataset = new Uint32Array(24);
  
  if (sel == null) {
    sel_map = [[0,0], [100000,100000]];
    sel_time = [0,1000000];
    sel_bar = [0,1000000];
  }
  else {
    if (fromBar) {
      sel_bar = sel;
    }
    else if (sel[0].length) {
      sel_map = sel;
    }
    else {
      sel_time = sel;
    }
  }

  dots = d3.selectAll('.dot');

  var x0 = sel_map[0][0],
      x1 = sel_map[1][0],
      y0 = sel_map[0][1],
      y1 = sel_map[1][1];

  var t0 = sel_time[0],
      t1 = sel_time[1];

  var b0 = sel_bar[0],
      b1 = sel_bar[1];      

  var dotDate;
  dots.attr("class", function(d) {
    dotDate = xScale(new Date(d.DATE));
    var cx = parseFloat(d3.select(this).attr("cx"));
    var cy = parseFloat(d3.select(this).attr("cy"));

    // checking if the dot is inside both the timeline and map interval 
    // if(x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 && t0 <= dotDate && dotDate <= t1){
    // console.log(x0 <= cx);
   // console.log(cx <= x1);
    // console.log(y0 <= cy);
  // console.log(cy <= y1);
   //console.log(y1);
    //console.log(t0 <= dotDate);
     //console.log(dotDate <= t1);
   //console.log(b0 <= xBarScale(d.TIME));
    //console.log(xBarScale(d.TIME) <= b1);
    console.log(d.TIME);


    if(x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1 && t0 <= dotDate && dotDate <= t1 && b0 <= xBarScale(d.TIME) && xBarScale(d.TIME) <= b1){
        dataset[d.TIME]=dataset[d.TIME]+1;
        return "dot activeDot";
    } else { 
     
        return "dot noneActiveDot";
    }        
  });

  change_bar_chart(dataset);

  fromBar = false;
}

function change_bar_chart (dataset) {
  ymax=d3.max(dataset);
  yBarScale.domain([0, ymax]);
  yAxis = d3.axisLeft(yBarScale)
            .tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax/5));

  bar_svg.selectAll("rect")
         .data(dataset)
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
         .data(dataset)
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
      .call(yAxis.tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax/5)));
}

function fill_dots () {
    d3.selectAll('.dot')
      .attr("class", "dot activeDot");
}

function reset_brush() {
  time_svg.select(".brush").call(brush.move, [0,0]);
  // map_svg.select(".brush").call(brush.move, [[0,0],[0,0]]);
  fill_dots();
  change_bar_chart(dataset_all);
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
  
  console.log("Brush size = " + brushSize);
  console.log("Transition variation = " + transVar);

  time_svg.select(".brush").call(brush.move, [0,brushSize]);
  time_svg.select(".brush")
          .transition()
          .ease(d3.easeLinear)
          .duration(transVar)
          .call(brush.move, [xScale.range()[1] - brushSize, xScale.range()[1]]);
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