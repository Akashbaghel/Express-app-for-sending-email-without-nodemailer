const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(bodyParser.json());

//Add your email
var from = 'enteryouremail@gmail.com';

//Set Routes
const Email = require('./routes/email.js');

app.use('/sendemail', Email);

app.use(express.static(__dirname + '/public'));

app.use((req, res, next) => {
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h2>Requested URL not found</h2></body></html>');

});

app.listen(3000, () => {
    console.log("App started on Port 3000");
})
