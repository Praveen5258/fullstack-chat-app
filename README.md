# ✨ Full Stack Realtime Chat App ✨

![Demo App](/frontend/public/screenshot-for-readme.png)

[Video Tutorial on Youtube](https://youtu.be/ntKkVrQqBYY)

Highlights:

- 🌟 Tech stack: MERN + Socket.io + TailwindCSS + Daisy UI
- 🎃 Authentication && Authorization with JWT
- 👾 Real-time messaging with Socket.io
- 🚀 Online user status
- 👌 Global state management with Zustand
- 🐞 Error handling both on the server and on the client
- ⭐ At the end Deployment like a pro for FREE!
- ⏳ And much more!

### Setup .env file

```js
MONGODB_URI=...
PORT=5001
JWT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Required for the in-chat AI assistant
OPENAI_API_KEY=...
# Optional; defaults to gpt-4.1-mini
OPENAI_MODEL=gpt-4.1-mini

NODE_ENV=development
```

### Build the app

```shell
npm run build
```

### Start the app

```shell
npm start
```

### AI chat assistant

Each conversation has an **AI** button beside the composer. It can summarize the current chat, suggest a reply, translate the latest message, rewrite the draft in a selected tone, and answer questions from the conversation context. Set `OPENAI_API_KEY` in the environment of the deployed backend; it is never exposed to the browser.

### Deploy

The repository is ready for a single-service deployment (for example Render or Railway): use `npm run build` as the build command and `npm start` as the start command. Add `MONGODB_URI`, `JWT_SECRET`, Cloudinary values, `OPENAI_API_KEY`, and `NODE_ENV=production` to the host's environment variables. The Express server serves `frontend/dist` in production.
