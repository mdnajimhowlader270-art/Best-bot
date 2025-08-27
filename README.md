# Telegram Gold Bot (Railway Deploy)

## Setup
1. Create a file named `.env` in the project root (copy `.env.example`) and set:
```
BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN
CHANNEL_ID=-100xxxxxxxxxx   # your channel/chat id
```
2. Push to GitHub, then on Railway: New Project → GitHub Repo → Deploy.

## Run locally
```
npm install
npm start
```

## Commands
- /start, /help
- /buy, /sell, /again_buy, /again_sell
- /limit_buy <price>, /limit_sell <price>
- /update_tp <tp>, /update_sl <sl>, /update_tpsl <tp> <sl>
- /calc_lot <balance> <risk%>, /set_lot <lot>
- /morning, /psychology, /daily, /weekly
