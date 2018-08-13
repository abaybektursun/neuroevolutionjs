import * as Net from "./network"
import * as NetVis from "./visual"
import * as optim from "./optim"
import * as tf from '@tensorflow/tfjs';
import * as c3 from 'c3'

function XOR(i1, i2){
  var b1 = Boolean(Math.round(i1));
  var b2 = Boolean(Math.round(i2));
  return b1 ? !b2 : b2;
}


// Init network
const n = new Net.Network(2,2);
console.log(n);

// Visualize the network
NetVis.diGraph("digraphDiv", n);

// Test Forward
console.log(
  n.forward([0.315,-0.6642])
);

function testInsertNode(from, to, type){
  var n1 = n.nodes[from];
  var n2 = n.nodes[to];
  n.insertNode(n1, n2, type);
  console.log('Inserted node from ' + from + ' to ' + to);
  NetVis.diGraph("digraphDiv", n);
  console.log(n.forward([0.315,-0.6642]));
  optim.cleanup();
}
function testInsertEdge(from, to){
  var n1 = n.nodes[from];
  var n2 = n.nodes[to];
  n.insertEdge(n1, n2);
  console.log('Inserted edge from ' + from + ' to ' + to);
  NetVis.diGraph("digraphDiv", n);
  console.log(
    n.forward([0.315,-0.6642])
  );
  optim.cleanup();
}

function testTO(){
  // TO - Timeout
  console.log(n);
  var out2, out3;
  console.log(
    n.forward([0.315,-0.6642])
  );
  out2 = n.nodes[4].valuePrev()*n.edges[4][2].weight+
         n.nodes[0].valuePrev()*n.edges[0][2].weight+
         (Net.activation('tanh')(Net.activation('relu')(n.nodes[1].valuePrev()))
          * n.edges[6][2].weight
         );

  out3 = n.nodes[0].valuePrev()*n.edges[0][3].weight+
         n.nodes[4].valuePrev()*n.edges[4][3].weight+
         n.nodes[1].valuePrev()*n.edges[1][3].weight+
         Net.activation('relu')(n.nodes[1].valuePrev())*n.edges[5][3].weight;

  // Manual forward
  console.log("Manual Forward test: ",[out2, out3]);

}


setTimeout(function(){testInsertNode(1,2, 'relu')}, 500);
setTimeout(function(){testInsertNode(5,2, 'tanh')}, 1000);
setTimeout(function(){testInsertEdge(5,3)}, 1500);
setTimeout(function(){testInsertEdge(6,5)}, 2000);
setTimeout(testTO, 2510);
//-----------------------------------------------------------------
// XOR ------------------------------------------------------------
function testXOR(){
  console.log("Starting the real test ---------------------------------------");
  var generations = 1;
  var trainSize = 500;
  var testSize = 50;

  var neat = new optim.NEAT(2,1);

  // Create a new network
  NetVis.diGraph("digraphDiv", neat.bestNets[0]);

  var trainX = [],
      trainY = [],
      testX  = [],
      testY  = [];
  var x1, x2, y;

  for(var i=0; i<trainSize; i++){
    x1 = Math.random();
    x2 = Math.random();
    y = XOR(x1, x2);
    trainX.push([x1, x2]); trainY.push(y);
  }

  for(var i=0;i<testSize;i++){
    x1 = Math.random();
    x2 = Math.random();
    y = XOR(x1, x2);
    testX.push([x1, x2]); testY.push(y);
  }
  /*var testPreds = [];
  for(var i=0;i<testSize;i++){
    testPreds.push(neat.bestNets[0].forward(testX[i])[0]);
  }*/

  function singleRun(n){
    var reward = 0.0;
    for(var i in trainX){
      reward += 1.0 - Math.abs(n.forward(trainX[i])[0] - trainY[i])
    }
    return reward;
  }

  for(var gen=0; gen<generations; gen++){
    //Optimization here

    // sum(abs(testPreds) - abs(testY))
    var error = tf.tensor1d(testPreds).abs().sub( tf.tensor1d(testY).abs() ).sum().dataSync();
    console.log(error);
    //.unshift

    var chart = c3.generate({
      bindto: '#xorTest',
      data: {
        columns: [
          ['acc', 30, 200, 100, 400, 150, 250],
        ]
      }
    });
  }


}
setTimeout(testXOR, 3010);
