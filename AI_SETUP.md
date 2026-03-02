# Connect AI for Question Generation

The app can generate quiz questions from lesson content. You can use a **free** AI (Google Gemini) or OpenAI.

---

## Option 1: Google Gemini (free, recommended)

Gemini has a **free tier** with no credit card required and generous limits.

### 1. Get a free API key

1. Go to **[Google AI Studio](https://aistudio.google.com/app/apikey)**.
2. Sign in with your Google account.
3. Click **Get API key** or **Create API key** (use default project).
4. Copy the key.

### 2. Configure the server

**Docker:** In the project root, create or edit `.env`:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

**Local server:** Create or edit `server/.env`:

```env
GEMINI_API_KEY=your-gemini-api-key-here
```

Restart the API (e.g. `docker-compose -f docker-compose.dev.yml up -d api` or `npm run dev` in `server`).

### 3. Use it

In Admin → Content Management → open an Assessment → **Manage questions** → **AI generate from content**. Paste text, choose language, click **Generate questions**. No payment needed for the free tier.

---

## Option 2: OpenAI (paid after free credits)

OpenAI gives new accounts limited free credits; after that it’s paid.

1. Get an API key from **[platform.openai.com/api-keys](https://platform.openai.com/api-keys)**.
2. In `.env` (project root) or `server/.env` add:
   ```env
   OPENAI_API_KEY=sk-your-openai-key-here
   ```
3. Restart the API.

If **both** `GEMINI_API_KEY` and `OPENAI_API_KEY` are set, the app uses **Gemini first** (free).

---

## Summary

| Provider | Cost        | Key from                          | Env variable      |
|----------|-------------|-----------------------------------|--------------------|
| **Gemini** | Free tier   | [aistudio.google.com](https://aistudio.google.com/app/apikey) | `GEMINI_API_KEY`   |
| **OpenAI** | Paid*       | [platform.openai.com](https://platform.openai.com/api-keys)   | `OPENAI_API_KEY`   |

\*New OpenAI accounts get a small free credit.

Do not commit `.env` (it’s in `.gitignore`). Use **Gemini** for a fully free setup.
