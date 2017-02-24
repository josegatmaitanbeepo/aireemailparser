var mongoose = require("mongoose");

var emailSchema = mongoose.Schema({
    from: String,
    to: String,
    subject: String,
    text: String,
    html: String,
    dateReceived: { type: Date, default: Date.now },
    processed: {type: Boolean(), default: false},
    jsonPayload: String,
});

module.exports = mongoose.model("Email", emailSchema);