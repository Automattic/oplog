
/**
 * Module dependencies.
 */

var monk = require('monk')
  , Filter = require('./filter')
  , Timestamp = require('bson').Timestamp
  , EventEmitter = require('events').EventEmitter
  , events = require('./events')
  , debug = require('debug')('oplog');

/**
 * Module exports
 */

module.exports = Oplog;

/**
 * Oplog constructor.
 *
 * @param {String|monk.Manager} db uri / instance
 * @api public
 */

function Oplog(db){
  if (!(this instanceof Oplog)) return new Oplog(db);

  this.flts = [];
  this.db = db;
  if ('object' != typeof db) {
    this.db = monk(db || '127.0.0.1:27017/local');
  }

  var qry = { ts: {} };
  var now = Date.now() / 1000;
  qry.ts = { $gte: new Timestamp(0, now) };
  this.qry = qry;
}

/**
 * Inherits from `EventEmitter`.
 */

Oplog.prototype.__proto__ = EventEmitter.prototype;

/**
 * Sets the query.
 *
 * @return {Oplog} for chaining
 * @api public
 */

Oplog.prototype.query = function(qry){
  debug('setting query to %j', qry);
  this.qry = qry;
  return this;
};

/**
 * Creates a new filter.
 *
 * @return {Filter} new filter
 * @api public
 */

Oplog.prototype.filter = function(){
  var filter = new Filter(this);
  this.flts.push(filter);
  return filter;
};

/**
 * Starts tailing.
 *
 * @return {Oplog} for chaining
 * @api public
 */

Oplog.prototype.tail = function(){
  debug('tailing oplog with %j', this.qry);
  this.readyState = 'open';
  var col = this.db.get('oplog.rs');
  var opt = {
    tailable: true,
    awaitdata: true,
    timeout: false,
    numberOfRetries: -1
  };
  var cur = col
  .find(this.qry, opt)
  .each(this.op.bind(this))
  .error(this.err.bind(this))
  .success(this.success.bind(this));
  this.cur = cur;
};

/**
 * Called upon an operation.
 *
 * @param {Object} doc
 * @api private
 */

Oplog.prototype.op = function(doc){
  this.query({ ts: { $gt: doc.ts } });
  this.emit('op', doc);
  this.emit(events[doc.op], doc);
};

/**
 * Handles error `err`.
 *
 * @param {Error} err
 * @api private
 */

Oplog.prototype.err = function(err){
  if (!err || !err.stack) {
    // handle weird -native errors
    throw new Error('Unknown error:' + err);
  } else if (/cursor timed out/.test(err.message)) {
    debug('cursor timeout - re-tailing', err.stack);
    this.tail();
  } else {
    debug('unknown error occurred', err.stack);
    this.readyState = 'error';
    this.emit('error', err);
  }
};

/**
 * Called upon cursor success.
 *
 * @api private
 */

Oplog.prototype.success = function(){
  if ('closed' != this.readyState) {
    // if the cursor timed out reopen
    this.tail();
  }
};

/**
 * Destroys the cursor.
 *
 * @return {Oplog} for chaining
 * @api public
 */

Oplog.prototype.destroy = function(){
  this.readyState = 'closed';
  this.cur.destroy();
  return this;
};
