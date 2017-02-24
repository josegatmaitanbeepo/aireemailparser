var multiparty = require('multiparty'),
bodyParser = require("body-parser"),
methodOverride = require("method-override"),
mongoose       = require("mongoose"),
Email = require("./models/email"),
express        = require("express"),
request = require("request"),
app            = express();
    
    
// APP CONFIG
mongoose.connect("mongodb://agentaiapp:agentaiapp123@ds035270.mlab.com:35270/agentai");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

app.get("/", function(req,res) {
    res.send("the email server is up and running");
});
 
app.post("/email", function(req, res){
    //console.log(req.body);
    //console.log(req.query);
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
      
      if(err){
        console.log(err);
      } else {
        
        var text = "";
        if (fields["text"]) {
          text = fields["text"][0];
        } 
        var html = "";
        if (fields["html"]) {
          html = fields["html"][0];
        }
        var from = fields["from"][0];
        if (from.indexOf("<")){
            from = from.slice(from.indexOf("<")+1,from.indexOf(">")+1);
        }                
        var to = fields["to"][0];
        if (to.indexOf("<")){
            to = to.slice(to.indexOf("<")+1,to.indexOf(">")+1);
        }      
        var subject = "";
        subject = fields["subject"][0];


        var mail = new Email({from: from, to: to, subject: subject, text: text, html:html, jsonPayload: JSON.stringify(fields)});
        var mailJson = {"from": from, "to": to, "subject": subject, "message": text, "html":html};
        Email.create(mail, function(err, newlyCreated){
            if (err) {
                console.log(err);
            } else {
                console.log("successfully saved to email queue");
                console.log(mail);
                //call the main app api
                var options = {
                  uri: 'https://lit-forest-43973.herokuapp.com/conversation',
                  method: 'POST',
                  json: true,   
                  body: mailJson
                };
    
                request(options, function (error, response, body) {
                  if (error) {
                    console.log(err);
                  }
                  console.log("Response from main app:" + response);
                  console.log("Body from main app:" + body);
                });                
             
            }
        });
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end("thanks");          
      }
  });
});

//events
app.post('/event', function (req, res) {
  var events = req.body;
  events.forEach(function (event) {
    // Here, you now have each event and can process them how you like
    //console.log(event);
  });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("email parser is on!");
});



