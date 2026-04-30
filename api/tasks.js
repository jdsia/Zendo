const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// Define schemas inline
const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  dueDate: { type: Date }, 
  createdAt: { type: Date, default: Date.now },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  order: { type: Number, default: 0 },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const Task = mongoose.models.Task || mongoose.model('Task', TaskSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB Connected");
  } catch (err) {
    console.error("MongoDB Error:", err);
    throw err;
  }
};

// Authentication middleware
const auth = async (req, res, next) => {
  const token = req.cookies.token || (req.headers.authorization && req.headers.authorization.split(' ')[1]);
  
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secretkey');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = async (req, res) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    
    // Connect to database
    await connectDB();
    
    // Use auth middleware
    await new Promise((resolve, reject) => {
      auth(req, res, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    const { filter } = req.query;
    const baseQuery = { user: req.user.userId };
    const query = filter === 'completed' ? { ...baseQuery, completed: true } : baseQuery;
    
    const tasks = await Task.find(query).sort({ order: 1, createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    console.error('Tasks error:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};
