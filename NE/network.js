
import * as tf from '@tensorflow/tfjs';

//!TODO Make sure innovations are unquie
var _innovationNumber = 0;
function innovation(inNode, outNode){
  _innovationNumber++;
  return _innovationNumber;
}

export class Node{
  constructor(inpId, type, net){
    var id = parseInt(inpId);
    // Just to initialize the json
    net.edges[id] = {};
    this.id = id;
    this.type = type;
    this.dependencies = [];
    this.value = undefined;

    net.nodes[id] = this;
    if(type === 'in' || type === 'bias'){
      net.inputNodes.push(this);
    }
    else if (type === 'out') {
      net.outputNodes.push(this);
    }

    if(type === 'bias'){
      this.value  = 1.0;
    }
  }
}

export class Edge{
  constructor(input, output, weight, innovation_id){
    this.weight = weight;
    this.iid = innovation_id;
    this.in = input;
    this.out = output;
    output.dependencies.push(input);
  }
}

export class Network{
  constructor(in_size, out_size){
    this.in_size = in_size; this.out_size = out_size;
    this.nodes = {};
    this.edges = {};
    this.inputNodes = [];
    this.outputNodes = [];
    this.travelPath = [];

    // Create input nodes
    for (var i = 0; i < in_size; i++){
      var newNode = new Node(i, 'in', this);
    }
    // Create output nodes
    for (var i = in_size; i < in_size+out_size; i++){
      var newNode = new Node(i, 'out', this);
    }

    // Create an input bias node
    var newNode = new Node(this.numNodes(), 'bias', this);

    // Create the connections between input and output
    for(var anIn in this.inputNodes){
      for(var anOut in this.outputNodes){
        var inNode = this.inputNodes[anIn];
        var outNode = this.outputNodes[anOut];
        var newEdge = new Edge(
          inNode, outNode,
          tf.randomUniform([1],-1,1).dataSync()[0],
          innovation(inNode, outNode)
        );
        this.edges[this.inputNodes[anIn].id][this.outputNodes[anOut].id] = newEdge;
      }
    }
  }

  numNodes(){
    return Object.keys(this.nodes).length
  }

  // !TODO Manually check if the values are correct!
  forward(data){
    if(data.length != this.in_size){throw "Dimensions of the data and input of the network do not match"}

    // Populate input nodes
    for(var i in data){
      this.inputNodes[i].value = data[i];
    }

    var result = [];
    for(var i in this.outputNodes){
      var outNode = this.outputNodes[i];
      result.push(this.activate(outNode));
    }
    return result;
  }

  // !TODO check for cycles
  activate(node){
    this.travelPath.push(node);
    var accumulate = 0.0;

    for(var i in node.dependencies){
      var a_node = node.dependencies[i];
      if(a_node.value === undefined){
        a_node.value = activate(a_node);
      }
      // Affine transform
      console.log(this);
      accumulate += a_node.value * this.edges[a_node.id][node.id].weight;
    }

    this.travelPath.pop();
    return accumulate
  }

  tojson(){
    var graph = {"nodes":[], "links":[]}
    for(var n in this.nodes){
      graph.nodes.push({
        "name": this.nodes[n].type,
        "label": this.nodes[n].id,
        "id": this.nodes[n].id
      })
    }
    for(var from in this.edges){
      for(var to in this.edges[from]){
        graph.links.push({
          "source": from,
          "target": to,
          "type": this.edges[from][to].weight.toFixed(2)
        })
      }
    }
    return graph;
  }
}

function activation(type){
  var activ;

  switch(type) {
    case "out":
      activ = 0;
      break;
  }

  return activ;
}
