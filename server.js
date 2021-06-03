import express from 'express'
import cors from 'cors'
import mongoose from 'mongoose'
// import crypto from 'crypto'
// import bcrypt from 'bcrypt'
import dotenv from 'dotenv'
import listEndpoints from 'express-list-endpoints'

import animalData from './data/animal-card-data.json';


const mongoUrl = process.env.MONGO_URL || "mongodb://localhost/petspotter"
mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
mongoose.Promise = Promise

const animalSchema = new mongoose.Schema ({
  lost: Boolean,
  found: Boolean,
  photo: String,
  name: String,
  species: String,
  sex: String,
  breed: String,
  location: String,
  description: String,
  contact: String
})

const Animal = mongoose.model('Animal', animalSchema);

if (process.env.RESET_DB) { 
  const seedDB = async () => {
    await Animal.deleteMany()

    await animalData.forEach(item => {
      const newAnimal = new Animal(item)
      newAnimal.save()
      })
  }   
  seedDB()
}

const port = process.env.PORT || 8080
const app = express()


app.use(cors())
app.use(express.json())

//if no server issue, it will jump to next endpoint, but if there is it will return 503 status (server issue)
// the _ replaces req since we are not use it. Prevents error message from eslint
app.use((_, res, next) => {
  if (mongoose.connection.readyState === 1) {
    next()
  } else {
    res.status(503).json({ error: 'Service not available' })
  }
})

// Routes
app.get('/', (req, res) => {
  res.send(listEndpoints(app))
})

app.get('/home', (req, res) => {
  res.send('This is the home page')
})

app.get('/posters', async (req, res) => {
  const { lost, found, species } = req.query; 
  const lostPets = await Animal.find()

  console.log(req.query)
  if (lost === true) {
      res.json(lostPets)
    } else if (found){
      const foundPets = await Animal.find({
        lost: false,
        found: true
      })
      res.json(foundPets)
    }
    // } else if (species) {
    //   const species = await Animal.find()
    //     species: {
    //             $regex: new RegExp(species, "i") //this operator tells mongo to not care about case sensitivity when searching
    //           }
    //   })
    //   res.json(species)
    
    else {
      res.json(animalData)
    }
})

//Post Requests Here

// Start the server
app.listen(port, () => {
  // eslint-disable-next-line
  console.log(`Server running on http://localhost:${port}`)
})
