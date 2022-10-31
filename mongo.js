const mongoose = require('mongoose')

const password = process.argv[2]
const name = process.argv[3]
const number = process.argv[4]

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

const url = `mongodb+srv://vnguy1997:${password}@cluster0.emvad.mongodb.net/phonebook-app?retryWrites=true&w=majority`

if (process.argv.length === 3) {
  mongoose.connect(url).then(result => {
    console.log('phonebook:')
    Person.find({}).then( result => {
      result.forEach(person => console.log(person.name, person.number))
      mongoose.connection.close()
    })
  })
} else if (process.argv.length === 5) {
  mongoose.connect(url).then(result => {
    const person = new Person({
      name: name,
      number: number,
    })
    return person.save()
  }).then( result => {
    console.log(`added ${result.name} number ${result.number} to phonebook`)
    mongoose.connection.close()
  })
}