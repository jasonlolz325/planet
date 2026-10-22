# Hearth Server (standalone)

Working Discord-style chat with a real Node.js server.

## Run

```bash
cd hearth-server
node server.js
```

Open http://localhost:3000

## Features

- Email + password register / login (no Google or X)
- Servers, channels, invites
- Live messaging (SSE)
- Member list, DMs, reactions

Data is saved to `data.json` (not committed).
Requires Node.js 18+. No npm install needed.
