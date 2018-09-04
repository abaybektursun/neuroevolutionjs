import * as Net from "./NE/network"
//import * as NetTest from "./NE/tests"
import * as Train from "./train"
import * as NetVis from "./NE/visual"

var $;
$ = require('jquery');

var storageSupport = (typeof(Storage) !== "undefined");
var webWorkerSupport = (typeof(Worker) !== "undefined");


function main(){

  $('#train').on('click',function() {
      $(this).prop("disabled",true);
      Train.train_one_gen();
  });
  
}


if (storageSupport && webWorkerSupport) {
  main()
}else{
  //Code to let the user know that browser is not supported
}
