import * as utils from "./utils"
import * as tf from '@tensorflow/tfjs';

export var activationTypes = ['tanh', 'relu', 'sigmoid'];

export var globalIDs = {
  edges: {},
  nodes: {},
  _edgeNumber: 0,
  _nodeNumber: 0
};

function nodeID(from, to){
  if (globalIDs.nodes[from] === undefined){
    globalIDs.nodes[from] = {};
  }
  if(globalIDs.nodes[from][to] === undefined){
    globalIDs._nodeNumber++;
    globalIDs.nodes[from][to] = globalIDs._nodeNumber;
  }

  return globalIDs.nodes[from][to];
}

function edgeID(from, to){
  if (globalIDs.edges[from] === undefined){
    globalIDs.edges[from] = {};
  }
  if(globalIDs.edges[from][to] === undefined){
    globalIDs._edgeNumber++;
    globalIDs.edges[from][to] = globalIDs._edgeNumber;
  }
  return globalIDs.edges[from][to];
}


export class Node{
  constructor(inpId, type, net){
    var id = inpId;
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

    // For recurrent connections
    net.prev_vals[id] = 1.0;

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
          edgeID(inNode, outNode), this
        );
      }
    }

    // Inform globalIDs
    if(globalIDs._nodeNumber === 0){
      globalIDs._nodeNumber = this.numNodes()-1;
    }
  }

  numNodes(){
    return Object.keys(this.nodes).length;
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
    // DEBUG:
    //console.log(this);
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
      //console.log( node.dependencies);
      if(a_node.value() === undefined){
        // Detects cycles
        if(this.travelPath.includes(a_node)){
          active_val = a_node.valuePrev();
          // !DEBUG
          //console.log('Cycle Detected!');
        }
        else{
          // DEBUG:
          //console.log(a_node);

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
      console.log('from ', a_node.id, '-> to ', node.id);
      //console.log(this.edges);
      //console.log(this.nodes);
      //console.log(this.edges[a_node.id]);
      accumulate += active_val * this.edges[a_node.id][node.id].weight;
    }

    this.travelPath.pop();
    return activation(node.type)(accumulate)
  }

  removeEdge(from, to){
    // delete the old edge
    delete this.edges[from.id][to.id];
    var depIdx = to.dependencies.indexOf(from);
    to.dependencies.splice(depIdx,1);
  }

  // (From, to) are Nodes
  insertNode(from, to, type){
    var weight;
    if(this.edges[from.id][to.id] !== undefined){
      weight = this.edges[from.id][to.id].weight;
      this.removeEdge(from, to);
    }

    var newNode = new Node(nodeID(from, to), type, this);

    var newEdgeTo = new Edge(
      from, newNode, 1.0,
      edgeID(from, newNode), this
    );
    var newEdgeFrom = new Edge(
      newNode, to, weight,
      edgeID(newNode, to), this
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
      edgeID(from, to), this
    );
  }

  esSpawn(stdDev, numUnits){
    var spawned = [];
    for(var i=0; i<numUnits; i++){
      var aClone = this.clone();

      // !important Mutate edge values
      for (var f in this.edges){
        for(var t in aClone.edges[f]){
          aClone.edges[f][t].weight = tf.randomNormal(
            [1,1], this.edges[f][t].weight, stdDev
          ).dataSync()[0];
        }
      }

      spawned.push(aClone);
    }
    return spawned;
  }

  // Have to copy create object clone manually. Why JS? Why?!
  clone(){
    function copyNodesByID(nodesPool, source, target){
      for(var i in source){
        target[i] = nodesPool[source[i].id];
      }
    }
    //var copy = Object.assign({}, this);
    var copy = utils.copyObj(this);

    copy.nodes = utils.copyObj(this.nodes);
    for(var n in this.nodes){
      copy.nodes[n] = utils.copyObj(this.nodes[n]);
      copy.nodes[n].net = copy;
    }

    for(var n in copy.nodes){
      copy.nodes[n].dependencies = utils.copyObj(this.nodes[n].dependencies);
      copyNodesByID(
        copy.nodes,
        copy.nodes[n].dependencies,
        copy.nodes[n].dependencies
      );
    }

    copy.edges =utils.copyObj(this.edges);
    for(var from in this.edges){
      copy.edges[from] = utils.copyObj(this.edges[from]);
      for(var to in this.edges[from]){
        copy.edges[from][to] = utils.copyObj(this.edges[from][to]);
        copy.edges[from][to].in = copy.nodes[copy.edges[from][to].in.id];
        copy.edges[from][to].out = copy.nodes[copy.edges[from][to].out.id];
      }
    }

    copy.inputNodes = this.inputNodes.slice();
    copyNodesByID(copy.nodes, this.inputNodes, copy.inputNodes);
    copy.outputNodes = this.outputNodes.slice();
    copyNodesByID(copy.nodes, this.outputNodes, copy.outputNodes);
    copy.hiddenNodes = this.hiddenNodes.slice();
    copyNodesByID(copy.nodes, this.hiddenNodes, copy.hiddenNodes);

    copy.travelPath = [];
    copy.current_vals = utils.copyObj(this.current_vals);
    copy.prev_vals = utils.copyObj(this.prev_vals);

    return copy;
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
