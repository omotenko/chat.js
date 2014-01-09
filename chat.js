
 var clients = [];

 exports.publish = function(message) {
    console.log('publish');

     clients.forEach(function(res) {
         res.end(message);
     });
     clients = [];
 }

 exports.subscribe = function(req, res) {
    console.log('subscribe');

     res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
     clients.push(res);
     res.on('close', function() {
        clients.splice(clients.indexOf(res), 1);
     })
 }

 setInterval(function() {
     console.log(clients.length);
 }, 2000)