import * as Net from "./NE/network"
//import * as NetTest from "./NE/tests"
import * as Train from "./train"
import * as NetVis from "./NE/visual"

if (typeof(Storage) !== "undefined") {
    console.log("Storage is supported");
    Train.run(20);
} else {
    console.log("You browser does not support local storage. Please update your browser");
}
