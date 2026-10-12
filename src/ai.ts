import AsyncStorage from '@react-native-async-storage/async-storage';
import { BuddyProfile } from './storage';
import { BuddyStats } from './buddy';

const KEY_STORE = 'budfree.groqKey';
const ENDPOINT = 'https://api.groq.com/openai/v1/chat/completions';
const MODEL = 'llama-3.1-8b-instant'; // free, fast

export async function getAIKey(): Promise<string | null> {
  return AsyncStorage.getItem(KEY_STORE);
}

export async function setAIKey(key: string) {
  await AsyncStorage.setItem(KEY_STORE, key.trim());
}

export async function clearAIKey() {
  await AsyncStorage.removeItem(KEY_STORE);
}

function systemPrompt(p: BuddyProfile | null, s: BuddyStats): string {
  return [
    'You are Bud, a warm, supportive buddy inside BudFree, an app that helps people quit weed.',
    'You speak casually, kindly, with light humor. Short replies (2-4 sentences) unless the user asks for more. A few emojis are fine.',
    'Never shame the user. Slips are data, not failure. Never encourage drug use. If the user mentions self-harm, gently point them to professional help and local hotlines.',
    p
      ? `The user is ${p.userName || 'a friend'}. They quit weed for: ${p.quitReason}. Their biggest trigger: ${p.mainTrigger}. Their goal: ${p.goalDays} days clean.`
      : 'The user has not shared their profile yet.',
    `Current stats: ${s.days} days clean, ${s.streak}-day check-in streak, level ${s.level}, ${s.coins} coins, ${s.beatenCount}/${s.cravingCount} cravings beaten.`,
    'Reference their real stats when relevant — that is what makes you personal.',
  ].join('\n');
}

export type ChatMsg = { role: 'user' | 'assistant'; content: string };

/** Returns the AI reply, or null on any failure (caller falls back to offline Bud). */
export async function askGroq(
  history: ChatMsg[],
  profile: BuddyProfile | null,
  stats: BuddyStats
): Promise<string | null> {
  const key = await getAIKey();
  if (!key) return null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: systemPrompt(profile, stats) },
          ...history.slice(-10), // keep last 10 messages for context
        ],
        max_tokens: 300,
        temperature: 0.7,
      }),
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content;
    return typeof text === 'string' && text.trim() ? text.trim() : null;
  } catch {
    return null;
  }
}
