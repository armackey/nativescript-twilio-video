require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { getTwilioToken } = require('./twilio');
const PORT = process.env.PORT || 9000;
const app = express();
console.log(process.env.TWILIO_API_KEY);
app.use(bodyParser.json());

app.post('/twilioToken', (req, res) => {
	console.log('twilioTOken');
    getTwilioToken(req, res);
});

app.listen(PORT, () => {
    console.log('completed. now refresh da browser');
    console.log(`listening on http://localhost:${PORT}!`);
});