// d3.select("body").selectAll("div")
// .data(datasetRandom)
// .enter()
// .append("div")
// .attr("class", "bar")
// .style("height", function(d) {
//     var barHeight = d * 5; //Scale up by factor of 5
//     return barHeight + "px";});


 var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

svg.selectAll("rect")
   .data(dataset2)
   .enter()
   .append("rect")
   .attr("x", function(d, i) {
        return i * (width / dataset2.length);
   })
   .attr("y", function(d) {
        return height - (d * 4);
   })
   .attr("width", width / dataset2.length - barPadding)
   .attr("height", function(d) {
        return d * 4;
   })
   .attr("fill", function(d) {
        return "rgb(0, 0, " + (d * 10) + ")";
    });

svg.selectAll("text")
   .data(dataset2)
   .enter()
   .append("text")
   .text(function(d) {
        return d;
   })
    .attr("x", function(d, i) {
        return i * (width / dataset2.length) + (width / dataset2.length - barPadding) / 2;
    })
    .attr("y", function(d) {
        return height - (d * 4) + 14; //15 is now 14
    })
   .attr("text-anchor", "middle")
   .attr("font-family", "sans-serif")
   .attr("font-size", "11px")
   .attr("fill", "white");
