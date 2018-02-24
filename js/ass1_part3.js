//Width and height
var w = 500;
var h = 300;
var padding = 30;
var noOfMonths = 12;

var dataFreshFruit = [];
var dataFreshVegetable = [];
var dataStorageFruit = [];
var dataStorageVegetable = [];
var months = [];

var i = 0;
      
d3.csv('data/farmersMarket.csv', function(data){
    console.log(data);

    for (; i < 12; i++) {   
        dataFreshFruit.push(parseInt(data[i].Count));
    }
    for (; i < 24; i++) {   
        dataFreshVegetable.push(parseInt(data[i].Count));
    }

    for (; i < 36; i++) {   
        dataStorageFruit.push(parseInt(data[i].Count));
    }

    for (; i < 48; i++) {   
        dataStorageVegetable.push(parseInt(data[i].Count));
    }

    for (i=0; i < 12; i++){
        months.push(data[i].Month);
    }

console.log(dataFreshFruit);
console.log(dataFreshVegetable);
console.log(dataStorageFruit);
console.log(dataStorageVegetable);
console.log(months);

//Create scale functions
var xScale = d3.scaleBand()
                .domain(d3.range(noOfMonths))
                .rangeRound([0, w-padding])
                .paddingInner(0.05);

var yScale = d3.scaleLinear()
                .domain([d3.max(dataFreshFruit), 0])
                .range([0, h-2*padding]);           

//Define X axis
var xAxis = d3.axisBottom(xScale)
    .tickValues(months)
    .tickSize(12,12)
    .tickPadding(3)
    .ticks(12);
    
//Define Y axis
var yAxis = d3.axisLeft()
              .scale(yScale)
              .ticks(5);

//Create SVG element
var svg = d3.select("#part3_viz")
            .append("svg")
            .attr("width", w)
            .attr("height", h);
//Create bars
svg.selectAll("rect")
   .data(dataFreshFruit)
   .enter()
   .append("rect")
   .attr("x", function(d, i) {
        return xScale(i)+padding;
   })
   .attr("y", function(d) {
        return h-yScale(d) - padding;
   })
   .attr("width", xScale.bandwidth())
   .attr("height", function(d) {
        return yScale(d);
   })
   .attr("fill", function(d) {
        return "rgb(0, 0, " + Math.round(d * 10) + ")";
   });
            
//Create X axis
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate("+padding+"," + (h - padding) + ")");
    //.call(xAxis);
            
//Create Y axis
svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + padding + ","+padding+")")
    .call(yAxis);

function createPlot (data) {
  yScale.domain([0, d3.max(data)]);

  svg.selectAll("rect")
     .data(data)
     .transition()
     .duration(2000)
     .ease(d3.easeLinear)
     .attr("y", function(d) {
        return h - yScale(d) - padding;
     })
     .attr("height", function(d) {
        return yScale(d);
     })
     .attr("fill", function(d) {
      return "rgb(0, 0, " + Math.round(yScale(d)) + ")";
     });
  //Update all labels
  svg.selectAll("text")
     .data(data)
     .enter()
     .append("text")
     .text(function(d) {
        return d;
     })
     .attr("text-anchor", "middle")
     .attr("x", function(d, i) {
        return xScale(i) + padding + xScale.bandwidth() / 2;
     })
     .attr("y", function(d) {
        return h - yScale(d) + 14  - padding;
     })
     .attr("font-family", "sans-serif")
     .attr("font-size", "11px")
     .attr("fill", "white");
}


createPlot (dataFreshFruit);

//On click, update with new data            
d3.select("#FreshFruit")
    .on("click", function() {
  createPlot (dataFreshFruit);
});

//On click, update with new data            
d3.select("#FreshVegetable")
    .on("click", function() {
  createPlot (dataFreshVegetable);
});

//On click, update with new data            
d3.select("#StorageFruit")
    .on("click", function() {
  createPlot (dataStorageFruit);
});

//On click, update with new data            
d3.select("#StorageVegetable")
    .on("click", function() {
  createPlot (dataStorageVegetable);
});

            });