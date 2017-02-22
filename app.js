var multiparty = require('multiparty'),
bodyParser = require("body-parser"),
methodOverride = require("method-override"),
mongoose       = require("mongoose"),
Email = require("./models/email"),
express        = require("express"),
app            = express();
    
    
// APP CONFIG
mongoose.connect("mongodb://agentaiapp:agentaiapp123@ds035270.mlab.com:35270/agentai");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
 
app.post("/email", function(req, res){
    //console.log(req.body);
    //console.log(req.query);
  var form = new multiparty.Form();
  form.parse(req, function(err, fields, files) {
      
      if(err){
        console.log(err);
      } else {

        var from = fields["from"][0];
        if (from.indexOf("<")){
            from = from.slice(from.indexOf("<")+1,from.indexOf(">"));
        }                
        var to = fields["to"][0];
        if (to.indexOf("<")){
            to = to.slice(to.indexOf("<")+1,to.indexOf(">"));
        }                
        var text = fields["text"][0];
        var subject = fields["subject"][0];
        var html = fields["html"][0];

        var mail = new Email({from: from, to: to, subject: subject, text: text, html:html});
        Email.create(mail, function(err, newlyCreated){
            if (err) {
                console.log(err);
            } else {
                console.log("successfully saved to email queue");
                console.log(mail);
            }
        });
        res.writeHead(200, {'content-type': 'text/plain'});
        res.write('received upload:\n\n');
        res.end("thanks");          
      }
  });
});

app.listen(process.env.PORT, process.env.IP, function(){
    console.log("email parser is on!");
});



