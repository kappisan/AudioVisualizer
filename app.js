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

        drawCircle((Math.cos(toRadians(time)) * 400) + 600, 800 - (frequencyData[170] * 5));
        time++;
  }

  // Run the loop
  renderChart();


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
/*
var time = 0;
d3.timer(function() {
  console.log(time + ' d3 timer');
  time++;

  drawCircle((Math.cos(toRadians(time)) * 300) + 800, (Math.sin(toRadians(time)) * 250) + 400);
});
*/

});
