import * as Net from "./NE/network"
import * as utils from "./NE/utils"
import * as NetVis from "./NE/visual"
import * as optim from "./NE/optim"
import * as tf from '@tensorflow/tfjs';
import * as c3 from 'c3'

import Metacar from "metacar";

function singlePlay(n, env){
  var rewardSum = 0.0;
  var timesteps = 0;

  env.reset();
  for (let s=0; s < 1000; s++){
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

  }
  // Log the reward
  //env.render(true);

  return {
    'reward': rewardSum,
    'timesteps': timesteps
  };
}


export function run(generations){
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
    console.log(lidarSize, controlSize);

    for(var gen = 0; gen<generations; gen++){
      console.log(singlePlay(neat.units[0][0], env));
    }

  });

}
