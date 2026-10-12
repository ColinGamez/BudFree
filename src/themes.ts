// BudFree — theme catalog (shop items)
export type ThemeDef = {
  id: string;
  name: string;
  emoji: string;
  price: number; // 0 = free / default
  gradient: [string, string, string];
  accent: string;
  desc: string;
};

export const THEMES: ThemeDef[] = [
  {
    id: 'aero',
    name: 'Frutiger Aero',
    emoji: '🫧',
    price: 0,
    gradient: ['#7FDBFF', '#4FC3F7', '#1E88C7'],
    accent: '#7CB342',
    desc: 'The classic. Glossy aqua optimism.',
  },
  {
    id: 'sunset',
    name: 'Vista Sunset',
    emoji: '🌇',
    price: 150,
    gradient: ['#FFB75E', '#ED8F03', '#C94B4B'],
    accent: '#FFD54F',
    desc: 'Warm evening glow for golden hour quitters.',
  },
  {
    id: 'aurora',
    name: 'Aurora Nights',
    emoji: '🌌',
    price: 300,
    gradient: ['#0F2027', '#2C5364', '#43C6AC'],
    accent: '#43C6AC',
    desc: 'Northern lights over a calm mind.',
  },
  {
    id: 'forest',
    name: 'Deep Forest',
    emoji: '🌲',
    price: 500,
    gradient: ['#134E5E', '#71B280', '#134E2E'],
    accent: '#AED581',
    desc: 'For the Ancient Forests out there.',
  },
];

export function getThemeById(id: string): ThemeDef {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
