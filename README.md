# SF Penya Agent

SF Penya Agent is a TypeScript-based AI agent I’m building for Penya Barcelonista San Francisco.

The goal is to automate match-day communication for FC Barcelona watch parties in San Francisco.

Right now, the agent can fetch the next Barça match, gather local context like weather, events, and transit alerts, generate match-day content, create a poster, send an approval email, and publish approved content to sandbox destinations.

## Why I Built This

I’m part of the Barça supporters community in San Francisco, and match-day communication usually involves a lot of small repetitive tasks.

Things like:

- checking the next Barça match
- confirming kickoff time
- writing WhatsApp and Instagram posts
- creating match-day graphics
- checking local weather and events
- sending everything out at the right time

I wanted to use this project to learn how AI agents actually work while building something useful for a real community.

## Current Flow

The current flow looks like this:

```text
Find next FC Barcelona match
        ↓
Fetch local SF context
        ↓
AI generates match-day content
        ↓
AI generates match poster
        ↓
Create approval package
        ↓
Send approval email
        ↓
Human approves
        ↓
Publish to sandbox channels
```

## Automatic poster context

The poster flow now fetches recent-match context automatically:

```text
Next fixture
    → official results page: latest completed Barça match
    → official match page: Barça goalscorers
    → recent-match context snapshot
    → player selection
    → poster prompt
```

`src/providers/barcaOfficialResults.ts` reads the public official pages with
Cheerio. `src/poster/recentMatchContext.ts` turns that data into the poster's
context object and saves `data/recent-match-context.json` for inspection.
Every run fetches fresh data; the saved snapshot is not reused if retrieval fails.

The first selection rule prioritizes goalscorers by goal count. It does not use
assists or overall performance ratings yet. Unfilled player slots use the
existing fallback pools; El Clasico keeps the Yamal–Mbappe pairing. If recent
context is unavailable, the program logs a warning and uses normal selection.

This reuses the project's existing official-site scraping approach without
requiring another API key or an LLM call. It depends on the website's markup;
a documented sports-data API is an option for a future provider replacement.
Recent player photographs and current-kit references are a separate next step.

Check the parser offline, then inspect live context:

```sh
node --import tsx scripts/testRecentMatchParsing.ts
node --import tsx scripts/testRecentMatchContext.ts
```

Check the poster prompt with live data:

```sh
node --import tsx scripts/testPosterGeneration.ts
```

These commands do not call OpenAI. Adding `--generate` to the last command
makes a paid image-generation request and saves a local poster. The poster
test does not run the full agent, upload files, or send email.
