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