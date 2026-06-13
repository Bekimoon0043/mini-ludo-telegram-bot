# Mini Ludo Telegram Bot

A simple text-based Mini Ludo game for Telegram bot, deployed on Vercel.

## Features
- Start game with /play
- Roll dice with /roll
- Race to position 40 against a bot
- Uses Telegram Dice animation

## Setup

1. Create a Telegram bot with @BotFather and get the token.
2. Copy `.env.example` to `.env.local` and set `BOT_TOKEN`.
3. Deploy to Vercel.

## Deploy to Vercel

Use the Vercel dashboard or CLI to deploy.

After deployment, set the webhook:

```bash
curl -F "url=https://your-project.vercel.app/api/bot" https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook
```

## Play
Message the bot /start, /play, /roll.

This is a mini simplified version for demonstration.