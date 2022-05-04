
const rateLimit = require('express-rate-limit')
const apiRequestLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100
})

const express = require('express')
const app = express()
app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static('views'))
app.use(apiRequestLimiter)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
const dotenv = require('dotenv')
const { application } = require('express')
dotenv.config()
const apiKey = process.env.APIKEY
app.set('view engine', 'ejs')

let lat;
let lon;
let weatherJSON = { 
    "name": "Enter city",
    "main": {
        "temp": "00.00"
    },
    "weather": [{
        "main": "Weather condition",
        "description": "Description about weather"
    }],
    "sys": {
        "country": "Country of the city"
    }
}

app.get('/', async function (req, res) {
    try{
        res.status(200).render('index', {weatherJSON})
    }catch(err){
        res.status(500).send(err.message)
    }    
})

app.post('/api', async function (req, res) {
    try{
        let city = req.body.city
        const geoData = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`)
        const geoJSON = await geoData.json()
         
        lat = geoJSON[0].lat
        lon = geoJSON[0].lon

        const weatherData = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`)
        weatherJSON = await weatherData.json()

        res.status(200).redirect('/')
    }catch(err){
        res.send(err.message)
    }
})



app.listen(process.env.PORT || 5000, () => console.log('server is running'))