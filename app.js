const express = require('express')
const bodyParser = require('body-parser');
const fs = require('fs')
const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))
app.use(bodyParser.json())

const server = require('./server');

var from = 'enteryouremail@gmail.com';

app.get('/',(req,res) => {
    res.sendFile(__dirname + '/index.html')
})

app.post('/sendemail',(req, res) => {
      var to = req.body.to
      var subject = req.body.subject
      var message = req.body.message
      console.log(to)
      console.log(subject)
      console.log(message)
      server(to, from, subject, message);
      res.redirect('/result.html');
  }
)


app.use((req, res, next) => {
  console.log(req.headers);
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html');
  res.end('<html><body><h1>Invalid request</h1></body></html>');

});

app.listen(3000,() => {
    console.log("App started on Port 3000");
})
