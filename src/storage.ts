import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  quitDate: 'budfree.quitDate',
  dailySpend: 'budfree.dailySpend',
  xp: 'budfree.xp',
  coins: 'budfree.coins',
  cravings: 'budfree.cravings',
  ownedThemes: 'budfree.ownedThemes',
  equippedTheme: 'budfree.equippedTheme',
  lastCheckIn: 'budfree.lastCheckIn',
  streak: 'budfree.streak',
  freezes: 'budfree.freezes',
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

// ---- Shop ----

export async function getOwnedThemes(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEYS.ownedThemes);
  return raw ? (JSON.parse(raw) as string[]) : ['aero'];
}

export async function getEquippedTheme(): Promise<string> {
  return (await AsyncStorage.getItem(KEYS.equippedTheme)) ?? 'aero';
}

export async function equipTheme(id: string) {
  await AsyncStorage.setItem(KEYS.equippedTheme, id);
}

/** Returns true if purchase succeeded. */
export async function buyTheme(id: string, price: number): Promise<boolean> {
  const coins = await getCoins();
  if (coins < price) return false;
  const owned = await getOwnedThemes();
  if (!owned.includes(id)) {
    owned.push(id);
    await AsyncStorage.setItem(KEYS.ownedThemes, JSON.stringify(owned));
  }
  await addCoins(-price);
  return true;
}

// ---- Craving log ----

export type CravingType = 'flower' | 'vape' | 'edible' | 'preroll' | 'dab' | 'drink';

export type Craving = {
  ts: number; // epoch ms
  type: CravingType;
  intensity: number; // 1-5
  note: string;
  beaten: boolean;
};

export async function getCravings(): Promise<Craving[]> {
  const raw = await AsyncStorage.getItem(KEYS.cravings);
  return raw ? (JSON.parse(raw) as Craving[]) : [];
}

export async function logCraving(c: Omit<Craving, 'ts'>): Promise<Craving[]> {
  const list = await getCravings();
  list.unshift({ ...c, ts: Date.now() });
  await AsyncStorage.setItem(KEYS.cravings, JSON.stringify(list.slice(0, 200)));
  return list;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

export async function getStreak(): Promise<number> {
  return Number((await AsyncStorage.getItem(KEYS.streak)) ?? 0);
}

export async function getFreezes(): Promise<number> {
  return Number((await AsyncStorage.getItem(KEYS.freezes)) ?? 0);
}

export async function hasCheckedInToday(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.lastCheckIn)) === dayKey(new Date());
}

export type CheckInResult =
  | { already: true; streak: number }
  | { already: false; streak: number; coinsEarned: number; xpEarned: number; freezeEarned: boolean };

export async function checkIn(): Promise<CheckInResult> {
  const today = dayKey(new Date());
  const last = await AsyncStorage.getItem(KEYS.lastCheckIn);
  const streak = await getStreak();
  if (last === today) return { already: true, streak };

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  // Streak survives one missed day if a freeze card is available
  let nextStreak: number;
  let freezes = await getFreezes();
  if (last === dayKey(yesterday)) {
    nextStreak = streak + 1;
  } else if (last && freezes > 0) {
    freezes -= 1;
    await AsyncStorage.setItem(KEYS.freezes, String(freezes));
    nextStreak = streak + 1;
  } else {
    nextStreak = 1;
  }

  const coinsEarned = Math.min(5 + nextStreak * 2, 25); // caps at 25/day
  const xpEarned = 10 + nextStreak * 2;
  // Every full 7-day week of streaking earns a freeze card 🧊
  const freezeEarned = nextStreak % 7 === 0;
  if (freezeEarned) {
    await AsyncStorage.setItem(KEYS.freezes, String(freezes + 1));
  }

  await AsyncStorage.setItem(KEYS.lastCheckIn, today);
  await AsyncStorage.setItem(KEYS.streak, String(nextStreak));
  await addCoins(coinsEarned);
  await addXP(xpEarned);

  return { already: false, streak: nextStreak, coinsEarned, xpEarned, freezeEarned };
}
