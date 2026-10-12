import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  quitDate: 'budfree.quitDate',
  dailySpend: 'budfree.dailySpend',
  xp: 'budfree.xp',
  coins: 'budfree.coins',
  cravings: 'budfree.cravings',
};

export type Profile = {
  quitDate: string; // ISO
  dailySpend: number;
};

export async function getProfile(): Promise<Profile | null> {
  const [quitDate, dailySpend] = await Promise.all([
    AsyncStorage.getItem(KEYS.quitDate),
    AsyncStorage.getItem(KEYS.dailySpend),
  ]);
  if (!quitDate) return null;
  return { quitDate, dailySpend: Number(dailySpend ?? 0) };
}

export async function saveProfile(p: Profile) {
  await Promise.all([
    AsyncStorage.setItem(KEYS.quitDate, p.quitDate),
    AsyncStorage.setItem(KEYS.dailySpend, String(p.dailySpend)),
  ]);
}

export async function getXP(): Promise<number> {
  return Number((await AsyncStorage.getItem(KEYS.xp)) ?? 0);
}

export async function addXP(amount: number): Promise<number> {
  const next = (await getXP()) + amount;
  await AsyncStorage.setItem(KEYS.xp, String(next));
  return next;
}

export async function getCoins(): Promise<number> {
  return Number((await AsyncStorage.getItem(KEYS.coins)) ?? 0);
}

export async function addCoins(amount: number): Promise<number> {
  const next = (await getCoins()) + amount;
  await AsyncStorage.setItem(KEYS.coins, String(next));
  return next;
}

// Level curve: level n requires n * 100 XP cumulative-ish (simple quadratic feel)
export function levelForXP(xp: number): { level: number; intoLevel: number; needed: number } {
  let level = 1;
  let remaining = xp;
  let needed = 100;
  while (remaining >= needed) {
    remaining -= needed;
    level += 1;
    needed = level * 100;
  }
  return { level, intoLevel: remaining, needed };
}

export const LEVEL_TITLES = [
  'Seed', 'Seedling', 'Sprout', 'Sapling', 'Young Leaf',
  'Green Stem', 'Wildflower', 'Deep Roots', 'Tall Tree', 'Ancient Forest',
];

export function titleForLevel(level: number): string {
  return LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)];
}
