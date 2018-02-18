 width = 600;
var svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);
svg.selectAll("circle") // <-- No longer "rect"
	.data(datasetPoints)
	.enter()
	.append("circle") // <-- No longer "rect"
	.attr("cx", function(d) {return d[0];	})
	.attr("cy", function(d) {return d[1];})
	.attr("r", 5)
	.attr("r", function(d) {return Math.sqrt(height- d[1]);});

svg.selectAll("text") // <-- Note "text", not "circle" or "rect"
	.data(datasetPoints)
	.enter()
	.append("text") // <-- Same here!
	.text(function(d) { return d[0] + "," + d[1];})
	.attr("x", function(d) { return d[0];})
	.attr("y", function(d) { return d[1];})
	.attr("font-family", "sans-serif")
	.attr("font-size", "11px")
	.attr("fill", "red");