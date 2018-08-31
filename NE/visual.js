import * as d3 from "d3";
import {selection, select} from "d3-selection";
import "d3-selection-multi";

//svg, edgepaths, edgelabels,rx, shared.ry, links, nodes,
//width, height, node, link, simulation,


function update(network, shared) {
    function dragstarted(d) {
        if (!d3.event.active) shared.simulation.alphaTarget(0.3).restart()
        d.fx = d.x;
        d.fy = d.y;
    }

    function dragged(d) {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
    }
    function ticked() {
        shared.link
            .attr("x1", function (d) {return d.source.x;})
            .attr("y1", function (d) {return d.source.y;})
            .attr("x2", function (d) {return d.target.x;})
            .attr("y2", function (d) {return d.target.y;});

        shared.node
            .attr("transform", function (d) {return "translate(" + d.x + ", " + d.y + ")";});

        shared.edgepaths.attr('d', function (d) {
            return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
        });

        shared.edgelabels.attr('transform', function (d) {
            if (d.target.x < d.source.x) {
                var bbox = this.getBBox();

                shared.rx = bbox.x + bbox.width / 2;
                shared.ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + shared.rx + ' ' + shared.ry + ')';
            }
            else {
                return 'rotate(0)';
            }
        });
    }

    var graph = network.tojson();
    shared.links = graph.links;
    shared.nodes = graph.nodes;
    shared.link = shared.svg.selectAll(".link")
        .data(shared.links)
        .enter()
        .append("line")
        .attr("class", "link")
        .attr('marker-end','url(#arrowhead)')

    shared.link.append("title")
        .text(function (d) {return d.type;});

    shared.edgepaths = shared.svg.selectAll(".edgepath")
        .data(shared.links)
        .enter()
        .append('path')
        .attrs({
            'class': 'edgepath',
            'fill-opacity': 0,
            'stroke-opacity': 0,
            'id': function (d, i) {return 'edgepath' + i}
        })
        .style("pointer-events", "none");


    shared.edgelabels = shared.svg.selectAll(".edgelabel")
        .data(shared.links)
        .enter()
        .append('text')
        .style("pointer-events", "none")
        .attrs({
            'class': 'edgelabel',
            'id': function (d, i) {return 'edgelabel' + i},
            'font-size': 10,
            'fill': '#aaa'
        });

    shared.edgelabels.append('textPath')
        .attr('xlink:href', function (d, i) {return '#edgepath' + i})
        .style("text-anchor", "middle")
        .style("pointer-events", "none")
        .attr("startOffset", "50%")
        .text(function (d) {return d.type});

    shared.node = shared.svg.selectAll(".node")
        .data(shared.nodes)
        .enter()
        .append("g")
        .attr("class", "node")
        .call(d3.drag()
                .on("start", dragstarted)
                .on("drag", dragged)
                //.on("end", dragended)
        );

    shared.node.append("circle")
        .attr("r", 5)
        .style("fill", function (d, i) {return shared.colors(i);})

    shared.node.append("title")
        .text(function (d) {return d.id;});

    shared.node.append("text")
        .attr("dy", -3)
        .text(function (d) {return d.name+":"+d.label;});

    shared.simulation
        .nodes(shared.nodes)
        .on("tick", ticked);

    shared.simulation.force("link")
        .links(shared.links);
}


export function diGraph(container, network){
  var shared = {
    colors: d3.scaleOrdinal(d3.schemeCategory10)
  };

  if(shared.svg !== undefined){ shared.svg.remove(); }

  shared.width = d3.select("#"+container).attr("width");
  shared.height = d3.select("#"+container).attr("height");

  shared.svg = d3.select("#"+container).append("svg")
    .style("width", shared.width + 'px')
    .style("height", shared.height + 'px');



  shared.svg.append('defs').append('marker')
      .attrs({'id':'arrowhead',
          'viewBox':'-0 -5 10 10',
          'refX':13,
          'refY':0,
          'orient':'auto',
          'markerWidth':13,
          'markerHeight':13,
          'xoverflow':'visible'})
      .append('svg:path')
      .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
      .attr('fill', '#999')
      .style('stroke','none');

  shared.simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function (d) {return d.id;}).distance(100).strength(1))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(shared.width / 3, shared.height / 3));

  update(network, shared);
}
