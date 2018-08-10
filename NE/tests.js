import * as Net from "./network"
import * as NetVis from "./visual"

function XOR(b1, b2){
  return b1 ? !b2 : b2;
}


// Test 1
const n = new Net.Network(2,2);
console.log(n);
/*const n2 = new Net.Network(5,2);
console.log(n2);
const n3 = new Net.Network(3,4);
console.log(n3);*/

NetVis.diGraph("digraph", n);

console.log(
  n.forward([0.315,-0.6642])
);
