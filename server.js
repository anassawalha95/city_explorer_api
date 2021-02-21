'use strict'

const express = require('express');
require('dotenv').config();

const cors = require('cors');

const server = express();

const PORT = process.env.PORT || 3030;
server.use(cors());


server.get('/', (req, res) => {
    res.status(200).send('welcome');
});



function Location(data) {
    this.search_query = data[0].display_name.split(',')[0];
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;

}


server.get('/location', (req, res) => {
    const locationsData = require('./data/location.json');
    const location = new Location(locationsData);
    res.send(location);
});

function Weather(forcast, time) {
    this.forecast = forcast
    this.time = time
}


server.get('/weather', (req, res) => {
    const weatherData = require('./data/weather.json');
    let weathers = []
    weatherData.data.forEach(datuim => {
        const weather = new Weather(datuim.weather.description, new Date(datuim.datetime).toDateString());
        weathers.push(weather)
    });

    res.send(weathers);
});

server.use('*', (req, res) => {
    const errObj = {
        status: '500',
        responseText: "Sorry, something went wrong"
    }
    res.status(500).send(errObj);
})
server.listen(PORT, () => {
    console.log("Listening on port", PORT)
})