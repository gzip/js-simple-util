var status = 0,
    page = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log(msg);
    // exit once total has been logged
    if (msg.match('TOTAL')) {
        phantom.exit(status);
    }
    // change status to non-zero if fail was logged
    if (msg.match('FAIL')) {
        status = 1;
    }
}

page.onLoadFinished = function(status) {
    if (status !== 'success') {
        console.log('Unable to open test html');
        phantom.exit(1);
    }
};

page.open('./index.html');

