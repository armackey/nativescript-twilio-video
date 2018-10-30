require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const { getTwilioToken } = require('./twilio');
const PORT = process.env.PORT || 9000;
const app = express();

app.use(bodyParser.json());

app.post('/twilioToken', (req, res) => {
    console.log('twilioToken');
    getTwilioToken(req, res);
});

app.listen(PORT, () => {
    console.log('completed. now refresh da browser');
    console.log(`listening on http://localhost:${PORT}!`);
});