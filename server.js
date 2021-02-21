const express = require('express');
const cors = require('cors');
require('dotenv').config();
const server = express();
server.use(cors());
const PORT = process.env.PORT || 3000;



server.get('/', (req, res) => {
    res.status(200).send('welcome');
});



function Location(geoData) {
    this.search_query = 'Lynnwood';
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

server.get('*', (req, res) => {
    res.status(404).send('Not Found');
});
server.listen(PORT, () => {
    console.log("Listening on port", PORT)
})