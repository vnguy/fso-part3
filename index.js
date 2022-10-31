require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')


app.use(express.json())
app.use(cors())
app.use(express.static('build'))

// eslint-disable-next-line no-unused-vars
morgan.token('data', (request, response) => {
  return request.body['data']
})

const format = function (tokens, req, res) {
  let result = [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms'
  ]

  if (tokens.method(req, res) === 'POST') {
    result = result.concat(JSON.stringify(req.body))
  }
  return result.join(' ')
}

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if(error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === 'ValidationError') {
    return response.status(400).send({ error: error.message })
  }
}

const unknownEndpoint = (request, response) => {
  response.status(400).send({ error: 'unknown endpoint' })
}


app.use(morgan(format))

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.status(200).json(persons)
  })
})

app.get('/info', (request, response) => {
  const date = new Date()

  Person.find({}).then(persons => {
    response.send(`<p>Phonebook has info for ${persons.length} people</p> 
    <p>${date}</p>`)
  })
})

app.get('/api/persons/:id', (request, response, next) => {

  Person.findById(request.params.id).then( person => {
    response.json(person)
  }).catch(error => {
    next(error)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  // eslint-disable-next-line no-unused-vars
  Person.findByIdAndRemove(request.params.id).then(result => {
    response.status(204).end()
  }).catch(error => {
    next(error)
  })
})

app.post('/api/persons/', (request, response, next) => {
  const body = request.body

  if(!body.name || !body.number) {
    return response.status(400).json({ error: 'name or number missing' })
  }

  const newPerson = new Person({
    name : body.name,
    number : body.number,
  })
  Person.find({ name: body.name }).then(result => {
    if (result.length === 0) {
      // eslint-disable-next-line no-unused-vars
      newPerson.save().then(person => {
        response.json(newPerson)
      }).catch(error => {
        next(error)
      })
    } else {
      return response.status(400).json({ error: `${result[0].name} already exist in phonebook` })
    }
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body
  const person = {
    name: body.name,
    number: body.number,
  }
  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true, context: 'query' }).then(
    updatedPerson => {
      if(updatedPerson === null) {
        return response.status(400).json({ error: `${person.name} has aready been removed from server` })
      }
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)


const PORT = process.env.PORT || 3001
app.listen(PORT,() => {
  console.log(`Server running on port ${PORT}`)
})
