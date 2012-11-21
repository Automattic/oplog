
/**
 * Module dependencies.
 */

var wildcard = require('wildcard')
  , events = require('./events')
  , EventEmitter = require('events').EventEmitter;

/**
 * Module exports.
 */

module.exports = Filter;

/**
 * Filter.
 *
 * @param {Oplog} oplog instance
 * @api public
 */

function Filter(oplog){
  this.oplog = oplog;
  this.oplog.on('op', this.op.bind(this));
}

/**
 * Inherits from `EventEmitter`.
 */

Filter.prototype.__proto__ = EventEmitter.prototype;

/**
 * Processes an operation.
 *
 * @param {Object} doc
 * @api private
 */

Filter.prototype.op = function(doc){
  if (!this._ns || this._ns.match(doc.ns)) {
    // we emit the same events as oplog
    this.emit('op', doc);
    this.emit(events[doc.op], doc);
  }
};

/**
 * Sets a `ns` to filter by.
 *
 * @param {String} ns name or pattern
 * @return {Filter} for chaining
 * @api public
 */

Filter.prototype.ns = function(ns){
  this._ns = wildcard(ns);
  return this;
};

/**
 * Filters by `db`.
 *
 * @param {String} db name
 * @return {Filter} for chaining
 * @api public
 */

Filter.prototype.db = function(db){
  this.ns(db + '.*');
  return this;
};

/**
 * Filters by `col`.
 *
 * @param {String} col name
 * @return {Filter} for chaining
 * @api public
 */

Filter.prototype.col = function(col){
  this.ns('*.' + col);
  return this;
};
