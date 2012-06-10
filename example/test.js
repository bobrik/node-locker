(function() {
    var Locker    = require("./../index"),
        locker    = new Locker(4545, "127.0.0.1"),
        name      = "five",
        wait      = 1500,
        timeout   = 200,
        work      = 190,
        requests  = 10,
        iteration = 0;

    console.log("Setting up reset listener");
    locker.on("reset", function() {
        console.log("Reset happened (is server running?)");
    });

    console.log("Setting up errror listener");
    locker.on("error", function(error) {
        console.log("Catched error:", error);
    });

    function testLock() {
        var started = new Date().getTime(),
            current = iteration;

        locker.locked(name, wait, timeout, function(error, callback) {
            var acquired = new Date().getTime();

            if (error) {
                console.log("[" + current + "] Lock failed after " + (acquired - started) + "ms of waiting");
            } else {
                console.log("[" + current + "] Successful lock after " + (acquired - started) + "ms of waiting");
            }

            if (!error) {
                setTimeout(function() {
                    callback();
                }, work);
            }
        });
    };

    console.log();
    console.log("Starting test:");
    console.log("                 key: " + name);
    console.log("           wait time: " + wait + "ms");
    console.log("        lock timeout: " + timeout + "ms");
    console.log("     time under lock: " + work + "ms");
    console.log("time to release lock: " + (timeout - work) + "ms (up to)");
    console.log("  amount of requests: " + requests);
    console.log();

    for (; iteration < requests; iteration++) {
        testLock();
    }

    console.log("Lock requests finished, waiting to end.");
    console.log()
})();
