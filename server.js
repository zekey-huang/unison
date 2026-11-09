const http = require('node:http');
const fs = require('node:fs');
const WebSocket = require('ws');

const hostname = '::';
const port = 3000;

const html = fs.readFileSync('./index.html');

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
});


const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('New client connected');
  
  // Send a welcome message to the client
  ws.send('Welcome to the WebSocket server!');

  // Message event handler
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);
    // Echo the message back to the client
    ws.send(`Server received: ${message}`);
  });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});





