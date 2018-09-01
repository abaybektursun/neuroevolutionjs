import * as Net from "./network"
import * as utils from "./utils"
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
//console.log(n);

// Visualize the network
NetVis.diGraph("digraphDiv", n);

// Test Forward
//console.log(
//  n.forward([0.315,-0.6642])
//);

function testInsertNode(from, to, type){
  var n1 = n.nodes[from];
  var n2 = n.nodes[to];
  n.insertNode(n1, n2, type);
  console.log('Inserted node from ' + from + ' to ' + to);
  NetVis.diGraph("digraphDiv", n);
  console.log(n.forward([0.315,-0.6642]));
  optim.cleanupStep();
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
  optim.cleanupStep();
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


setTimeout(function(){testInsertNode(1,2, 'relu')}, 100);
setTimeout(function(){testInsertNode(5,2, 'tanh')}, 300);
setTimeout(function(){testInsertEdge(5,3)}, 500);
setTimeout(function(){testInsertEdge(6,5)}, 700);
setTimeout(testTO, 910);
//-----------------------------------------------------------------
// XOR ------------------------------------------------------------
function testXOR(){
  console.log("--------------------------------------- Starting the real test ---------------------------------------");
  var generations = 100;
  var trainSize = 30;
  var testSize = 10;

  var neat = new optim.NEAT(2,1);
  console.log('Species: ', neat.units);

  // Create a new network
  var sampleUnit = utils.randElem(optim.mutated);
  //NetVis.diGraph("digraphDiv", sampleUnit);

  // DEBUG:
  /*var mutNodeIds = {};
  for (var i in optim.mutated){
    for (var e in optim.mutated[i].nodes){
      if (optim.mutated[i].nodes[e].id in mutNodeIds){
        mutNodeIds[optim.mutated[i].nodes[e].id]++;
      }else{mutNodeIds[optim.mutated[i].nodes[e].id] = 0;}
    }
  }
  console.log("Unique Node IDs", mutNodeIds);*/


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

  function singleRunTest(n){
    var reward = 0.0;
    for(var i in testX){
      reward += 1.0 - Math.abs(n.forward(testX[i])[0] - testY[i])
    }
    return reward/testX.length;
  }
  function singleRunTrain(n){
    var reward = 0.0;
    for(var i in trainX){
      reward += 1.0 - Math.abs(n.forward(trainX[i])[0] - trainY[i])
    }
    return reward;
  }
  // Chart rewards
  var chart = c3.generate({
    bindto: '#xorTest',
    data: {
      columns: [
          ['Test Rewards']
      ]
    }
  });

  // TEMP?, Do NOT use this in the future?
  function esStep(best, s){
    var shifted = [];
    {
      for(var i=0; i<optim.optimConfigs.unitsPerSpecies; i++){
        var aClone = best.clone();

        // !important Mutate edge values
        for (var f in best.edges){
          for(var t in aClone.edges[f]){
            aClone.edges[f][t].weight = tf.randomNormal(
                                          [1,1], best.edges[f][t].weight, optim.optimConfigs.esStdDev
                                        ).dataSync()[0];
          }
        }
        shifted.push(aClone);
      }
    }
    neat.units[s] = shifted
    neat.mutateTopology(optim.optimConfigs.mutationRate, s);
  }


  // Optimize ---------------------------------------------------------
  var rewards = ['Test Rewards'];
  for(var gen=0; gen<generations; gen++){
    console.log('\t Generation', gen);
    //Optimization here
    for(var species in neat.units){

      var reward = 0.0,
          bestReward = 0.0;

      optim.cleanupStep();
      esStep(neat.speciesBest[species], species);

      for(var unitId in neat.units[species]){
        var aNet = neat.units[species][unitId];
        reward = singleRunTest(aNet);

        if (reward > bestReward){
          neat.speciesBest[species] = aNet;
          bestReward = reward;
        }
      }

    }
    var bestOfBest = 0.0;
    for(var species in neat.speciesBest){
      var bestScore = singleRunTest(neat.speciesBest[species]);
      if (bestScore > bestOfBest) {
        bestOfBest = bestScore;
        neat.bestNet = neat.speciesBest[species];
      }
    }
    rewards.push(singleRunTest(neat.bestNet));
    neat.evolve();
  }
  chart.load({
      columns: [
          rewards
      ]
  });
  // DEBUG:
  for(var species in neat.units){
    NetVis.diGraph("digraphDiv"+(species), neat.units[species][0]);
  }

  //---------------------------------------------------------------------


}
setTimeout(testXOR, 1010);
