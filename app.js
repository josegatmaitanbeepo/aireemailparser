var multiparty = require('multiparty'),
bodyParser = require("body-parser"),
methodOverride = require("method-override"),
mongoose       = require("mongoose"),
Email = require("./models/email"),
express        = require("express"),
request = require("request"),
app            = express();


// Function Defenitions

	var retMessageID = function(str) {
		return str.substring(str.lastIndexOf("<")+1, str.lastIndexOf(">"))
	};	
		
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
		console.log(req.body);
		console.log(req.query);

		var form = new multiparty.Form();

		form.parse(req, function(err, fields, files) {
			if (err) {
				console.log(err);
			}
			else {

				// console.log(JSON.stringify(fields));
				// console.log(JSON.stringify(files));

				var msgID = retMessageID(fields["headers"][0]);

				console.log(msgID);
				
				var text = "";
				if (fields["text"]) {
					text = fields["text"][0];
				} 
				var html = "";
				if (fields["html"]) {
					html = fields["html"][0];
				}
				var subject = "";
				if (fields["subject"]) {
					subject = fields["subject"][0];
				}
				var from = fields["from"][0];
				if (from.indexOf("<") > 0){
					from = from.slice(from.indexOf("<")+1,from.indexOf(">"));
				}
				
				// REA data extraction

				if (from === "realestate.com.au@realestate.com.au" && subject.indexOf("Enquiry for Property ID") > 0){
					from = html.slice(html.indexOf("Email:")+7,html.indexOf("</p>",html.indexOf("Email:")));
				}

				var to = fields["to"][0];

				if (to.indexOf("@parse.candotech.com.au") > 0) {
					to = to.slice(to.indexOf("@parse.candotech.com.au")-24,to.indexOf("parse.candotech.com.au")-1);
				}
				else if (to.indexOf("@parse.getaire.com.au") > 0) {
					to = to.slice(to.indexOf("@parse.getaire.com.au")-24,to.indexOf("parse.getaire.com.au")-1);
				}

				var mail = new Email({from: from, to: to, messageID: msgID, subject: subject, text: text, html:html, jsonPayload: fields});

				Email.find({"messageID": msgID}, function(err1, check) {
					if (err1) {
						console.log(err1);
					}
					else {
						if (check.length > 0) {
							console.log("Already have that message ID");
						}
						else {
							Email.create(mail, function(err2, newlyCreated){
								if (err2) {
										console.log(err2);
								}
								else {
									var mailJson = {
										"from": from,
										"to": to,
										"messageID": msgID,
										"subject": subject,
										"message": text,
										"html": html,
										"email": newlyCreated._id,
										"jsonPayload": newlyCreated.jsonPayload
									};

									console.log("Successfully saved to email queue");
									console.log(mail);

									// Call the main app api

									/*var options = {
										uri: 'https://morning-retreat-82821.herokuapp.com/conversation',
										method: 'POST',
										json: true,   
										body: mailJson
									};

									request(options, function (err3, response, body) {
										if (err3) {
											console.log(err3);
										}
										console.log("Response from main app:" + response);
										console.log("Body from main app:" + body);
									});*/
								}
							});
						}
					}
				});

				res.writeHead(200, {'content-type': 'text/plain'});
				res.write('received upload:\n\n');
				res.end("thanks");
			}
		});
	});

// Events

	app.post('/event', function (req, res) {
		var events = req.body;
		events.forEach(function (event) {
			// Here, you now have each event and can process them how you like
			console.log(event);

			res.end('{"success" : "Updated Successfully", "status" : 200}');
		});
	});

	app.listen(process.env.PORT, process.env.IP, function(){
			console.log("email parser is on!");
	});
