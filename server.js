"use strict"


require('dotenv').config();

const cors = require('cors');

const express = require('express');

const pg = require('pg');


const server = express();

server.use(cors());

const superAgent = require('superagent');

const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
//const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;


server.get('/', homeRoute)
server.get('/weather', getWeather);
server.get('/location', getLocation);
server.get('/parks', getParks);
server.get('*', handlingUnknownRoutes);
server.use(errorHandler)


let c = console
let lon
let lat
let city

function Location(city, data) {
    this.search_query = city
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

    const safeValue = [city];
    const query = `SELECT * FROM locations WHERE search_query = $1 `

    client.query(query, safeValue)
        .then(result => {

            if (result.rowCount) {
                res.status(200).json(result.rows[0]);
            } else {

                superAgent.get(url)
                    .then(data => {
                        // console.log(data.body);
                        const location = new Location(city, data.body);
                        const SQL = `INSERT INTO locations (search_query,formatted_query,latitude,longitude) VALUES($1,$2,$3,$4)  RETURNING * ;`
                        let safeValues = [city, location.formatted_query, location.latitude, location.longitude];

                        client.query(SQL, safeValues)
                            .then(result => {
                                console.log(result);
                                res.status(200).send(location);
                            })//.catch(errorHandler)
                    })//.catch(errorHandler)
            }
        })//.catch(errorHandler)


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




client.connect()
    .then(() => {
        server.listen(PORT, () =>
            console.log(`localhost:${PORT}`)
        );
    })
