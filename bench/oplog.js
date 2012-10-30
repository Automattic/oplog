
var oplog = require('..')();
var monk = require('monk')('localhost/test').get('woot');
var assert = require('assert');

var i = 0;

function insert(fn){
  var a = i++;
  monk.insert({ count: a });
  oplog.once('insert', function(obj){
    assert(obj.o.count == a);
    fn();
  });
}

var total = 1000;
var pts = [];

function query(){
  var then = Date.now();
  insert(function(){
    var lat = Date.now() - then;
    console.log('%dms', lat);
    pts.push(lat);
    if (--total) query();
    else finish();
  });
}

function finish(){
  console.log('finished 1000 entries');
  process.exit();
}

oplog.tail();
oplog.once('insert', function(){
  query();
});
monk.insert({ a: 'b' }); // start!
