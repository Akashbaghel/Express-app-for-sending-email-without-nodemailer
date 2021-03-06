const express = require('express');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const router = express.Router();

// If modifying these scopes, delete token.json.
//const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
var SCOPES = [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send'
];

// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/*POST*/

router.post('/', function(req, res) {
  // Load client secrets from a local file.
  fs.readFile('credentials.json', (err, content) => {
    if (err) {
      res.end('<html><body><h3>Since you are using the app for the first time, authorize the app at Google Developer console.</h3></body></html>');
      return console.log('Error loading client secret file:', err);
    }
    // Authorize a client with credentials, then call the Gmail API.
    authorize(JSON.parse(content), sendMessage);
  });

  /**
   * Create an OAuth2 client with the given credentials, and then execute the
   * given callback function.
   * @param {Object} credentials The authorization client credentials.
   * @param {function} callback The callback to call with the authorized client.
   */
  function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    fs.readFile(TOKEN_PATH, (err, token) => {
      if (err) {
        //res.sendFile(__dirname + '/result.html');
        res.end('<html><body><h3>Go to your console and follow the instructions.</h3></body></html>');

        return getNewToken(oAuth2Client, callback);
      }
      oAuth2Client.setCredentials(JSON.parse(token));
      callback(oAuth2Client);
    });
  }

  /**
   * Get and store new token after prompting for user authorization, and then
   * execute the given callback with the authorized OAuth2 client.
   * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
   * @param {getEventsCallback} callback The callback for the authorized client.
   */
  function getNewToken(oAuth2Client, callback) {
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES,
    });
    console.log('Authorize this app by visiting this url:', authUrl);
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question('Enter the code from that page here: ', (code) => {
      rl.close();
      oAuth2Client.getToken(code, (err, token) => {
        if (err) return console.error('Error retrieving access token', err);
        oAuth2Client.setCredentials(token);
        // Store the token to disk for later program executions
        fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
          if (err) return console.error(err);
          console.log('Token stored to', TOKEN_PATH);
        });
        callback(oAuth2Client);
      });
    });
  }


  function makeBody(to, from, subject, message) {
      var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
          "MIME-Version: 1.0\n",
          "Content-Transfer-Encoding: 7bit\n",
          "to: ", to, "\n",
          "from: ", from, "\n",
          "subject: ", subject, "\n",
          message
      ].join('');

      var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
          return encodedMail;
  }

  /**
   * Sends the email from your Gmail account
   *
   * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
   */

  function sendMessage(auth) {
    var to = req.body.to;
    var from = 'enteryouremail@gmail.com';
    var subject = req.body.subject;
    var message = req.body.message;

    var raw = makeBody(to, from, subject, message);
    const gmail = google.gmail({version: 'v1', auth});
    gmail.users.messages.send({
        auth: auth,
        userId: 'me',
        resource: {
            raw: raw
        }
    }, (err, response) => {
        if(err) return console.log(err);
        res.redirect('/result.html');
        return console.log('Message has been successfully sent.');
    });
  }
});


module.exports = router;

