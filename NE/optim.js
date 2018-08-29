import * as Net from "./network"
import * as utils from "./utils"

export var mutated = [];

// Functions to be performed after every generation
export function cleanupStep(){
  Net.globalIDs.edges = {};
  Net.globalIDs.nodes = {};
  mutated = [];
}

export var optimConfigs = {
  mutationRate: 0.005,
  mutationRateInital:0.5,
  esStdDev: 0.001,
  unitsPerSpecies: 50,
  num_species: 4,
  num_preserve: 10
};

export class NEAT{
  constructor(in_size, out_size){
    cleanupStep();
    Net.globalIDs._edgeNumber = 0;
    Net.globalIDs._nodeNumber = 0;

    this.in_size; this.out_size;
    // Array of unit arrays. Each unit array is different species
    this.units = [];
    // Best units for each species
    this.bestNet = undefined;
    // best performing units in each species
    this.speciesBest = [];
    this.currentGen = 0;

    for(var s=0; s<optimConfigs.num_species; s++){
      this.speciesBest.push([]);
      var seedNet = new Net.Network(in_size, out_size);
      this.units[s] = seedNet.esSpawn(optimConfigs.esStdDev, optimConfigs.unitsPerSpecies);
    }
    this.mutateTopology(optimConfigs.mutationRateInital);
  }
  // mutRate - mutation rate
  mutateTopology(mutRate){
    // Valid random edge
    function randEdge(n, novel=false){
      var availableNodesFrom = [];
      var availableNodesTo = [];
      for(var nodeID in n.nodes){
        availableNodesFrom.push(Number(nodeID));
        availableNodesTo.push(Number(nodeID));
      }

      var inpudIds = utils.arrMap(n.inputNodes, x => x.id);
      availableNodesTo = utils.arrDiff(availableNodesTo, inpudIds);

      var outIds = utils.arrMap(n.outputNodes, x => x.id)
      availableNodesFrom = utils.arrDiff(availableNodesFrom, outIds);

      var novelEdges = [];
      if(novel){
        for (var af in availableNodesFrom){
          for(var at in availableNodesTo){
            if (!af in n.edges){novelEdges.push([af, at])}
            else{
              if(!at in n.edges[af]){novelEdges.push([n.nodes[af], n.nodes[at]])}
            }
          }
        }
        if (novelEdges.length > 0){
          var novelEdge = novelEdges[Math.floor(Math.random()*novelEdges.length)];
          return novelEdge
        } else{return []}
      }

      var from = availableNodesFrom[Math.floor(Math.random()*availableNodesFrom.length)],
          to = availableNodesTo[Math.floor(Math.random()*availableNodesTo.length)];


      return [n.nodes[from], n.nodes[to]];
    }

    for(var s=0; s<optimConfigs.num_species; s++){
      for (var u=0; u<optimConfigs.unitsPerSpecies; u++){
        //console.log("mutate?");
        if(Math.random() < mutRate){
          //console.log("mutate!");
          // New Node .5 chance
          if(Boolean(Math.round(Math.random()))){
            //console.log('species ->', s, 'unit ->', u, 'obj ->', this.units[s][u]);
            var from, to, type;
            var foundExistingEdge = false;
            while(!foundExistingEdge){
              [from, to] = randEdge(this.units[s][u]);
              if (from.id in this.units[s][u].edges){
                if(to.id in this.units[s][u].edges[from.id]){foundExistingEdge = true;}
              }
            }

            type = utils.randElem(Net.activationTypes);
            this.units[s][u].insertNode(from, to, type);
          }
          // New Edge .5 chance
          else{
            /*var from, to, type;
            var rEdge = randEdge(this.units[s][u], true);
            if (rEdge.length === 0){console.log('All possible edges are occupied');}
            else {
              [from, to] = rEdge;
              this.units[s][u].insertEdge(from, to);
            }*/
          }

          mutated.push(this.units[s][u]);
        }
      }
    }
  }
  evolve(){
    cleanupStep();
    this.currentGen++;
  }
}
