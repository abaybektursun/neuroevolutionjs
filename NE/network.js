
import * as tf from '@tensorflow/tfjs';

var _innovationNumber = 0;
function innovation(){
  _innovationNumber++;
  return _innovationNumber;
}

export class Node{
  constructor(id, type, net){
    net.edges[id] = {};
    this.id = id;
    this.type = type;
    this.dependencies = [];
  }
}

export class Edge{
  constructor(weight, innovation_id){
    this.weight = weight;
    this.iid = innovation_id;
  }
}

export class Network{
  constructor(in_size, out_size){
    this.in_size = in_size; this.out_size = out_size;
    this.nodes = {};
    this.edges = {};
    this.inputNodes = [];
    this.outputNodes = [];

    for (var i = 0; i < in_size; i++){
      var newNode = new Node(parseInt(i), 'in', this);
      this.nodes[parseInt(i)] = newNode;
      this.inputNodes.push(newNode);
    }
    for (var i = in_size; i < in_size+out_size; i++){
      var newNode = new Node(parseInt(i), 'out', this);
      this.nodes[parseInt(i)] = newNode;
      this.outputNodes.push(newNode);
    }

    var newNode = new Node(parseInt(this.numNodes()), 'bias', this);
    this.nodes[parseInt(i)] = newNode;
    this.inputNodes.push(newNode);

    for(var anIn in this.inputNodes){
      for(var anOut in this.outputNodes){
        var newEdge = new Edge(tf.randomUniform([1],-1,1).dataSync()[0], innovation());
        this.edges[this.inputNodes[anIn].id][this.outputNodes[anOut].id] = newEdge;
      }
    }
  }

  numNodes(){
    return Object.keys(this.nodes).length
  }

  forward(data){
    if(data.length != this.in_size){throw "Dimensions of the data and input of the network do not match"}

    for(var i in data){

    }
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
