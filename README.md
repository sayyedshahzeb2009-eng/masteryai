# MasterYAI

AI content automation platform for discovering stories, generating social content, scheduling and publishing.

## GitHub Pages

This repository is configured as a Next.js static export for the project URL:

`https://sayyedshahzeb2009-eng.github.io/masteryai/`

GitHub Pages should use **GitHub Actions** as the deployment source.

## Local development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## API keys — important

Do **not** paste real API keys into the frontend code, GitHub repository, or any `NEXT_PUBLIC_*` variable.

For the eventual production automation backend, use server-side environment variables such as:

```env
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
ELEVENLABS_API_KEY=
```

Social platforms should use official OAuth connections rather than asking users for their passwords.

### Providers planned

- Claude / Anthropic — scripts, captions, SEO and content decisions
- Gemini Nano Banana Pro — image/poster generation (`gemini-3-pro-image`)
- ElevenLabs — voice generation
- Instagram / Meta — publishing through official APIs and OAuth
- YouTube — publishing through the YouTube API and OAuth

The current GitHub Pages build is the frontend only. Real API calls and automated publishing require a server/backend deployment where secrets can remain private.
