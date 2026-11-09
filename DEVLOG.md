# Dev Log — Unison

I want to synch multiple phones to play the same music at the same time. 

---

## 2026-11—09 Inception

Today I created the repo, and decided I needed to create a devlog immediately. I want to keep track of all the assumptions I have while building this project and any design decisions I make. 

Getting multiple devices to sync at the same time is a large goal. While I hope to eventually be able to create a jam on spotify and just play a song and have people join, I think we will have to first figure out how to sync up two devices to play a downloaded audio file. 

Our first objective boils down to two parts: get devices to agree on a time, and then play an audio at that agreed time. 

I have a few devices: an iPad, iPhone, Macbook and some of my friends devices as well. I don't want to go native, I think that would be a lot of unnecessary work. I'll start with Node.js. 

Throughout this project, I will be making a lot of assumptions, some of which might be horribly wrong to the experienced developer. My goal for this devlog is to document all of these assumptions and learn from them. I currently run entries from my devlog through claude to catch any assumptions, but might make this a workflow in the near future. I am also realizing that I have an urge to document most of my thoughts, so I might go and split devlog into entries per day. 

### Ideation

Phones are the clients, server keeps track of the "jam room" or clients connected. 

In fact, this essentially is just Spotify's jam feature but playing it out loud. I think I should test out how jam behaves when I have two devices in a jam playing out loud. Do they play in sync? Can one device join and then pick up exactly where the other song is playing? What happens if we skip songs/move where we are in the song?

While testing this, we can start thinking about the first problem which is how to get multiple phones to agree on a time based on an event. 