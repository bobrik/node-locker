(function(module) {
    var util   = require("util"),
        events = require("events");

    function Lock(name, sequence, acquirer, releaser) {
        this.name         = name;
        this.sequence     = sequence;
        this.acquirer     = acquirer;
        this.releaser     = releaser;
        this.acquired     = false;
        this.waitTimer    = undefined;
        this.releaseTimer = undefined;
    };

    util.inherits(Lock, events.EventEmitter);

    Lock.prototype.acquire = function(wait, timeout, callback) {
        var self = this;

        self.waitTimer = setTimeout(function() {
            var error;

            if (!self.acquired) {
                error = new Error("Timeout waiting for lock");

                callback(error);
                self.emit("error", error);
            }

            clearTimeout(self.waitTimer);
            self.waitTimer = undefined;
        }, wait);

        self.acquirer(self.name, self.sequence, wait, timeout, function(error) {
            if (self.waitTimer) {
                clearTimeout(self.waitTimer);
                self.waitTimer = undefined;
            } else {
                // already finished
                return;
            }

            if (error) {
                return callback(error);
            }

            self.acquired = true;

            self.releaseTimer = setTimeout(function() {
                if (self.acquired) {
                    self.emit("error", new Error("Lock timeout (" + timeout + ") exceed: " + self.name));
                }

                clearTimeout(self.releaseTimer);
                self.releaseTimer = undefined;
            }, timeout);

            callback();
        });
    };

    Lock.prototype.release = function(callback) {
        var self  = this,
            error = undefined;

        if (!callback) {
            callback = function() {};
        }

        if (self.releaseTimer) {
            clearTimeout(self.releaseTimer);
            self.releaseTimer = undefined;
        }

        if (!self.acquired) {
            error = new Error("Releasing lock that was not acquired or reset: " + self.name);

            self.emit("error", error);
            return;
        }

        self.acquired = false;

        self.releaser(self.sequence, function(error) {
            if (error) {
                self.emit(error);
            }
        });

        callback();
    };

    Lock.prototype.reset = function() {
        this.acquired = false;
    };

    module.exports = Lock;
})(module);
