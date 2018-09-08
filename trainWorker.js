importScripts('/NE/network.js');

console.log('Train worker started');

onmessage = function(in_e, Metacar) {
  e = in_e.data;
  console.log('Message received from main script');
  var sqrtSum = 0;
  for(var i=0; i<e; i++){sqrtSum+=Math.sqrt(666)}
  console.log('Posting message back to main script');
  postMessage(sqrtSum);
}


/*
import * as Net from "./NE/network"
import * as utils from "./NE/utils"
import * as NetVis from "./NE/visual"
import * as optim from "./NE/optim"
import * as tf from '@tensorflow/tfjs';

import Metacar from "metacar";

//var CircularJSON = require('circular-json');

function singlePlay(n, env){
  var rewardSum = 0.0;
  var timesteps = 0;

  env.reset();
  for (let s=0; s < 3000; s++){
    timesteps = s;
    // Get the current state of the lidar
    const state = env.getState();
    var action = n.forward(state.linear);

    // Move forward
    //action = [0.5,0.0] means a: 0.5, steering: 0
    const reward = env.step(action);
    rewardSum += reward;

    // death of the network
    if (reward < 0.0){
      break;
    }

    // Log the reward
    env.render(true);

  }

  return {
    'reward': rewardSum,
    'timesteps': timesteps
  };
}

function selection(neat, env){
    for (var species in neat.units){
      // selection inbetween species
      var bestReward = 0.0;
      function playSpecies(species){
        for(var unit in neat.units[species]) {
          // Run a single network
          var n = neat.units[species][unit];
          var singlPlayReward = singlePlay(n, env);

          // Check if it beats the best in species
          if (singlPlayReward.reward > bestReward){
            neat.speciesBest[species] = neat.units[species][unit];
            bestReward = singlPlayReward.reward;
          }
          // Check if it beats the best globally
          if (singlPlayReward.reward > neat.bestScore){
            neat.bestNet = neat.units[species][unit];
            neat.bestScore = singlPlayReward.reward;
          }
        }
      }playSpecies(species)
    }
}

// Evloution
onmessage = function(generations){
  var neatObjsHistory = {};
  // Select a level
  const level = metacar.level.level1;
  // Create the environement
  const env = new metacar.env("env", level);

  // Continuous Control
  env.setAgentMotion(metacar.motion.ControlMotion);

  // Load the env
  env.load().then(() => {
    var lidarSize = env.getState().linear.length;;
    var controlSize = 2;
    var neat = new optim.NEAT(lidarSize, controlSize);
    neat.rewardsHistory = ['Train Rewards'];

    for(var gen = 0; gen<generations; gen++){
      console.log('Generation ', gen);

      // Spawn and mutation
      neat.esStep();

      selection(neat, env);

      // Record the highest score
      neat.rewardsHistory.push(neat.bestScore);

      //neatObjsHistory[gen] = CircularJSON.stringify(neat);

      // Report back to the main thread
      postMessage({
        'generation': gen,
        'rewardsHistory':neat.rewardsHistory
      });
    }
  });
}*/
