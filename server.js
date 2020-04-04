require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const lib = require('./src/lib');

app.use(express.static(path.join(__dirname, 'build')));

const {
  MONGODB_URI,
  WCL_KEY,
  WCL_GUILD,
  WCL_SERVER,
  WCL_REGION,
} = process.env;

mongoose.Promise = Promise;

const mongoURI = MONGODB_URI || 'mongodb://localhost/warcraft-logs-attendance-check';

mongoose.connect(mongoURI, function (err, res) {
  if (err) {
    console.log('ERROR connecting to: ' + mongoURI + '. ' + err);
  } else {
    console.log('Succeeded connected to: ' + mongoURI);
  }
});

app.get('/api/update/attendance', (req, res) => {
  lib.updateAttendance({WCL_GUILD, WCL_KEY, WCL_REGION, WCL_SERVER})
    .then(() => {
      res.status(200)
        .send('{"msg": "Done"}');
    })
    .catch(err => {
      res.status(500)
        .send(err);
    });
});

app.get('/api/attendance', (req, res) => {
  lib.getAttendance()
    .then(players => {
      res.status(200)
        .send(players);
    });
});

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 8080);