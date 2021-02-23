"use strict"


require('dotenv').config();

const cors = require('cors');

const express = require('express');

const server = express();

server.use(cors());

const superAgent = require('superagent');



const PORT = process.env.PORT || 3000;


server.get('/', homeRoute)
server.get('/weather', getWeather);
server.get('/location', getLocation);
server.get('/parks', getParks);
server.get('*', handlingUnknownRoutes);
server.use(errorHandler)



let lon
let lat
let city
function Location(data) {
    this.search_query = data[0].display_name.split(',')[0];
    this.formatted_query = data[0].display_name;
    this.latitude = data[0].lat;
    this.longitude = data[0].lon;
    lon = data[0].lon;
    lat = data[0].lat;
}

function Weather(forcast, time) {
    this.forecast = forcast
    this.time = time
}

function Park(parkName, parkAddress, parkFee, parkDescription, parkUrl) {

    this.name = parkName
    this.address = ` ${parkAddress.line1} , ${parkAddress.city} , ${parkAddress.stateCode} , ${parkAddress.postalCode}`
    this.fee = (parkFee.length > 0 ? parkFee : "0.0")
    this.description = parkDescription
    this.url = parkUrl
}


function homeRoute(req, res) {
    res.status(200).send('welcome');
}



function getLocation(req, res) {
    city = req.query.city
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
    superAgent.get(url).then(collection => {
        let forcastData = collection.body.data.map(datuim => {
            return new Weather(datuim.weather.description, new Date(datuim.datetime).toDateString());
        });
        res.send(forcastData);
    }).catch(errorHandler)
}


function getParks(req, res) {

    let key = process.env.PARKS_API_KEY;
    let url = `https://developer.nps.gov/api/v1/parks?q=${city}&limit=10&api_key=${key}`;
    superAgent.get(url).then(collection => {

        let parks = collection.body.data.map(datuim => {
            return new Park(
                datuim.fullName,
                datuim.addresses[0],
                datuim.fees,
                datuim.description,
                datuim.url);
        });
        res.send(parks);
    }).catch(errorHandler)
}


function handlingUnknownRoutes(req, res) {
    const errorObject = {
        status: '404',
        responseText: "page not found"
    }
    res.status(404).send(errorObject);
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