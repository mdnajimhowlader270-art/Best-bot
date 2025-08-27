// index.js
// Telegram Gold Bot with 14 functions/commands
// Works on Railway/Heroku. Exposes a tiny web server to stay alive.

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.status(200).send('Gold Bot is running ✅');
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
});

// ====== ENV ======
const BOT_TOKEN = process.env.BOT_TOKEN;
const CHANNEL_ID = process.env.CHANNEL_ID; // e.g. "-1001234567890"

if (!BOT_TOKEN || !CHANNEL_ID) {
  console.error('Missing BOT_TOKEN or CHANNEL_ID in environment variables.');
  process.exit(1);
}

// ====== TELEGRAM BOT (polling) ======
// If you switch to webhooks later, Railway will work too.
// For simplicity we use polling here.
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ====== Helpers ======
let defaultLot = 0.10; // in lots
const priceNow = () => 3375.97; // replace with realtime API if you want

function sendToChannel(text, extra = {}) {
  return bot.sendMessage(CHANNEL_ID, text, { parse_mode: 'HTML', ...extra });
}

function parseTwoNumbers(args) {
  // returns [a, b] or [null, null]
  const parts = args.trim().split(/\s+/);
  if (parts.length < 2) return [null, null];
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  return [isNaN(a) ? null : a, isNaN(b) ? null : b];
}

function parseOneNumber(args) {
  const n = Number((args || '').toString().trim());
  return isNaN(n) ? null : n;
}

function guardAdmin(msg) {
  // Optionally restrict by user id; for now allow all
  return true;
}

// ====== Commands (14) ======
// 1) /start - hello
bot.onText(/^\/start\b/, (msg) => {
  bot.sendMessage(msg.chat.id, `👋 Welcome to <b>Gold Signal Bot</b>!
Use /help to see all commands.`, { parse_mode: 'HTML' });
});

// 2) /help - list
bot.onText(/^\/help\b/, (msg) => {
  const help = `📜 <b>Commands</b>
/buy - Market Buy
/sell - Market Sell
/again_buy - Again Buy
/again_sell - Again Sell
/limit_buy <price>
/limit_sell <price>
/update_tp <tp>  (optional)
/update_sl <sl>  (optional)
/update_tpsl <tp> <sl>
/calc_lot <balance> <risk%>
/set_lot <lot>
/morning
/psychology
/daily
/weekly`;
  bot.sendMessage(msg.chat.id, help, { parse_mode: 'HTML' });
});

// Shared signal composer
function composeSignal(type, price, lot) {
  return `📢 <b>Signal:</b> ${type}
💰 <b>Price:</b> ${price.toFixed(2)}
🎯 <b>Lot Size:</b> ${lot.toFixed(2)}`;
}

// 3) /buy
bot.onText(/^\/buy\b/, (msg) => {
  if (!guardAdmin(msg)) return;
  const text = composeSignal('Market Buy', priceNow(), defaultLot);
  sendToChannel(text).then(() => bot.sendMessage(msg.chat.id, '✅ Sent'));
});

// 4) /sell
bot.onText(/^\/sell\b/, (msg) => {
  if (!guardAdmin(msg)) return;
  const text = composeSignal('Market Sell', priceNow(), defaultLot);
  sendToChannel(text).then(() => bot.sendMessage(msg.chat.id, '✅ Sent'));
});

// 5) /again_buy
bot.onText(/^\/again_buy\b/, (msg) => {
  const text = composeSignal('Again Buy', priceNow(), defaultLot);
  sendToChannel(text).then(() => bot.sendMessage(msg.chat.id, '✅ Sent'));
});

// 6) /again_sell
bot.onText(/^\/again_sell\b/, (msg) => {
  const text = composeSignal('Again Sell', priceNow(), defaultLot);
  sendToChannel(text).then(() => bot.sendMessage(msg.chat.id, '✅ Sent'));
});

// 7) /limit_buy <price>
bot.onText(/^\/limit_buy(?:\s+(.+))?$/i, (msg, match) => {
  const p = parseOneNumber(match[1] || '');
  if (p === null) return bot.sendMessage(msg.chat.id, '❌ Send: /limit_buy 3375.0');
  const text = composeSignal('Limit Buy', p, defaultLot);
  sendToChannel(text).then(() => bot.sendMessage(msg.chat.id, '✅ Sent'));
});

// 8) /limit_sell <price>
bot.onText(/^\/limit_sell(?:\s+(.+))?$/i, (msg, match) => {
  const p = parseOneNumber(match[1] || '');
  if (p === null) return bot.sendMessage(msg.chat.id, '❌ Send: /limit_sell 3375.0');
  const text = composeSignal('Limit Sell', p, defaultLot);
  sendToChannel(text).then(() => bot.sendMessage(msg.chat.id, '✅ Sent'));
});

// 9) /update_tp <tp>
bot.onText(/^\/update_tp(?:\s+(.+))?$/i, (msg, match) => {
  const tp = parseOneNumber(match[1] || '');
  const text = `✏️ <b>Update TP</b>\n🎯 <b>TP:</b> ${tp !== null ? tp : 'Not set'}`;
  sendToChannel(text, {}).then(() => bot.sendMessage(msg.chat.id, '✅ TP Updated'));
});

// 10) /update_sl <sl>
bot.onText(/^\/update_sl(?:\s+(.+))?$/i, (msg, match) => {
  const sl = parseOneNumber(match[1] || '');
  const text = `✏️ <b>Update SL</b>\n🛑 <b>SL:</b> ${sl !== null ? sl : 'Not set'}`;
  sendToChannel(text, {}).then(() => bot.sendMessage(msg.chat.id, '✅ SL Updated'));
});

// 11) /update_tpsl <tp> <sl>
bot.onText(/^\/update_tpsl(?:\s+(.+))?$/i, (msg, match) => {
  const args = match[1] || '';
  const [tp, sl] = parseTwoNumbers(args);
  if (tp === null && sl === null) {
    return bot.sendMessage(msg.chat.id, '❌ Send: /update_tpsl 3385 3350');
  }
  const text = `✏️ <b>Update TP/SL</b>
🎯 <b>TP:</b> ${tp !== null ? tp : 'Not set'}
🛑 <b>SL:</b> ${sl !== null ? sl : 'Not set'}`;
  sendToChannel(text).then(() => bot.sendMessage(msg.chat.id, '✅ TP/SL Updated'));
});

// 12) /calc_lot <balance> <risk%>
bot.onText(/^\/calc_lot(?:\s+(.+))?$/i, (msg, match) => {
  const args = match[1] || '';
  const [balance, risk] = parseTwoNumbers(args);
  if (balance === null || risk === null) {
    return bot.sendMessage(msg.chat.id, '❌ Send: /calc_lot 1000 2');
  }
  const riskAmount = (balance * risk) / 100.0;
  const lotSize = Math.max(0.01, Number((riskAmount / 100).toFixed(2)));
  const text = `📊 <b>Lot Calculation</b>
💵 <b>Balance:</b> ${balance}
⚖️ <b>Risk:</b> ${risk}%
🎯 <b>Lot Size:</b> ${lotSize}`;
  sendToChannel(text).then(() => bot.sendMessage(msg.chat.id, `✅ Lot: ${lotSize}`));
});

// 13) /set_lot <lot>
bot.onText(/^\/set_lot(?:\s+(.+))?$/i, (msg, match) => {
  const lot = parseOneNumber(match[1] || '');
  if (lot === null) return bot.sendMessage(msg.chat.id, '❌ Send: /set_lot 0.10');
  defaultLot = Math.max(0.01, Number(lot.toFixed(2)));
  bot.sendMessage(msg.chat.id, `✅ Default lot set to ${defaultLot.toFixed(2)}`);
});

// 14) /morning
bot.onText(/^\/morning\b/i, (msg) => {
  sendToChannel('🌅 Morning Message\nHave a disciplined, profitable day!').then(() =>
    bot.sendMessage(msg.chat.id, '✅ Sent')
  );
});

// 15) /psychology
bot.onText(/^\/psychology\b/i, (msg) => {
  sendToChannel('🧠 Psychology Tip\nStick to your plan. Avoid revenge trading.').then(() =>
    bot.sendMessage(msg.chat.id, '✅ Sent')
  );
});

// 16) /daily
bot.onText(/^\/daily\b/i, (msg) => {
  sendToChannel('📊 Daily Report\n(Write your daily summary here)').then(() =>
    bot.sendMessage(msg.chat.id, '✅ Sent')
  );
});

// 17) /weekly
bot.onText(/^\/weekly\b/i, (msg) => {
  sendToChannel('📈 Weekly Report\n(Write your weekly summary here)').then(() =>
    bot.sendMessage(msg.chat.id, '✅ Sent')
  );
});

console.log('Bot is up ✅');
