import * as Net from "./network"
import * as NetVis from "./visual"

function XOR(b1, b2){
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

function testInsertNode(from, to){
  var n1 = n.nodes[from];
  var n2 = n.nodes[to];
  n.insertNode(n1, n2,'relu');
  console.log('Inserted node from ' + from + ' to ' + to);
  NetVis.diGraph("digraphDiv", n);
  console.log(n.forward([0.315,-0.6642]));
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
}
function testTO(){
  // TO - Timeout
  console.log(n);
  var out2, out3;
  out2 = n.nodes['4'].valuePrev()*n.edges['4']['2'].weight+
         n.nodes['0'].valuePrev()*n.edges['0']['2'].weight+
         n.nodes['1'].valuePrev()*n.edges['6']['2'].weight;

  out3 = n.nodes['0'].valuePrev()*n.edges['0']['3'].weight+
         n.nodes['4'].valuePrev()*n.edges['4']['3'].weight+
         n.nodes['1'].valuePrev()*n.edges['1']['3'].weight+
         n.nodes['1'].valuePrev()*n.edges['5']['3'].weight;
  // Manual forward
  console.log("Manual Forward test: ",[out2, out3]);

}


setTimeout(function(){testInsertNode('1','2')}, 5000);
setTimeout(function(){testInsertNode('5','2')}, 10000);
setTimeout(function(){testInsertEdge('5','3')}, 15000);
setTimeout(testTO, 15010);
