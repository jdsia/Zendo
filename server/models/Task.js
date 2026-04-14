const mongoose = require('mongoose')

//model - class letting us read, create, update and delete docs 
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date }, 
}, { timestamps: true }); // <-- This adds createdAt and updatedAt automatically

module.exports = mongoose.model('Task', TaskSchema);

