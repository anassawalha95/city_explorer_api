"use strict"


require('dotenv').config();

const cors = require('cors');

const express = require('express');

const pg = require('pg');


const server = express();

server.use(cors());

const superAgent = require('superagent');



//const client = new pg.Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
const client = new pg.Client(process.env.DATABASE_URL);
const PORT = process.env.PORT || 3000;


server.get('/', homeRoute)
server.get('/location', getLocation);
server.get('/weather', getWeather);
server.get('/parks', getParks);
server.get('/movies', getMovies);
server.get('/yelp', getYelp);
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

function Movie(movieTitle, movieOverview, movieAvgVotes, movieTotalVotes, movieImageUrl, moviePopularity, movieReleasedOn) {

    this.title = movieTitle
    this.overview = movieOverview
    this.average_votes = movieAvgVotes
    this.total_votes = movieTotalVotes
    this.image_url = movieImageUrl
    this.popularity = moviePopularity
    this.released_on = movieReleasedOn
}


function Yelp(yelpName, yelpImageUrl, yelpPrice, yelpRating, yelpUrl) {
    this.name = yelpName
    this.image_url = yelpImageUrl
    this.price = yelpPrice
    this.rating = yelpRating
    this.url = yelpUrl
}

function homeRoute(req, res, next) {
    res.status(200).send('welcome');
}



function getLocation(req, res, next) {
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
        }).catch(next)


}



function getWeather(req, res, next) {

    const key = process.env.WEATHER_API_KEY;
    let url = `https://api.weatherbit.io/v2.0/forecast/daily?lat=${lat}&lon=${lon}&key=${key}`;
    superAgent.get(url).then(collection => {
        let forcastData = collection.body.data.map(datuim => {
            return new Weather(datuim.weather.description, new Date(datuim.datetime).toDateString());
        });
        res.status(200).send(forcastData);
    }).catch(next)
}


function getParks(req, res, next) {

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
    }).catch(next)
}


function getMovies(req, res, next) {

    const key = process.env.MOVIE_API_KEY;
    let url = `https://api.themoviedb.org/3/search/movie?api_key=${key}&query=${city}`;

    superAgent.get(url)
        .then(collection => {
            let movies = collection.body.results.map(datuim => {

                return new Movie(datuim.title,
                    datuim.overview,
                    datuim.vote_average,
                    datuim.vote_count,
                    datuim.poster_path,
                    datuim.popularity,
                    datuim.release_date);
            });
            res.status(200).send(movies);
        }).catch(next)
}

// (yelpName, yelpImageUrl, yelpPrice, yelpRating, yelpUrl)
function getYelp(req, res, next) {
    let page = req.query.page
    const key = process.env.YELP_API_KEY;
    let numPerPage = 5
    let start = ((page - 1) * numPerPage + 1)
    let url = `https://api.yelp.com/v3/businesses/search?term=businesses&location=${city}&offset=${start}&limit=${numPerPage} `;
    const authorization = { 'Authorization': `Bearer ${key}` }
    superAgent.get(url)
        .set(authorization)
        .then(collection => {
            let yelpData = collection.body.businesses.map(datuim => {
                return new Yelp(datuim.title,
                    datuim.name,
                    datuim.image_url,
                    datuim.price,
                    datuim.rating,
                    datuim.url
                );
            });


            res.status(200).send(yelpData);
        }).catch(next)

}


function handlingUnknownRoutes(req, res) {
    const errorObject = {
        status: '404',
        responseText: "page not found"
    }
    res.status(404).send(errorObject);
}

function errorHandler(error, req, res, next) {
    res.status(500).send(JSON.parse(error.response.text));
}




client.connect()
    .then(() => {
        server.listen(PORT, () => {
            console.log(`http://localhost:${PORT}`)

            console.log(`http://localhost:${PORT}/yelp`)
        }
        );
    })
