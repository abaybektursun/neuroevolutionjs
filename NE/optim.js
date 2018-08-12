import * as Net from "./network"

export function cleanup(){
  Net.globalIDs.edges = {};
  Net.globalIDs.nodes = {};
}

function step(){
  cleanup();
}
