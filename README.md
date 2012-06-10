node-locker - full-featured client for [locker](https://github.com/bobrik/locker) lock server
===========================

Allows to lock common resources across servers with sub-second precision in node.js in async way.

## Installation

Check out [locker server](https://github.com/bobrik/locker) page for server installation instructions.

```
npm install locker
```

## Example

```javascript
var Locker = require("locker"),
    locker = new Locker(4545, "127.0.0.1");

locker.on("reset", function() {
    console.log("Reset happened (is server running?)");
});

locker.on("error", function(error) {
    console.log("Catched error:", error);
});

//            name    wait  max   callback
locker.locked("five", 2000, 3000, function(error, callback) {
    if (error) {
        // lock failed
        callback(error);
        return;
    }

    // do whatever you want with your shared resource

    callback(undefined, {well: "done"});
});
```

## API

* Requiring

```javascript
var Locker = require("Locker");
```

* New connection

```javascript
var locker = new Locker(port, host);
```

* Locking resource

```javascript
locker.locked(identifier, lock_wait_time, max_execution_time, callback)
```

`callback` signature:

```javascript
function(error, next) {}
```

In `callback` you will be exclusive owner of resource with name `identifier` if there is no `error` argument.

After doing exclusive stuff you should release lock by calling `next` callback.

### Events

* `reset` — connection was reset and all locks were gone.
* `error` - error occurred on some of connection locks (timeout exceed for waiting or execution time)
