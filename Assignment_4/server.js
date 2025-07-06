// server.js
const express = require('express');
const app = express();
const PORT = 3000;

//Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next(); // Pass to the next middleware/route handler
});

//Route 1: Home
app.get('/', (req, res) => {
  res.send('Welcome to the Home Page!');
});

//Route 2: About
app.get('/about', (req, res) => {
  res.send('This is Assignment-4!');
});

//Route 3: Catch-all for 404
app.use((req, res) => {
  res.status(404).send('404 - Page Not Found');
});

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
