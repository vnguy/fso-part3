const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

mongoose.connect(url, () => {
  console.log(`connected to ${url}`)
})

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    validate: {
      validator: function(v) {
        return /^\d{2,3}-\d+$/.test(v) },
      message: props => `${props.value} is not a valid phone number!`
    },
    minLength: 9,
    required: true,
  },
})

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const person = mongoose.model('Person', personSchema)

module.exports = person