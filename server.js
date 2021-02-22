'use strict'

const express = require('express');

require('dotenv').config();

const cors = require('cors');

const server = express();

const PORT = process.env.PORT || 3000;

const superAgent = require('superAgent');



server.use(cors());

server.get('/weather', getWeather);
server.get('/location', getLocation);
server.get('/parks', getParks);
server.get('*', handlingUnknownRoutes);
server.get('/', homeRoute)
server.use(errorHandler)

let lon = 0
let lat = 0

function Location(data) {
    this.search_query = data[0].display_name.split(',')[0];
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
    lon = data[0].lat;
    lat = data[0].lon;
}

function Weather(forcast, time) {
    this.forecast = forcast
    this.time = time
}

function Park(forcast, time) {

    this.name = name
    this.address = address
    this.fee = fee
    this.description = description
    this.url = url
}

function homeRoute(req, res) {
    res.status(200).send('welcome');
}



function getLocation(req, res) {
    const city = req.query.city
    let key = process.env.GEOCODE_API_KEY;
    let url = `https://eu1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json`;
    superAgent.get(url).then(data => {
        const location = new Location(data.body);
        res.send(location);
    }).catch(errorHandler)
}



function getWeather(req, res) {

    let key = process.env.WEATHER_API_KEY;
    let url = `http://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${key}`;
    superAgent.get(url).then(d => {
        let forcastData = d.body.data.map(datuim => {
            return new Weather(datuim.weather.description, new Date(datuim.datetime).toDateString());
        });
        res.send(forcastData);
    }).catch(errorHandler)
}


function getParks(req, res) {
    //https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=e8WX8n8QkSKGFx42aPM8bQjGGO2kiGpP4Df6GPGJ
    let key = process.env.PARKS_API_KEY;
    let url = `https://developer.nps.gov/api/v1/parks?parkCode=acad&api_key=${key}`;
    superAgent.get(url).then(d => {
        let forcastData = d.body.data.map(datuim => {
            return new Weather(datuim.weather.description, new Date(datuim.datetime).toDateString());
        });
        res.send(forcastData);
    }).catch(errorHandler)

}


function handlingUnknownRoutes(req, res) {
    const errObj = {
        status: '404',
        responseText: "page not found"
    }
    res.status(404).send(errObj);
}

function errorHandler(error, req, res) {
    const errorObject = {
        status: '500',
        responseText: "Sorry, something went wrong"
    }
    res.status(500).send(errorObject);
}



server.listen(PORT, () => {
    console.log("Listening on port", PORT)
})