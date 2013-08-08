/* Copyright (c) 2013 Yahoo! Inc. All rights reserved.
Copyrights licensed under the MIT License. See the accompanying LICENSE file for terms. */

mockXhr = function() {
    var ogXhr = XMLHttpRequest,
        Mock = function(opts){
            var self = this;
            opts = opts || {};
            self.headers = {};
            self.responseHeaders = {};
            self.method = 'GET';
            self.time = opts.responseTime || 0;
            self.timer = null;
        };
    
    Mock.prototype = {
        abort: function(){
            clearTimeout(this.timer);
        },
        getAllResponseHeaders: function(){
            var self = this,
                headerText = '';
            for(header in self.responseHeaders) {
                headerText += (headerText ? '\n' : '') + header + ': ' + self.responseHeaders[header];
            }
            return headerText;
        },
        getResponseHeader: function(name){
            return this.responseHeaders[name];
        },
        onload: function(){},
        onreadystatechange: function(){},
        open: function(method, url){
            this.method = method;
        },
        readyState: 4,
        responseText: '',
        send: function(data){
            var self = this;
            self.data= data;
            setTimeout(function(){
                self.onreadystatechange();
            }, self.timer);
        },
        setRequestHeader: function(key, val){
            this.headers[key] = val;
        },
        status: 200,
        statusText: '200 Ok'
    };
    
    return {
        setup: function(){
            XMLHttpRequest = Mock;
        },
        teardown: function(){
            XMLHttpRequest = ogXhr;
        }
    }
}();

