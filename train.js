import * as Net from "./NE/network"
import * as utils from "./NE/utils"
import * as NetVis from "./NE/visual"
import * as optim from "./NE/optim"

import * as c3 from 'c3'

import Metacar from "metacar";

// Chart rewards
var chart = c3.generate({
  bindto: '#metCarTrain',
  data: {
    columns: [
        ['Train Rewards']
    ]
  }
});

var myWorker = new Worker('trainWorker.js');

myWorker.onmessage = function(e) {
  console.log(e.data);
  console.log('Message received from worker');
}


export function train_one_gen(){
  myWorker.postMessage(1);
  console.log('Message posted to worker');
}
