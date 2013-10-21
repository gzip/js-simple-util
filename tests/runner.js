// https://github.com/ariya/phantomjs/wiki/API-Reference-WebPage
// npm i -g phantomjs; phantomjs runner.js

var status = 0,
    page = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log(msg);
    // exit once total has been logged
    if (msg.match('TOTAL: ')) {
        phantom.exit(status);
    }
    // change status to non-zero if fail was logged
    if (msg.match('FAIL: ')) {
        status = 1;
    }
}

page.onInitialized = function() {
    page.evaluate(function() {
        window.isPhantom = true;
    });
};

page.onLoadFinished = function(status) {
    if (status !== 'success') {
        console.log('Unable to open test html');
        phantom.exit(1);
    } else {
        page.evaluate(function() {
            console.log('Starting tests...');

            var passed = 0,
                failed = 0,
                runner = mocha.run();

            runner.on('pass', function(test) {
                passed++;
                console.log('PASS: ' + test.fullTitle());
            });

            runner.on('fail', function(test, err) {
                failed++;
                console.log('FAIL: ' + test.fullTitle() + ':: ' + err.message);
            });

            runner.on('end', function() {
                console.log('TOTAL: ' + (passed + failed) + ', PASSED: ' + passed + ', FAILED: ' + failed);
            });
        });
    }
};

page.open('./index.html');
