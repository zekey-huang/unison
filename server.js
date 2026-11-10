const http = require('node:http');
const fs = require('node:fs');
const WebSocket = require('ws');

const hostname = '::';
const port = 3000;

const html = fs.readFileSync('./index.html');

const clients = new Map();
let nextId = 1;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/html');
    res.end(html);
});


const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {

  const id = nextId++;
  clients.set(id, ws);
  console.log(`New client connected: ${id} `);
  const welcome = { type: 'welcome', id: id };
  
  
  // Send a welcome message to the client
  ws.send(JSON.stringify(welcome));

  // Message event handler
  ws.on('message', (message) => {
    console.log(`Received: ${message}`);

    // requestAck message
    const requestAck = { type: 'requestAck', msg: `Server received: ${message}`};

    // Echo the message back to the client
    ws.send(JSON.stringify(requestAck));
  });

  // Close event handler
  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

server.listen(port, hostname, () => {
    console.log(`listening on port ${port}`);
});




