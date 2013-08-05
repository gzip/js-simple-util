var page = require('webpage').create();
page.open('./index.html', function (status) {
    if (status !== 'success') {
        console.log('Unable to open test html');
    } else {
        //console.log(page.content);
    }
    phantom.exit();
});
