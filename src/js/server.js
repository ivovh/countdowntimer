var sslRedirect = require('heroku-ssl-redirect');
var express = require('express');
var app = express();

app.set('port', (process.env.PORT || 5000));

app.use(sslRedirect());

app.use(express.static(__dirname + '/../../public'));
console.log('Static dir = ', __dirname + '/../../public');

app.get('/', function(request, response) {
  response.redirect('/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


