export function randElem(arrIn){
  var randIdx = Math.floor(Math.random()*arrIn.length);
  return arrIn[randIdx];
}

export function arrIncludes(arrIn, elem){
  for(var i in arrIn){
    if (arrIn[i] === elem){
      return true;
    }
  }
  return false;
}


// Removes 'arr' from 'from'
export function arrDiff(from, arrRem) {
    var newArr = [];
    for(var i in from){
      if(!arrIncludes(arrRem, from[i])) {
        newArr.push(from[i]);
      }
    }
    return newArr;
}

export function arrMap(arrIn, f){
  var newArr = [];
  for(var i in arrIn){
    newArr.push(f(arrIn[i]));
  }
  return newArr;
}

export function copyObj(obIn){
  return Object.assign( Object.create( Object.getPrototypeOf(obIn)), obIn);
}

export function indexOfNodeByID(arrOfNodes, node){
  for(var i in arrOfNodes){
    if(arrOfNodes[i].id == node.id){return Number(i)}
  }
  console.log('Could not find the node in the given arrOfNodes');
  return -1
}
