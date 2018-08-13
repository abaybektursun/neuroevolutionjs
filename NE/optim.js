import * as Net from "./network"
import * as utils from "./utils"

// Functions to be performed after every generation
export function cleanup(){
  Net.globalIDs.edges = {};
  Net.globalIDs.nodes = {};
}

export var optimConfigs = {
  mutationRate: 0.005,
  mutationRateInital:0.5,
  esStdDev: 0.01,
  unitsPerSpecies: 1000,
  num_species: 4
};

export class NEAT{
  constructor(in_size, out_size){
    this.in_size; this.out_size;
    // Array of unit arrays. Each unit array is different species
    this.units = [];
    // Best units for each species
    this.bestNets = [];
    this.currentGen = 0;

    for(var s=0; s<optimConfigs.num_species; s++){
      this.units[s] = [];
      var seedNet = new Net.Network(in_size, out_size);
      this.units[s].push(seedNet);
      for (var u=1; u<optimConfigs.unitsPerSpecies; u++){
        // Create unitsPerSpecies - 1 units with gaussian weights centered at
        // existing units
        // TODO!
        var newNet = ;
        this.units[s].push(newNet);
      }
    }
    mutateTopology(optimConfigs.mutationRateInital);

  }
  // mutRate - mutation rate
  mutateTopology(mutRate){
    // Valid random edge
    function randEdge(n){
      var availableNodesFrom = [];
      var availableNodesTo = [];
      for(var nodeID in n.nodes){
        availableNodesFrom.push(nodeID);
        availableNodesTo.push(nodeID);
      }
      n.inputNodes.forEach(function(elem) {
        // remove input elemnts
        availableNodesTo = availableNodesTo.filter(function(item) {
            return item !== elem.id;
        })
      });
      n.outputNodes.forEach(function(elem) {
        // remove output elemnts
        availableNodesFrom = availableNodesFrom.filter(function(item) {
            return item !== elem.id;
        })
      });
      var from = availableNodesFrom[Math.floor(Math.random()*availableNodesFrom.length)],
          to = availableNodesTo[Math.floor(Math.random()*availableNodesTo.length)];

      return [from, to];
    }

    for(var s=0; s<optimConfigs.num_species; s++){
      for (var u=0; u<optimConfigs.unitsPerSpecies; u++){
        if(Math.random() < mutRate){
          // New Node .5 chance
          if(Boolean(Math.round(Math.random()))){
            var from, to, type;
            [from, to] = randEdge(this.units[s][u]);
            type = utils.randElem(Net.activationTypes);
            this.units[s][u].insertNode(from, to, type);
          }
          // New Edge .5 chance
          // !TODO
          else{

          }
        }
      }
    }
  }
  evolve(){
    cleanup();
    this.currentGen++;
  }
}
