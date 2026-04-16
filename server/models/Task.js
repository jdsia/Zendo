const mongoose = require('mongoose')

//model - class letting us read, create, update and delete docs 
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date }, 
  createdAt: { type: Date, default: Date.now },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' }, // <-- add this line
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true } // <-- associate tasks with users
}, { timestamps: true }); // <-- This adds createdAt and updatedAt automatically

module.exports = mongoose.model('Task', TaskSchema);

