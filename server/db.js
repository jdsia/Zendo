const mongoose = require('mongoose');

// loads variables from .env so we can use process.env.MONGO_URI
require('dotenv').config();

// Database connection for serverless
let cached = global.mongoose || { conn: null, promise: null };

global.mongoose = cached;

async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(process.env.MONGO_URI, opts)
      .then(mongoose => {
        console.log("Server Connected");
        return mongoose;
      })
      .catch(err => {
        console.error(err);
        throw err;
      });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

module.exports = connectDB;
