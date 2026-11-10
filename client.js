const WebSocket = require('ws');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const ws = new WebSocket('ws://localhost:3000');

let myId;

ws.on('open', () => {
    promptForMessage();
});

ws.on('message', (message) => {
    const msg = JSON.parse(message.toString());
    if (msg.type === 'welcome') {
        myId = msg.id;
        console.log(`Client ${myId} connected`)
    }
    else if (msg.type === 'requestAck') {
        console.log(msg.msg);
    }
    else {
        console.error('Unknown message type: ', msg.type)
    }
});

ws.on('error', (error) => {
    console.error('WebSocket error: ', error);
});

ws.on('close', () => {
    console.log('Disconnected from the server');
    process.exit(0);
});

function promptForMessage() {
    rl.question('Enter a message (or "exit" to quit): ', (message) => {
        if (message.toLowerCase() === 'exit') {
            ws.close();
            rl.close();
            return;
        }
        ws.send(message);
        promptForMessage();
    });
};