var AccessToken = require('twilio').jwt.AccessToken;
var VideoGrant = AccessToken.VideoGrant;

exports.getTwilioToken = (request, response) => {
    let { uid } = request.body;
    return new Promise((resolve, reject) => {
        if (!uid) {
            response.send({ message: 'need uid' });
            return;
        }

        var token = new AccessToken(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_API_KEY,
            process.env.TWILIO_API_SECRET
        );

        // Assign the generated identity to the token.
        token.identity = uid;

        // Grant the access token Twilio Video capabilities.
        var grant = new VideoGrant();

        token.addGrant(grant);

        // Serialize the token to a JWT string and include it in a JSON response.
        response.send({ twilioToken: token.toJwt() });   
    });
};