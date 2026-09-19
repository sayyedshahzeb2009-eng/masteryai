# MasterYAI

MasterYAI is a full-stack AI content automation workspace: news discovery → AI copy/SEO → image generation → voice generation → official social publishing.

## Deployment

**MasterYAI is now a full-stack Next.js app. GitHub Pages is not used for the backend. Deploy the repository to Vercel (or another Node-compatible host) so `/api/*` routes can execute.**

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Server environment variables

Copy `.env.example` to `.env.local` for local development. In production, add the same variables to your Vercel project under **Settings → Environment Variables**.

Required for AI features:

```env
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
```

Optional provider configuration:

```env
ANTHROPIC_MODEL=claude-sonnet-4-6
GEMINI_IMAGE_MODEL=gemini-3-pro-image
ELEVENLABS_MODEL=eleven_multilingual_v2
ELEVENLABS_VOICE_ID=JBFqnCBsd6RMkjVDRZzb
```

Social OAuth:

```env
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=
INSTAGRAM_REDIRECT_URI=https://YOUR-DOMAIN/api/auth/instagram/callback
YOUTUBE_CLIENT_ID=
YOUTUBE_CLIENT_SECRET=
YOUTUBE_REDIRECT_URI=https://YOUR-DOMAIN/api/auth/youtube/callback
```

Never put secrets in `NEXT_PUBLIC_*`, frontend source, or GitHub.

## Implemented backend

- `GET /api/health` — server and environment status
- `POST /api/news/scan` — Google News RSS discovery for a configured topic
- `POST /api/ai/content` — Claude content/SEO package generation
- `POST /api/ai/image` — Gemini Nano Banana Pro image generation
- `POST /api/ai/voice` — ElevenLabs text-to-speech
- `/api/auth/instagram` + callback — Instagram OAuth start/callback
- `/api/auth/youtube` + callback — YouTube OAuth start/callback
- `POST /api/publish/instagram` — Instagram image publishing

## Important publishing limitation

Instagram image publishing requires the final image to be available at a public HTTPS URL. The current image endpoint returns generated image bytes to the browser, so a storage layer (Cloudinary, S3/R2, etc.) should be added before automatic publishing of generated images.

Video rendering, persistent database storage, recurring jobs and multi-user billing are intentionally not faked as complete features yet; they are the next backend layers.

## Security

API keys are server-only. Social connections use OAuth rather than asking for platform passwords. Do not commit `.env` files or real credentials.
