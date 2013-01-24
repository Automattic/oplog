
# oplog

  MongoDB Oplog tailing DSL.

## How to use

```js
var oplog = require('oplog')('localhost:27017/local');
oplog.query({ i: /u|d/ });
oplog.filter()
  .ns('*.users')
  .on('update', function(){ });
  .on('remove', function(){ });
oplog.tail();
```

## API

### Oplog

  - Represents an unique connection to the mongodb host to tail.
  - Emits `op` event for each operation read with an object.

### Oplog(db:Manager)

  Builds the tailer based on an existing `monk` instance.

### Oplog(uri:String)

  Builds the tailer by connecting to the given mongodb uri.

### Oplog#type(type:String)

  - Accepts `rs` and `local`
  - Defaults to `rs` if connected to multiple hosts, or `local` otherwise.
  - If the defaults are not suitable, it needs to be called, otherwise
    `oplog` can't decide whether to tail the `oplog.$main` or `oplog.rs`
    collections.

### Oplog#query(obj:Object)

  - Sets the query by which to tail.
  - Defaults to `{ ts: { $gt: { $timestamp: { t: <now>, i: 0 } } } }`

### Oplog#filter

  Creates a new `Filter`.

### Oplog#tail

  - Starts the query and grabs the tailable cursor.
  - Must be called to get events firing.

### Oplog#destroy

  - Kills the cursor.

### Filter

  - Multiple filters can be declared per `oplog`.
  - Emits `update`, `remove`, `insert` events with each operation.

### Filter#ns(ns:String)

  Only emits the events for namespaces matching `ns` pattern.

### Filter#db(db:String)

  Shortcut for `.ns('{db}.*')`.

### Filter#col(col:String)

  Shortcut for `.ns('*.{col}')`.

## Compatibiltiy

  oplog must be used with mongodb 2.2.2+

## Running tests

Make sure to be running a replica set (which can be single-member)
before executing

```
$ make test
```
