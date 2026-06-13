import { NextRequest, NextResponse } from 'next/server';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  console.error('BOT_TOKEN not set');
}

interface GameState {
  positions: { [player: string]: number };
  turn: string;
  chatId: number;
}

const gameStates = new Map<number, GameState>();

async function sendMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
}

async function sendDice(chatId: number) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendDice`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, emoji: '🎲' }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const update = await req.json();
    const message = update.message;
    if (!message) return NextResponse.json({ ok: true });

    const chatId = message.chat.id;
    const text = message.text || '';

    if (text === '/start') {
      await sendMessage(chatId, 'Welcome to Mini Ludo Bot! 🎲\nUse /play to start a 2-player race (You vs Bot). First to 40 wins!');
    } else if (text === '/play') {
      gameStates.set(chatId, {
        positions: { 'You': 0, 'Bot': 0 },
        turn: 'You',
        chatId
      });
      await sendMessage(chatId, 'Game started! Your turn. Send /roll to roll the dice.');
    } else if (text === '/roll') {
      const state = gameStates.get(chatId);
      if (!state || state.turn !== 'You') {
        await sendMessage(chatId, 'No active game or not your turn!');
        return NextResponse.json({ ok: true });
      }

      // Roll for player
      await sendDice(chatId); // Telegram sends animated dice

      const dice = Math.floor(Math.random() * 6) + 1;
      state.positions['You'] += dice;
      
      await sendMessage(chatId, `You rolled ${dice}! Position: ${state.positions['You']}`);

      if (state.positions['You'] >= 40) {
        await sendMessage(chatId, '🎉 You win the game!');
        gameStates.delete(chatId);
        return NextResponse.json({ ok: true });
      }

      state.turn = 'Bot';

      // Bot's turn
      setTimeout(async () => {
        const botState = gameStates.get(chatId);
        if (!botState) return;

        const botDice = Math.floor(Math.random() * 6) + 1;
        botState.positions['Bot'] += botDice;
        
        await sendMessage(chatId, `🤖 Bot rolled ${botDice}! Bot position: ${botState.positions['Bot']}`);

        if (botState.positions['Bot'] >= 40) {
          await sendMessage(chatId, '🤖 Bot wins!');
          gameStates.delete(chatId);
          return;
        }

        botState.turn = 'You';
        await sendMessage(chatId, 'Your turn again! Send /roll');
      }, 1500);
    } else {
      await sendMessage(chatId, 'Commands: /start, /play, /roll');
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ ok: true });
  }
}