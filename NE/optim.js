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
  mutationRate: 0.02,
  mutationRateInital:0.05,
  esStdDev: 0.2,
  unitsPerSpecies: 100,
  num_species: 10,
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
      // TODO: Uncomment this? Few best in the species need to survive?
      //this.speciesBest.push([]);

      var seedNet = new Net.Network(in_size, out_size);
      this.units[s] = seedNet.esSpawn(optimConfigs.esStdDev, optimConfigs.unitsPerSpecies);

      this.speciesBest.push(this.units[s][0]);

    }
    this.mutateTopology(optimConfigs.mutationRateInital);
  }
  // mutRate - mutation rate
  mutateTopology(mutRate, species){
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
            var nIDfrom = availableNodesFrom[af];
            var nIDto = availableNodesTo[at];
            if (!(nIDfrom in n.edges)){novelEdges.push([nIDfrom, nIDto])}
            else{
              try{
                if(!(nIDto in n.edges[nIDfrom])){novelEdges.push([n.nodes[nIDfrom], n.nodes[nIDto]]);}
              }
              catch(err){throw new Error(err);}
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

    function mutateSpecies(self, s){
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
              [from, to] = randEdge(self.units[s][u]);
              if (from.id in self.units[s][u].edges){
                if(to.id in self.units[s][u].edges[from.id]){foundExistingEdge = true;}
              }
            }

            type = utils.randElem(Net.activationTypes);
            self.units[s][u].insertNode(from, to, type);
          }
          // New Edge .5 chance
          else{
            var from, to, type;
            var rEdge = randEdge(self.units[s][u], true);
            if (rEdge.length === 0){console.log('All possible edges are occupied');}
            else {
              [from, to] = rEdge;
              self.units[s][u].insertEdge(from, to);
            }
          }

          //mutated.push(self.units[s][u]);
        }
      }
    }

    if (species === undefined){
      for(var s=0; s<optimConfigs.num_species; s++){
        mutateSpecies(this, s);
      }
    }
    else{
      mutateSpecies(this, species);
    }

  }

  evolve(){
    cleanupStep();
    this.currentGen++;
  }
}
