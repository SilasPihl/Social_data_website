var svg = d3.select("body")
            .append("svg")
            .attr("width", width)
            .attr("height", height);

var circles = svg.selectAll("circle")
  .data(dataset)
  .enter()
  .append("circle");

circles.attr("cx", function(d, i) {return (i * 50) + 25; })
       .attr("cy", height/2)
       .attr("r", function(d) { return d;})
       .attr("fill", "yellow")
        .attr("stroke", "orange")
        .attr("stroke-width", function(d) {return d/2;});

