var express = require('express');
var app = express();
app.set('port', (process.env.PORT || 5000));

var https_redirect_on_heroku = function(req, res, next) {
  if (process.env.NODE_ENV === 'production') {
    if (req.headers['x-forwarded-proto'] != 'https') {
      return res.redirect('https://' + req.headers.host + req.url);
    } else {
      return next();
    }
  } else {
    return next();
  }
};

app.use(https_redirect_on_heroku);

app.use(express.static(__dirname + '/../../public'));
console.log('Static dir = ', __dirname + '/../../public');

app.get('/', function(request, response) {
  response.redirect('/index.html');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});


