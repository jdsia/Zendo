const express = require('express')
// cors lets frontend (port 3000) talk to server (port 5000)
const cors = require('cors')

// authentication
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')

require('./db') // runs db js establishing the connection

// models
const Task = require('./models/Task')
const User = require('./models/User')

const app = express();
app.use(cors({
  // might have to change this depending on the server im using
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
})); // apply CORS middleware to all routes
app.use(express.json()) // parse incoming json request bodies, needed for req.body
app.use(cookieParser())


// authentication routes
const auth = (req, res, next) => {
  const token = req.cookies.token;

  if (!token) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const decoded = jwt.verify(token, 'secretkey');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
// REGISTER
app.post('/register', async (req, res) => {
  try {
    console.log('Registration request received:', req.body);
    console.log('Headers:', req.headers);
    
    const { username, password } = req.body;

    if (!username || !password) {
      console.log('Missing username or password');
      return res.status(400).json({ message: 'Username and password required' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      console.log('Username already exists:', username);
      return res.status(400).json({ message: 'Username already exists' });
    }

    console.log('Creating new user:', username);
    const hashed = await bcrypt.hash(password, 10);

    const user = new User({ username, password: hashed });
    await user.save();

    console.log('User created successfully:', username);
    res.json({ message: 'User created' });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed' });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ userId: user._id.toString() }, 'secretkey', { expiresIn: '1d' });

  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'Lax'
  });

  res.json({ message: 'Logged in' });
});

// profile
app.get('/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json({ userId: req.user.userId, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// LOGOUT
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ message: 'Logged out' });
});


// get requests - fetch all Task for current user
app.get('/tasks', auth, async(req, res) => {
  const { filter } = req.query // req.query holds URL query params
  const baseQuery = { user: req.user.userId } // Only fetch tasks for current user
  const query = filter === 'completed' ? {...baseQuery, completed: true} : baseQuery
  
  // Get tasks and assign order to those that don't have it
  const tasks = await Task.find(query).sort({ createdAt: 1 }); // Get oldest first initially
  
  // Update tasks without order field
  const tasksWithoutOrder = tasks.filter(task => task.order === undefined || task.order === null);
  if (tasksWithoutOrder.length > 0) {
    for (let i = 0; i < tasksWithoutOrder.length; i++) {
      await Task.findByIdAndUpdate(tasksWithoutOrder[i]._id, { order: i });
    }
    // Refetch to get updated order
    const updatedTasks = await Task.find(query).sort({ order: 1, createdAt: -1 });
    res.json(updatedTasks);
  } else {
    const sortedTasks = tasks.sort((a, b) => {
      if (a.order !== b.order) return a.order - b.order;
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    res.json(sortedTasks);
  }
})

app.post('/tasks', auth, async (req,res) => {
  const { title, dueDate, priority } = req.body; // <-- Destructure dueDate
  
  // Get the current highest order for this user
  const lastTask = await Task.findOne({ user: req.user.userId }).sort({ order: -1 });
  const newOrder = lastTask ? lastTask.order + 1 : 0;
  
  const task = await Task.create({ 
    title, 
    dueDate, 
    priority, 
    order: newOrder, // <-- Assign order to new task
    user: req.user.userId 
  }); // <-- Associate with current user
  res.status(201).json(task) // send back newly created task
})



app.put('/tasks/:id', auth, async (req, res) => {
  try {
    // Find task that belongs to current user
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { $set: req.body },
      { new: true }
    );
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    console.error('PUT error:', err.message);  // check your backend terminal
    res.status(500).json({ error: err.message });  // also sends it to the browser
  }
});

// REORDER tasks
app.post('/tasks/reorder', auth, async (req, res) => {
  try {
    const { taskIds } = req.body; // Array of task IDs in new order
    
    // Update each task with its new order
    const updatePromises = taskIds.map((taskId, index) => 
      Task.findOneAndUpdate(
        { _id: taskId, user: req.user.userId },
        { order: index },
        { new: true }
      )
    );
    
    await Promise.all(updatePromises);
    res.json({ message: 'Tasks reordered successfully' });
  } catch (err) {
    console.error('Reorder error:', err);
    res.status(500).json({ error: err.message });
  }
});

//DELETE task by ID
app.delete('/tasks/:id', auth, async (req, res) => {
  const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.user.userId });
  if (!task) {
    return res.status(404).json({ message: 'Task not found' });
  }
  res.status(204).send(); 
});

app.listen(5000, () => console.log('Server running on port 5000')); // Start the server on port 5000

