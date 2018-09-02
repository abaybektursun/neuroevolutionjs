import * as Net from "./NE/network"
//import * as NetTest from "./NE/tests"
import * as Train from "./train"
import * as NetVis from "./NE/visual"

var $;
$ = require('jquery');

if (typeof(Storage) !== "undefined") {
    console.log("Storage is supported");
    Train.run(3);
} else {
    console.log("You browser does not support local storage. Please update your browser");
}
