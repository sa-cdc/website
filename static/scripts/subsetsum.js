/**
 * Given a set of procedures and costs, P, and an amount, W,
 * find the optimal subset of P that is as close to W as
 * possible without going over W.
 * 
 */
/*
var P = {Dentures: 50, Pulling: 100, "Root Canal": 500, GoldTooth: 20, Cavity: 30, Nicegrill: 1000, Cleaning: 5};
var W = 10999;

console.log(runSubset(P, W));
*/

/**
 * Determines the frequency of each procedure that sums to a value <= W, as
 * close to W as possible.
 * returns an array of label, value, freq that maximizes toward W
 */
function runSubset(P,W) {
  var map = mapProceduresToValues(P);
  var out = subsetSumSoln(map['value'],W);
  var bins = frequency(out);

  var result = new Array();
  for(v in bins) {
    var set = new Object();
    set['label'] = map['label'][v];
    set['value'] = map['value'][v];
    set['freq'] = bins[v];
    result.push(set);
  }
  return result;
}

function frequency(subset) {
  var freq = new Array();
  while(subset.length > 0) {
    var bin = subset.pop();
    typeof freq[''+bin] === 'undefined'?freq[''+bin]=1:freq['',bin]++;
  }
  return freq;
}


function subsetSumSoln (P, W) {
  var solution = new Array(); 
  var M;
  var x;
  var y;
  var total;
  do {
    M = subsetSum(W, P);
    x = M.length-1;
    y = M[0].length-1;
    total = M[x][y];
    solution = solution.concat(findSolution(P.length-1, W, M, P, null));
    W = W - total;
  } while(total > 0);
  return solution;
}

/**
 * Given P, a set of procedures and costs, map an integer to each procedure
 * name.
 * Examples:
 * p = {1:2, 2:2, 3:3};
 */
function mapProceduresToValues (P) {
  var int_map = new Array();
  var label_map = new Array();
  int_map.push(0); // zero index for the memoization table
  label_map.push(0); // zero index for the memoization table
  for(var label in P) {
    int_map.push(P[label]);
    label_map.push(label);
  }
  
  mapping = new Array();
  mapping['value'] = int_map;
  mapping['label'] = label_map;
  return mapping;
}

function initMemoization(len_p,W) {
  var m = new Array();
  for( var i = 0; i<len_p; i++) {
    m[i] = new Array();
    for( var w = 0; w<=W; w++) {
      m[i][w] = 0;
    }
  }
  return m;
}

function subsetSum(W, p) {
  var m = initMemoization(p.length,W);
 
  for( var i = 1; i<p.length; i++) {
    for( var w = 1; w<=W; w++) {
      if(w < p[i]){
        m[i][w] = m[i-1][w];
      } else{
        m[i][w] = max(m[i-1][w],p[i]+m[i-1][w-p[i]]);
      }
    }
  }
  return m;
}

function findSolution(i, w, M, p, out) {
  var out = out || new Array();
  if(i==0) {
    return out;
  } else if(M[i][w] > M[i-1][w]) {
    out.push(i);
    a = M[i-1][w];
    b = p[i] + M[i-1][w-p[i]];
    return a>b?findSolution(i-1,w,M,p, out):findSolution(i-1,w-p[i],M,p, out);
  } else {
    return findSolution(i-1,w,M,p, out);
  }
}

function max(a, b) {
  return a>b ? a : b;
}
