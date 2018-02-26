//Width and height
var padding = 50;

var m = {
    top: 10,
    right: 40,
    bottom: 30,
    left: 40
}

var weight = 900;
var height = 450;

var w = weight - m.left - m.right;
var h = height - m.top - m.bottom;

var dataFreshFruit = [];
var dataFreshVegetable = [];
var dataStorageFruit = [];
var dataStorageVegetable = [];

var i = 0;
var xScale; 
var yScale; 
var xAxis; 
var yAxis; 
var ymax;
var svg;


d3.csv("data/farmersMarket.csv", function(data) {
    for (; i < 12; i++) {   
        dataFreshFruit.push ({
            Count: parseInt(data[i].Count),
            Month: String(data[i].Month)
        });
    }
    for (; i < 24; i++) {   
        dataFreshVegetable.push ({
            Count: parseInt(data[i].Count),
            Month: String(data[i].Month)
        });
    }

    for (; i < 36; i++) {   
        dataStorageFruit.push ({
            Count: parseInt(data[i].Count),
            Month: String(data[i].Month)
        });        
    }

    for (; i < 48; i++) {   
        dataStorageVegetable.push ({
            Count: parseInt(data[i].Count),
            Month: String(data[i].Month)
        });             
    }

}); 


//Create SVG element
svg = d3.select("#part3_viz")
        .append("svg")
        .attr("width", weight + m.left + m.right)
        .attr("height", height + m.top + m.bottom)
        .append("g")
        .attr("transform", "translate(" + m.left*2 + "," + m.top + ")");

function createPlot (data, init) {

    //Create scale functions
    xScale = d3.scaleBand()
                .domain(data.map(function(d) { return d.Month; }))
                .range([0, w])
                .paddingInner(0.05);

    ymax = d3.max(data, function(d) { return d.Count; })+1;

    yScale = d3.scaleLinear()
                .domain([0 , ymax])
                .range([h, 0]);           

    //Define X axis
    xAxis = d3.axisBottom(xScale);
        
    //Define Y axis
    yAxis = d3.axisLeft(yScale)
                .tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax/5));

    //Create bars
    var bars = svg.selectAll(".bar")
                    .remove()
                    .exit()
                    .data(data);


    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", function(d){ return xScale(d.Month) + 6;} )
        .attr("y", h)
        .attr("width", xScale.bandwidth()-10)
        .attr("height", 0)
        .style("fill", function(d) { return "rgb(0, 0, " + Math.round(256-yScale(d.Count)) + ")";} )
        .transition()
        .duration(700)
        .ease(d3.easeLinear)
        .attr("height", function(d){ return h - yScale(d.Count)})
        .attr("y", function(d){ return yScale(d.Count);});               
    
    if (init) {
        //Create X axis
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);

        //Create Y axis
        svg.append("g")
           .attr("class", "y axis")
           .call(yAxis.tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax/5)));    

        // Create xAxis label
        svg.append("text")
            .attr("transform", "translate(" + (w/2) + " ," + (h + m.top + 30) + ")")
            .style("text-anchor", "middle")
            .text("Month");    

        // Create yAxis label
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - m.left - 8)
            .attr("x", 0 - (h / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("# of Unique Kinds of Produce"); 
    } else {
      svg.select(".x.axis")
       .call(xAxis);
                  //Update Y axis
       svg.select(".y.axis")
        .transition()
        .duration(1000)
        .call(yAxis.tickValues(d3.range(0,ymax+1,(ymax < 5) ? 1 : ymax/5)));
    }
}

window.onload = function () {
    createPlot(dataFreshFruit, 1);
}


//   //Update all labels
//   svg.selectAll("text")
//      .data(data)
//      .enter()
//      .append("text")
//      .text(function(d) {
//         return d;
//      })
//      .attr("text-anchor", "middle")
//      .attr("x", function(d, i) {
//         return xScale(i) + padding + xScale.bandwidth() / 2;
//      })
//      .attr("y", function(d) {
//         return h - yScale(d) + 14  - padding;
//      })
//      .attr("font-family", "sans-serif")
//      .attr("font-size", "11px")
//      .attr("fill", "white");
// }


//On click, update with new data            
d3.select("#FreshFruit")
    .on("click", function() {
  createPlot (dataFreshFruit, 0);
});

//On click, update with new data            
d3.select("#FreshVegetable")
    .on("click", function() {
  createPlot (dataFreshVegetable, 0);
});

//On click, update with new data            
d3.select("#StorageFruit")
    .on("click", function() {
  createPlot (dataStorageFruit, 0);
});

//On click, update with new data            
d3.select("#StorageVegetable")
    .on("click", function() {
  createPlot (dataStorageVegetable, 0);
});

