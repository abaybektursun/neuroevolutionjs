onmessage = function(in_e) {
  e = in_e.data;
  console.log('Message received from main script');
  var sqrtSum = 0;
  for(var i=0; i<e; i++){sqrtSum+=Math.sqrt(666)}
  console.log('Posting message back to main script');
  postMessage(sqrtSum);
}
