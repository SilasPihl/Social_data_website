var w = 800;
var h = 400;
var padding = 50;

var dataMenYear = [];
var dataMenTime = [];
var dataWomenYear = [];
var dataWomenTime = [];
var dataBothYear = [];
var dataBothTime = [];
var dataMenTogether = [];
var dataWomenTogether = [];
var dataBothTogether = [];
var lineMen;
var lineWomen;

d3.csv('data/mensmarathon.csv', function(dataMen){
d3.csv('data/womensmarathon.csv', function(dataWomen){           
console.log(dataMen);       
console.log(dataWomen);

var i = 0;

for (; i < dataMen.length; i++) {   
    dataMenYear.push(parseInt(dataMen[i].Year));
    dataMenTime.push(parseInt(dataMen[i].Time));
}

for (i = 0; i < dataWomen.length; i++) {        
    dataWomenYear.push(parseInt(dataWomen[i].Year));
    dataWomenTime.push(parseInt(dataWomen[i].Time));
}

for (i = 0; i < dataMenTime.length; i++) {  
    dataBothTime.push(dataMenTime[i]);
    dataBothYear.push(dataMenYear[i]);          
}

for (i = 0; i < dataWomenTime.length; i++) {
    dataBothTime.push(dataWomenTime[i]);
    dataBothYear.push(dataWomenYear[i]);
}

for (i = 0; i < dataMenTime.length; i++) {  
    dataMenTogether.push([dataMenYear[i],dataMenTime[i]]);
    dataBothTogether.push([dataMenYear[i],dataMenTime[i]]);
}

for (i = 0; i < dataWomenTime.length; i++) {
    dataWomenTogether.push([dataWomenYear[i],dataWomenTime[i]]);
    dataBothTogether.push([dataWomenYear[i],dataWomenTime[i]]);
}

//Create scale functions
var xScale = d3.scaleLinear()
                 .domain([d3.min(dataBothYear,function(d) { return d-3; }),d3.max(dataBothYear, function(d) { return d+3; })])
                 .range([padding, w - padding * 2]);

var yScale = d3.scaleLinear()
                 .domain([d3.min(dataBothTime,function(d) { return d-10; }),d3.max(dataBothTime, function(d) { return d+10; })])
                 .range([h - padding, padding]);

//Define X axis
var xAxis = d3.axisBottom()
                  .scale(xScale)
                  .ticks(5);
//Define Y axis
var yAxis = d3.axisLeft()
                  .scale(yScale)
                  .ticks(5);


//Create SVG element
var svg = d3.select("#part4_viz")
            .append("svg")
            .attr("width", w + padding)
            .attr("height", h + padding)
            .append("g")
            .attr("transform", "translate(" + padding*2 + "," + 20 + ")");


var line = d3.line()
            .x(function(d){return xScale(d.Year);})
            .y(function(d){return yScale(d.Time);});


function updateLine (input) {

    var lines = svg.selectAll(".line")
                 .remove()
                 .exit();

    if (input == "men" || input == "both") {
        lineMen = svg.append("path")
                     .datum(dataMen)
                     .attr("class", "line men")
                     .attr("d", line);
    }
    if (input == "women" || input == "both") {
        lineWomen = svg.append("path")
                   .datum(dataWomen)
                   .attr("class", "line women")
                   .attr("d", line);
    }
}

updateLine("both");

// Tooltip
var div = d3.select("#part4_viz").append("div") 
    .attr("class", "tooltip")       
    .style("opacity", 0);

//Create circles
svg.selectAll("circle")
    .data(dataMenTogether)
    .enter()
    .append("circle")
    .attr("cx", function(d) {
        return xScale(d[0]);
    })
    .attr("cy", function(d) {
        return yScale(d[1]);
    })
    .attr("r", 2)
    .attr("fill","red")
    .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)    
                .style("opacity", .9);    
            div .html("Year; " + d[0] + "<br/>"  + "Time: " + d[1])  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 325) + "px");  
            })          
    .on("mouseout", function(d) {   
        div.transition()    
            .duration(500)    
            .style("opacity", 0); 
    });

//Create circles
svg.selectAll("rect")
    .data(dataWomenTogether)
    .enter()
    .append("rect")
    .attr("x", function(d) {
        return xScale(d[0]);
    })
    .attr("y", function(d) {
        return yScale(d[1]);
    })
    .attr("width", 4)
    .attr("height",4)
    .attr("fill","green")
    .on("mouseover", function(d) {    
            div.transition()    
                .duration(200)    
                .style("opacity", .9);    
            div .html("Year; " + d[0] + "<br/>"  + "Time: " + d[1])  
                .style("left", (d3.event.pageX) + "px")   
                .style("top", (d3.event.pageY - 325) + "px");  
            })          
    .on("mouseout", function(d) {   
        div.transition()    
            .duration(500)    
            .style("opacity", 0); 
    });


//Create X axis
svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + (h - padding) + ")")
    .call(xAxis);

//Create Y axis
svg.append("g")
    .attr("class", "y axis")
    .attr("transform", "translate(" + padding + ",0)")
    .call(yAxis);

// Create xAxis label
svg.append("text")
    // .attr("transform", "translate(" + (w/2) + " ," + (h + padding/2 + 30) + ")")
    .attr("transform", "translate(" + (w/2) + " ," + h + ")")
    .style("text-anchor", "middle")
    .text("Year");    

// Create yAxis label
svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - padding/2 - 8)
    .attr("x", 0 - (h / 2))
    .attr("dy", "1em")
    .style("text-anchor", "middle")
    .text("Winning time [min]"); 

d3.select("#ButtonBoth")
    .on("click", function() {
        changeData (dataBothYear, dataBothTime, dataBothTogether, 'both');
    });

function changeData (dataYear, dataTime,  dataBoth, input) {

    xScale.domain([d3.min(dataYear,function(d) { return d-3; }),d3.max(dataYear, function(d) { return d+3; })]);
    yScale.domain([d3.min(dataTime,function(d) { return d-10; }),d3.max(dataTime, function(d) { return d+10; })]);
    
        if(input=="women"){
            svg.selectAll("circle")
                .data(dataMenTogether)
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr("fill-opacity",0.0)
                .attr("stroke-opacity",0.0);

            svg.selectAll("rect")
                .data(dataWomenTogether)
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr("x", function(d) {
                    return xScale(d[0]);
                })
                .attr("y", function(d) {
                    return yScale(d[1]);
                })
                .attr("width", 4)
                .attr("height",4)
                .attr("fill","green")
                .attr("fill-opacity",1.0)
                .attr("stroke-opacity",1.0);

        } else if(input=="men"){
            svg.selectAll("circle")
                .data(dataMenTogether)
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr("cx", function(d) {
                    return xScale(d[0]);
                })
                .attr("cy", function(d) {
                    return yScale(d[1]);
                })
                .attr("r", 2)
                .attr("fill","red")
                .attr("fill-opacity",1.0)
                .attr("stroke-opacity",1.0);

            //Create circles
            svg.selectAll("rect")
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr("fill-opacity",0.0)
                .attr("stroke-opacity",0.0);

        } else if(input=="both"){
            svg.selectAll("circle")
                .data(dataMenTogether)
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr("cx", function(d) {
                    return xScale(d[0]);
                })
                .attr("cy", function(d) {
                    return yScale(d[1]);
                })
                .attr("r", 2)
                .attr("fill","red")
                .attr("fill-opacity",1.0)
                .attr("stroke-opacity",1.0);

            svg.selectAll("rect")
                .data(dataWomenTogether)
                .transition()
                .duration(1000)
                .ease(d3.easeLinear)
                .attr("x", function(d) {
                    return xScale(d[0]);
                })
                .attr("y", function(d) {
                    return yScale(d[1]);
                })
                .attr("width", 4)
                .attr("height",4)
                .attr("fill","green")
                .attr("fill-opacity",1.0)
                .attr("stroke-opacity",1.0);
        }
        
    //Update X axis
    svg.select(".x.axis")
        .transition()
        .duration(1000)
        .call(xAxis);
    
    //Update Y axis
    svg.select(".y.axis")
        .transition()
        .duration(1000)
        .call(yAxis);

    updateLine(input);

}

d3.select("#ButtonWomen")
    .on("click", function() {
        changeData (dataWomenYear, dataWomenTime, dataWomenTogether, 'women');
    });


d3.select("#ButtonMen")
    .on("click", function() {
        changeData (dataMenYear, dataMenTime, dataBothTogether, 'men');

    });

});});