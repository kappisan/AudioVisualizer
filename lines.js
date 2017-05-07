$(document).ready(function () {

  var audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  var audioElement = document.getElementById('audioElement');
  var audioSrc = audioCtx.createMediaElementSource(audioElement);
  var analyser = audioCtx.createAnalyser();

  // Bind our analyser to the media element source.
  audioSrc.connect(analyser);
  audioSrc.connect(audioCtx.destination);

  //var frequencyData = new Uint8Array(analyser.frequencyBinCount);
  var frequencyData = new Uint8Array(300);

  var svgHeight = '800';
  var svgWidth = '1600';
  var barPadding = '1';
  var time = 0;


  function createSvg(parent, height, width) {
    return d3.select('#svg-container').append('svg').attr('height', height).attr('width', width);
  }

  var svg = createSvg('body', svgHeight, svgWidth);

  // Create our initial D3 chart.
  svg.selectAll('rect')
     .data(frequencyData)
     .enter()
     .append('rect')
     .attr('x', function (d, i) {
        return i * (svgWidth / frequencyData.length);
     })
     .attr('width', svgWidth / frequencyData.length - barPadding);

  // Continuously loop and update chart with frequency data.
  function renderChart() {
     requestAnimationFrame(renderChart);

     // Copy frequency data to frequencyData array.
     analyser.getByteFrequencyData(frequencyData);

     // Update d3 chart with new data.
     svg.selectAll('rect')
        .data(frequencyData)
        .attr('y', function(d) {
           return svgHeight - d;
        })
        .attr('height', function(d) {
           return d;
        })
        .attr('fill', function(d) {
           return 'rgb(255, 0, 0)';
        });

        svg.selectAll('ellipse')
           .attr('rx', (frequencyData[4]) / 12)
           .attr('ry', (frequencyData[4]/2) / 12);

        updateData(800 - (frequencyData[4] * 3), 800 - (frequencyData[170] * 3));

        drawCircle((Math.cos(toRadians(time)) * 400) + 600, 800 - (frequencyData[170] * 5));
        time++;
  }

  // Run the loop
  renderChart();



var i = 0;

function particle() {
  var m = d3.mouse(this);

  drawCircle(m[0], m[1]);

  d3.event.preventDefault();
}

function drawCircle(x, y) {
    svg.insert("circle", "rect")
      .attr("cx", x)
      .attr("cy", y)
      .attr("r", 1e-6)
      .style("stroke", d3.hsl((i = (i + 1) % 360), 1, .5))
      .style("stroke-opacity", 1)
    .transition()
      .duration(2000)
      .ease(Math.sqrt)
      .attr("r", 100)
      .style("stroke-opacity", 1e-6)
      .remove();
}

function toRadians(angle) {
  return angle * (Math.PI / 180);
}






/* LINE CHART */

// Set the dimensions of the canvas / graph
var margin = {top: 30, right: 20, bottom: 30, left: 50},
    width = 2200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

// Parse the date / time
var parseDate = d3.time.format("%d-%b-%y").parse;

// Set the ranges
var x = d3.time.scale().range([width, 0]);
var y = d3.scale.linear().range([0, height]);

// Define the axes
var xAxis = d3.svg.axis().scale(x)
    .orient("bottom").ticks(5);

var yAxis = d3.svg.axis().scale(y)
    .orient("left").ticks(5);

// Define the line
var valueline = d3.svg.line()
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.close); });
    
// Adds the svg canvas
var linesvg = svg.append("g")
        .attr("transform", 
              "translate(" + margin.left + "," + margin.top + ")");


var bassData = [];
var trebleData = [];
var today = moment();

for(var i = 0; i < 50; i++) {
  bassData.push({date: parseDate(today.subtract(1, 'days').format('DD-MMM-YY')), close: 800});
  trebleData.push({date: parseDate(today.format('DD-MMM-YY')), close: 800});
}

console.log('new  bassData', bassData);




// Scale the range of the data
x.domain(d3.extent(bassData, function(d) { return d.date; }));
y.domain([0, 800]);

// Add the valueline path.
linesvg.append("path")
    .attr("class", "line bassline")
    .attr("d", valueline(bassData));

linesvg.append("path")
    .attr("class", "line trebleline")
    .attr("d", valueline(trebleData));

function updateData(bassVal, trebleVal) {

    if (!bassData || !trebleData || bassData == [] || trebleData == []) return;

    for(var i = 0; i < (bassData.length - 1); i++) {
      bassData[i].close = bassData[i+1].close;
      trebleData[i].close = trebleData[i+1].close;
    }

    bassData[bassData.length - 1].close = bassVal;
    trebleData[trebleData.length - 1].close = trebleVal;

    // Select the section we want to apply our changes to
    var svg = d3.select("body").transition();

    linesvg.select(".bassline")
        .attr("class", "line bassline")
        .attr("d", valueline(bassData));

    linesvg.select(".trebleline")
        .attr("class", "line trebleline")
        .attr("d", valueline(trebleData));

}

});
