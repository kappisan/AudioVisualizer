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

  var svgHeight = '400';
  var svgWidth = '500';
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
           return '#ef5229';
        });

        svg.selectAll('ellipse')
           .attr('rx', (frequencyData[4]) / 12)
           .attr('ry', (frequencyData[4]/2) / 12);

        updateData(800 - (frequencyData[4] * 3), 800 - (frequencyData[170] * 3));


        if ($("#rings-checkbox").is(':checked')) { 
          drawCircle((Math.cos(toRadians(time)) * 400) + 600, 800 - (frequencyData[170] * 5)); 
        }

        
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
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

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


/* sperm */

  // Continuously loop and update chart with frequency data.

  var width = svgWidth,
      height = svgHeight;

  var n = 100,
      m = 12,
      degrees = 180 / Math.PI;

  var spermatozoa = d3.range(n).map(function() {
    var x = Math.random() * width,
        y = Math.random() * height;
    return {
      vx: Math.random() * 2 - 1,
      vy: Math.random() * 2 - 1,
      path: d3.range(m).map(function() { return [x, y]; }),
      count: 0
    };
  });

  var g = svg.selectAll("g")
      .data(spermatozoa)
    .enter().append("g");

  var head = g.append("ellipse")
      .attr("rx", 12.5)
      .attr("ry", 6);

  g.append("path")
      .datum(function(d) { return d.path.slice(0, 3); })
      .attr("class", "mid");

  g.append("path")
      .datum(function(d) { return d.path; })
      .attr("class", "tail");

  var tail = g.selectAll("path");

  d3.timer(function() {
    for (var i = -1; ++i < n;) {
      var spermatozoon = spermatozoa[i],
          path = spermatozoon.path,
          dx = spermatozoon.vx,
          dy = spermatozoon.vy,
          x = path[0][0] += dx,
          y = path[0][1] += dy,
          speed = Math.sqrt(dx * dx + dy * dy),
          count = speed * 10,
          k1 = -5 - speed / 3;

      // Bounce off the walls.
      if (x < 0 || x > width) spermatozoon.vx *= -1;
      if (y < 0 || y > height) spermatozoon.vy *= -1;

      // Swim!
      for (var j = 0; ++j < m;) {
        var vx = x - path[j][0],
            vy = y - path[j][1],
            k2 = Math.sin(((spermatozoon.count += count) + j * 3) / 300) / speed;
        path[j][0] = (x += dx / speed * k1) - dy * k2;
        path[j][1] = (y += dy / speed * k1) + dx * k2;
        speed = Math.sqrt((dx = vx) * dx + (dy = vy) * dy);
        if(j % 19 == 0) { drawCircle(path[j][0], path[j][1]); }
      }
    }

    head.attr("transform", headTransform);
    tail.attr("d", tailPath);

  });

  function headTransform(d) {
    return "translate(" + d.path[0] + ")rotate(" + Math.atan2(d.vy, d.vx) * degrees + ")";
  }

  function tailPath(d) {
    return "M" + d.join("L");
  }



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


});
