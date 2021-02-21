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



function Location(geoData) {
    this.search_query = locationData[0].display_name.split(',')[0];
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;

}


server.get('/location', (req, res) => {
    const locationsData = require('./data/location.json');
    const location = new Location(locationsData);

    res.send(location);
});


Weather.prototype.forcast = function (data) {
    let weathers = []
    data.forEach(datuim => {
        weathers.push({ "forecast": datuim.weather.description, "time": new Date(datuim.datetime).toDateString() })
    });
    return weathers
}



function Weather(obj) {

    this.forecast = Weather.prototype.forcast(obj.data)

}


server.get('/weather', (req, res) => {
    const weatherData = require('./data/weather.json');
    const weather = new Weather(weatherData);
    res.send(weather);
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