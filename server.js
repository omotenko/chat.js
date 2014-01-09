/**
 * Created by Motenko on 18.11.13.
 */
var http = require('http');
var url = require('url');
var path = require('path');
var fs = require('fs');
var chat = require('./chat.js');

var ROOT = __dirname;
var server = http.createServer(function(req, res) {
    switch (req.url) {

        case '/':
            sendFileSafe('index.html', res);
            break;

        case '/publish':
            var body = '';
            req
                .on('readable', function() {
                    body += req.read();
                    if (body.length > 1e4) {
                        res.statusCode = 413;
                        res.end('You message is to big.');
                    }
                })
                .on('end', function() {
                    try{
                        body = JSON.parse(body);
                    }catch (e) {
                        res.statusCode = 400;
                        res.end('Bad request');
                        return;
                    }
                    chat.publish(body.message);
                    res.end();
                })
            break;

        case '/subscribe':
            chat.subscribe(req, res);
            break;

        default :
            res.statusCode = 404;
            res.end('Page not found');
   }
}).listen('3001');

console.log('Server is running');

/*if (!checkAccess(req)) {
 res.statusCode = 403;
 res.end("You haven't access to this page");
 }
 sendFileSafe(url.parse(req.url).pathname, res);*/
function checkAccess(req) {
    return url.parse(req.url, true).query.index == 1;
}
function sendFileSafe(filepath, res) {
    try {
        filepath = decodeURIComponent(filepath);
    }catch (e) {
        res.statusCode = 400;
        res.end('Bad Request');
    }

    if (~filepath.indexOf('\0')) {
        res.statusCode = 400;
        res.end('Bad Request');
    }

    filepath = path.normalize(path.join(ROOT, filepath));

    fs.stat(filepath, function(err, stats) {
        if (err || !stats.isFile()) {
            res.statusCode = 404;
            res.end('File not found');

            return;
        }
    })
    console.log(filepath);
    var file = fs.createReadStream(filepath);
    sendFile(file, res);

}
function sendFile(file, res) {
    file.pipe(res);
  /* file.on('readable', write);
    function write() {
        var fileContent = file.read();

        if (fileContent && !res.write(fileContent)) {
            file.removeListener('readable',write);
            res.once('drain', function() {
                file.on('readable', write);
                write();
            })
        }
    }*/
   file.on('end', function () {
       res.end();
   });

    res.on('close',function() {
        file.destroy();
    })
}
