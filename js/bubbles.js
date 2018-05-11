

export function initBubbles() {

d3.csv("data/countAllUniqueContributingFactor.csv", function(d) {
  d.value = +d.value;
  if (d.value) return d;
}, function(error, classes) {
  if (error) throw error;

var factors_svg = d3.select("#d3_factors"),
    width = +factors_svg.attr("width"),
    height = +factors_svg.attr("height");

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
      .text(function(d) { return d.id + "\nNo.:" + format(d.value) + "\nPercent: " + Number((this.parentNode.__data__.data.percent)).toFixed(2) + "%"; });
});

}
