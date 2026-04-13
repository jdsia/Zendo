#!/bin/bash

# Start backend
cd server && npx nodemon index.js &

# Start frontend
cd client && npm run dev &

# Wait for both background processes
wait
