const mongoose = require('mongoose')

const taskSchema = new mongoose.Schema({
  title: {type: String, required: true},
  completed: { type: Boolean, default: false} // defaults to a false when task is first created
}, {timestamps: true}) // auto adds createdat and updated at fields.

//model - class letting us read, create, update and delete docs 

module.exports = mongoose.model('Task', taskSchema);

