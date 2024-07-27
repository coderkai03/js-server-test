const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

console.log('Starting app...')

// Endpoint to handle POST requests
app.post('/data', (req, res) => {
  console.log('Received data:', req.body);
  res.send('Data received');
});

// Endpoint to handle GET requests to /data
app.get('/data', (req, res) => {
    console.log('This is the data endpoint. Please use a POST request to send data.')
  res.send('This is the data endpoint. Please use a POST request to send data.');
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
