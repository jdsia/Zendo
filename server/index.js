const express = require('express')
// cors lets frontend (port 3000) talk to server (port 5000)
const cors = require('cors')
require('./db') // runs db js establishing the connection
const Task = require('./models/Task')

const app = express();
app.use(cors()); // apply CORS middleware to all routes
app.use(express.json()) // parse incoming json request bodies, needed for req.body

// get requests - fetch all Task
app.get('/tasks', async(req, res) => {
  const { filter } = req.query // req.query holds URL query params
  const query = filter === 'completed' ? {completed: true} : {}
  const tasks = await Task.find(query).sort({ createdAt: -1 }); // Find matching tasks, newest first im assuming thats whats the -1 is for
  res.json(tasks); // Send the array of tasks back as JSON
})

app.post('/tasks', async (req,res) => {
  //const task = await Task.create({ title: req.body.title})
  const { title, dueDate } = req.body; // <-- Destructure dueDate
  const task = await Task.create({ title, dueDate }); // <-- Pass dueDate
  res.status(201).json(task) // send back newly created task
})

app.put('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    console.error('PUT error:', err.message);  // check your backend terminal
    res.status(500).json({ error: err.message });  // also sends it to the browser
  }
});

//DELETE task by ID
app.delete('/tasks/:id', async (req, res) => {
  await Task.findByIdAndDelete(req.params.id); 
  res.status(204).send(); 
});

app.listen(5000, () => console.log('Server running on port 5000')); // Start the server on port 5000

