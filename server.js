require('dotenv').config();
const express = require('express');
const cors = require('cors');

const server = express();
server.use(cors());
const PORT = process.env.PORT || 3000;


server.get('/', (req, res) => {
    res.status(200).send('you did great job');
});
server.get('*', (req, res) => {
    res.status(404).send('Not Found');
});

server.get('/location', (req, res) => {
    res.status(200).send("alright")
});



server.get('/weather', (req, res) => {

});
