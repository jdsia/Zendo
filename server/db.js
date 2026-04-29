const mongoose = require('mongoose');

// loads variables from .env so we can use process.env.MONGO_URI
require('dotenv').config();

// connect to mongodb using MONGO_URI from .env
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Server Connected"))
  .catch(err => console.error(err));

module.exports = mongoose;
