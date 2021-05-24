require('dotenv').config()
const express = require('express')
const bodyParser = require('body-parser')
const fetch = require('node-fetch')
const path = require('path')

const app = express()
const port = 3000

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

app.use('/', express.static(path.join(__dirname, '../public')))


// API Call to get a photo of the day
app.get('/apod', async (req, res) => {
    try {
        let image = await fetch(`https://api.nasa.gov/planetary/apod?api_key=${process.env.API_KEY}`)
            .then(res => res.json())
        res.send({ image })
    } catch (err) {
        console.log('error:', err);
    }
})

// API Call to get rover's information + most recent images taken by that selcted rover
app.get('/rovers/:roverName', async (req, res) => {
    try {
        const roverName = req.params.roverName; // get the rover name from the request

        // Mission Manifest: will list details of the Rover's mission to help narrow down photo queries to the API. 
        const missionManifest = await fetch(`https://api.nasa.gov/mars-photos/api/v1/manifests/${roverName}?api_key=${process.env.API_KEY}`)
            .then(res => res.json())      
            .catch(err => console.log('error:', err));    
         
        // Get rover' photos using max_sol from the mission manifest
        const photos = await fetch(`https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?sol=${missionManifest.photo_manifest.max_sol}&api_key=${process.env.API_KEY}`)
            .then(res => res.json())        
            .catch(err => console.log('error:', err));    
        
        // return the photos
        res.send(photos.photos)

    } catch(err) {
        console.error('Oops! something went wrong!', err);
    }
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))