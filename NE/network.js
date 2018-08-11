
import * as tf from '@tensorflow/tfjs';

export class Node{
  constructor(inpId, type, net){
    var id = parseInt(inpId);
    // Just to initialize the json
    net.edges[id] = {};
    this.net = net;
    this.id = id;
    this.type = type;
    this.dependencies = [];

    net.nodes[id] = this;
    if (type === 'in' || type === 'bias' || type === 'out'){

      if(type === 'in' || type === 'bias'){
        net.inputNodes.push(this);
      }
      else if (type === 'out') {
        net.outputNodes.push(this);
      }
    }
    else{
      net.hiddenNodes.push(this);
    }

  }
  value(){
    return this.net.current_vals[this.id];
  }
  valueSet(val){
    this.net.current_vals[this.id] = val;
  }
  valuePrev(){
    return this.net.prev_vals[this.id];
  }
}

export class Edge{
  constructor(input, output, weight, innovation_id, net){
    if (output.type == 'bias' || output.type == 'in'){ throw "Edge cannot point to input!"; }
    if (input.type == 'out'){ throw "Edge cannot originate from output!"; }

    this.weight = weight;
    this.iid = innovation_id;
    this.in = input;
    this.out = output;
    output.dependencies.push(input);
    net.edges[input.id][output.id] = this;
  }
}

export class Network{
  constructor(in_size, out_size){
    this.in_size = in_size; this.out_size = out_size;
    this.nodes = {};
    this.edges = {};
    this.inputNodes = [];
    this.outputNodes = [];
    this.hiddenNodes = [];
    this.travelPath = [];
    this.current_vals = {};
    this.prev_vals = {};

    // !TODO Make sure innovations are unquie
    // !TODO refresh every generation
    this._innovationNumber = 0;


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
          tf.randomUniform([1,1],-1.0,1.0,'float32').dataSync()[0],
          this.innovation(inNode, outNode), this
        );
      }
    }
  }

  numNodes(){
    return Object.keys(this.nodes).length
  }

  forward(data){
    if(data.length != this.in_size){throw "Dimensions of the data and input of the network do not match"}

    // Populate input nodes
    for(var i in data){
      this.inputNodes[i].valueSet(data[i]);
    }
    // Set bias to 1 (last elemnt of inputNodes is always bias)
    this.inputNodes[this.inputNodes.length-1].valueSet(1.0);

    var result = [];
    for(var i in this.outputNodes){
      var outNode = this.outputNodes[i];
      result.push(this.activate(outNode));
    }

    // Copy current to prev and clear the current
    this.prev_vals = Object.assign({}, this.current_vals);
    this.current_vals = {};

    return result;
  }

  // Recursively traverses the network
  activate(node){
    this.travelPath.push(node);
    var accumulate = 0.0;

    for(var i in node.dependencies){
      var a_node = node.dependencies[i];
      var active_val;
      if(a_node.value() === undefined){
        // Detects cycles
        if(this.travelPath.includes(a_node)){
          active_val = a_node.valuePrev();
          // !DEBUG
          console.log('Cycle Detected!');
        }
        else{
          a_node.valueSet(this.activate(a_node));
          active_val = a_node.value();
        }
        // !DEBUG
        //console.log('Activation value for ' + a_node.id + ': ' + active_val);
      }
      else{
        active_val = a_node.value();
      }
      // Affine transform
      //console.log(this);
      accumulate += active_val * this.edges[a_node.id][node.id].weight;
    }

    this.travelPath.pop();
    return activation(node.type)(accumulate)
  }

  removeEdge(from, to){
    // delete the old edge
    delete this.edges[from.id][to.id];
    var depIdx = to.dependencies.indexOf(from);
    delete to.dependencies[depIdx];
  }

  // (From, to) are Nodes
  insertNode(from, to, type){
    var weight;
    if(this.edges[from.id][to.id] !== undefined){
      weight = this.edges[from.id][to.id].weight;
      this.removeEdge(from, to);
    }

    var newNode = new Node(this.numNodes(), type, this);

    var newEdgeTo = new Edge(
      from, newNode, 1.0,
      this.innovation(from, newNode), this
    );
    var newEdgeFrom = new Edge(
      newNode, to, weight,
      this.innovation(newNode, to), this
    );
  }
  // (From, to) are Nodes
  insertEdge(from, to){
    if(this.edges[from.id][to.id] !== undefined){
      throw "Edge going from " + from + " to " + to + " already exists"
    }
    var newEdge = new Edge(
      from, to,
      tf.randomUniform([1,1],-1.0,1.0,'float32').dataSync()[0],
      this.innovation(from, to), this
    );

  }
  innovation(inNode, outNode){
    this._innovationNumber++;
    return this._innovationNumber;
  }

  // Extract nodes and links as json
  tojson(){
    var graph = {"nodes":[], "links":[]};
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

export function activation(type){
  var activ;

  switch(type) {
    case "relu":
      activ = (x) => Math.max(0, x);
      break;
    case "sigmoid":
      activ = (x) => 1.0/(1 + Math.exp(-x));
      break;
    case "tanh":
      activ = (x) => Math.tanh(x);
      break;
    default:
      activ = (x) => x;
  }

  return activ;
}
