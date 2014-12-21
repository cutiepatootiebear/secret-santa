var express       = require('express')
var bodyParser    = require('body-parser')
var SantaSelector = require('./select-santa.js');
var Mandrill      = require('./mandrill.js');
// var mandrill = require('mandrill-api/mandrill'); 
// var mandrill_client = new mandrill.Mandrill('Z-72jAyAFPIYUJnbEfzISQ');

var app = express();

// for parsing application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// Set port, heroku style
// Run locally: foreman start web
app.set('port', (process.env.PORT || 5000)); 

// express.static middleware
app.use(express.static(__dirname + '/public'));

// ejs will provide a renderFile method w this signature: (path, options, callback)
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('index.html');
});

app.post('/submit', function(request, response) {
  var namesEmailArray = request.body.peeps.split(","); // ["name1:email1", "name2:email2"]
  var contactBook = {}; // {"name1":"email1", "name2":"email2"}
  var namesOnly = []; // ["name1", "name2"]
  for (person in namesEmailArray) {
    var parts = namesEmailArray[person].split(":");
    var name  = parts[0];
    var email = parts[1];
    namesOnly.push(name);
    contactBook[name] = email;
  }

  var ss = new SantaSelector(namesOnly);
  var santaToChild = ss.validDraw();
  var md = new Mandrill(santaToChild, contactBook);  
  var mandrillResponse = md.sendEmails();

  response.send(mandrillResponse)
  
});

app.listen(app.get('port'), function() {
  console.log('Secret santa app is running at localhost:' + app.get('post'));
});

