/**
 * Example dataset
 */
var procedures = {Dentures: 50, Pulling: 100, "Root Canal": 500, GoldTooth: 20, Cavity: 30, Nicegrill: 1000, Cleaning: 5};
var p = new Array();
var proc_map = new Array();
p.push(0); // Helps build the memoization table
for(var proc in procedures) {
  p.push(procedures[proc]);
  proc_map.push(proc);
}
var W = 76;
//var p = {1:2, 2:2, 3:3};

function subsetSum(W, p) {
  //Start Init
  console.log(W);
  var m = new Array();
  for( var i = 0; i<=p.length; i++) {
    m[i] = new Array();
    for( var w = 0; w<=W; w++) {
      m[i][w] = 0;
    }
  }
  //End Init
 
  for( var i = 1; i<=p.length; i++) {
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

//var M = subsetSum(W, p);
var O = new Array();
function findSolution(i, w, M) {
  if(i==0) {
    return O;
  } else if(M[i][w] > M[i-1][w]) {
    $('#purchased').append('<span class="badge">'+proc_map[i-1]+': $'+p[i]+'</span>');
    O.push(i);
    a = M[i-1][w];
    b = p[i] + M[i-1][w-p[i]];
    a>b?findSolution(i-1,w,M):findSolution(i-1,w-p[i],M);
  } else {
    findSolution(i-1,w,M);
  }
}

function max(a, b) {
  return a>b ? a : b;
}

$().ready(function() {
  for(var i=1; i<p.length; i++) {
    $('#procedures').append('<span class="badge">'+proc_map[i-1]+': $'+p[i]+'</span>');
  }
});
