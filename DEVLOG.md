# Dev Log — Unison

I want to synch multiple phones to play the same music at the same time. 

---

## 2026-11-09 Inception

Today I created the repo, and decided I needed to create a devlog immediately. I want to keep track of all the assumptions I have while building this project and any design decisions I make. 

Getting multiple devices to sync at the same time is a large goal. While I hope to eventually be able to create a jam on spotify and just play a song and have people join, I think we will have to first figure out how to sync up two devices to play a downloaded audio file. 

Our first objective boils down to two parts: get devices to agree on a time, and then play an audio at that agreed time. 

I have a few devices: an iPad, iPhone, Macbook and some of my friends devices as well. I don't want to go native, I think that would be a lot of unnecessary work. I'll start with Node.js. 

Throughout this project, I will be making a lot of assumptions, some of which might seem horribly wrong to the experienced developer. My goal for this devlog is to document all of these assumptions and learn from them. I currently run entries from my devlog through claude to catch any assumptions, but might make this a workflow in the near future. I am also realizing that I have an urge to document most of my thoughts, so I might go and split devlog into entries per day. 

### Ideation

Phones are the clients, server keeps track of the "jam room" or clients connected. 

In fact, this essentially is just Spotify's jam feature but playing it out loud. I think I should test out how jam behaves when I have two devices in a jam playing out loud. Do they play in sync? Can one device join and then pick up exactly where the other song is playing? What happens if we skip songs/move where we are in the song?

While testing this, we can start thinking about the first problem which is how to get multiple phones to agree on a time based on an event. 

One guarantee we must have for our application to work is that the server must be alive. Right now that doesn't matter as I would just restart the server, but down the line I would have to take into account that a single server could be a point of failure. 

Another issue is that say a server says all clients should play at time x. It sends a message to all clients to play a song at time x. But those messages are not guaranteed to arrive at a predetermined time. Some messages might deliver fast, some might take longer. 

So the first thing I will do is figure out how to get a server to ping a client and see if its possible to mark the amount of time it takes to send the message. Then we will run this multiple times and note the average time it takes to send a message to a client. Then we will have the server send multiple pings out to different clients and mark down the times for each individual message latency. 



## 2026-11-10 Node Server Setup

First we are going to set up a Node server. I went to the nodejs documentation page and looked at the Usage and Example page. I copied that code over to server.js and ran node server.js. 

When I went to https://127.0.0.1:3000 I saw "This site can't provide a secure connection" 

I need to figure out why. A google search told me "when Chrome displays 'this site can't provide a secure connection' and the page says 'sent an invalid response,' it means the browser reached the server, but the SSL/TLS handshake failed. This is the ERR_SSL_PROTOCOL_ERROR' 

Some common causes are using HTTPS on localhost when our local dev server only supports HTTP, a missing certificate. Our address is a local dev URL which is 127.0.0.1. It says that its likely that we are forcing HTTPS when dev server is running HTTP. So the fix is to change the https://127.0.0.1 url to just http. 

Wow that worked! I am honestly surprised at how simple that was. I don't remember the last time a Google search genuinely helped me solve something, although that might just be me not reading in depth enough or the fact that it might just be a super common error. 

So now, I wonder if I can open that exact link on my phone's browser. I think so. I'm not sure what 127.0.0.1 is but if it is in the nodejs documentation and everywhere online, then I am assuming it might be standard.

So it didn't work I got a site cannot be reached: 127.0.0.1 is currently unreachable on my phone. I think also its because the port might be just for my computer. 

So after some research, port 3000 isn't the problem. The issue is loopback addresses. This is what 127.0.0.1 is. THis is the IPv4 version and it is mapped to localhost. It is a reserved IP address used by a device to send network traffic to itself, allowing for local testing and internal comms without involving external physical networks. So it is processed within the local TCP/IP stack rather than transmitting over a network interface. 

To make a service on my PC reachable from other devices, I need to bind the service to my LAN IP or to 0.0.0.0 which is all interfaces and then allow the port through my OS firewall. 

Our LAN IP is the address our device gets on our local network. It's not visible from the internet. We can find this with the command `ifconfig` or `ip addr`, more specifically `ipconfig getifaddr en0`. 

But this means that our laptop won't work so I'll use 0.0.0.0 which is the wildcard meta-address. 

So apparently we need to use http://<your LAN IP>:3000 on our phone. 0.0.0.0:3000 works on laptop because thats the same computer. My house wifi is actually down right now, so I will need to try the hotspot. Now I think the hotspot is requiring me to use IPv6 so I need that version of 0.0.0.0 which is :: 

And for the url to use in my phone: http://[2607:fb91:261f:4122:1814:62f:f116:5596]:3000

I now have a server that handled requests from my laptop the host and a separate phone. 

Now the next step is to figure out how to send a ping and then have the second device reply with a pong, and get the response time logged. In our application, the server would be the one sending the. 

### Design Rough Draft
Requirements: 3 phones, can join a room, one phone chooses an audio, songs start playing in sync

One client chooses a song and sends a request to the server to play song[id]. The server then broadcasts play song[id] to all of the other clients. The issue is that those responses aren't guaranteed to deliver. I think we should just figure out how to get multiple clients and log their ids, and then have a client choose a song, and then have the server broadcast to all clients to play that song and see how that behaves. I think that songs will start playing at different times. 

First thing I want to do is measure the amount of time it takes for a client to send a message to the server and then receive it back. How do we ID the client? 

First off in order for the server to talk to the client we need a websocket. WebSocket keeps one conenction open between each phone and the server, so either side can send a message at any time. We should use one websocket per client. But in order to use a websocket, we need to serve an HTML page. We do this by changing text/plain to text/html and putting an html body. 

I will use the fs library for loading in the ./index.html file that I used claude to generate. This is the native file system module which is built-in meaning it does not require installation via npm. 

By the way for testing right now: 


for hotspot:
laptop: http://localhost:3000
phone: http://[IPv6 address]:3000

Ok now I have the unison page loading on two different devices. I have a join button that I can use. I want to click the join button and have it send a message, and then log the amount of time it takes for it to send to the client, and then conversely log the amount of time it takes for a client to send a message to the server. 


In order for us to attach a WebSocket to our http server, we need to create the server first. So I will bring out the createServer to the top level. Now I am creating websocket server/clients. 