import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { getProfile, getXP, getCoins, levelForXP, titleForLevel, Profile } from '../storage';

function pad(n: number) {
  return n.toString().padStart(2, '0');
}

export default function HomeScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [now, setNow] = useState(Date.now());
  const [xp, setXP] = useState(0);
  const [coins, setCoins] = useState(0);

  useEffect(() => {
    getProfile().then(setProfile);
    getXP().then(setXP);
    getCoins().then(setCoins);
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!profile) return null;

  const elapsed = Math.max(0, now - new Date(profile.quitDate).getTime());
  const days = Math.floor(elapsed / 86400000);
  const hours = Math.floor((elapsed % 86400000) / 3600000);
  const mins = Math.floor((elapsed % 3600000) / 60000);
  const secs = Math.floor((elapsed % 60000) / 1000);
  const saved = ((elapsed / 86400000) * profile.dailySpend).toFixed(2);
  const { level, intoLevel, needed } = levelForXP(xp);

  return (
    <LinearGradient colors={[theme.gradientTop, theme.gradientMid, theme.gradientBottom]} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.bubble}>🫧</Text>
        <Text style={styles.heading}>Weed-free for</Text>

        <View style={styles.timerCard}>
          <View style={styles.timeRow}>
            <TimeUnit value={days} label="days" />
            <TimeUnit value={hours} label="hrs" />
            <TimeUnit value={mins} label="min" />
            <TimeUnit value={secs} label="sec" />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>💰</Text>
            <Text style={styles.statValue}>${saved}</Text>
            <Text style={styles.statLabel}>saved</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🪙</Text>
            <Text style={styles.statValue}>{coins}</Text>
            <Text style={styles.statLabel}>coins</Text>
          </View>
        </View>

        <View style={styles.levelCard}>
          <Text style={styles.levelTitle}>Lv.{level} · {titleForLevel(level)}</Text>
          <View style={styles.xpBarBg}>
            <LinearGradient
              colors={[theme.grass, theme.leafGreen]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={[styles.xpBarFill, { width: `${Math.min(100, (intoLevel / needed) * 100)}%` }]}
            />
          </View>
          <Text style={styles.xpText}>{intoLevel} / {needed} XP</Text>
        </View>

        <Text style={styles.quote}>"Every day clean is a day your brain heals." 🌤️</Text>
      </ScrollView>
    </LinearGradient>
  );
}

function TimeUnit({ value, label }: { value: number; label: string }) {
  return (
    <View style={styles.timeUnit}>
      <Text style={styles.timeValue}>{pad(value)}</Text>
      <Text style={styles.timeLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { alignItems: 'center', padding: 20, paddingTop: 60 },
  bubble: { fontSize: 40, marginBottom: 4 },
  heading: { color: theme.textLight, fontSize: 22, fontWeight: '700', marginBottom: 16, textShadowColor: 'rgba(0,60,90,0.35)', textShadowRadius: 6 },
  timerCard: {
    width: '100%', backgroundColor: theme.glass, borderRadius: 28, padding: 24,
    borderWidth: 1, borderColor: theme.glassBorder,
  },
  timeRow: { flexDirection: 'row', justifyContent: 'space-around' },
  timeUnit: { alignItems: 'center' },
  timeValue: { fontSize: 40, fontWeight: '800', color: theme.textLight, fontVariant: ['tabular-nums'] },
  timeLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2, textTransform: 'uppercase', letterSpacing: 1 },
  row: { flexDirection: 'row', gap: 12, marginTop: 16, width: '100%' },
  statCard: {
    flex: 1, backgroundColor: theme.glass, borderRadius: 20, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: theme.glassBorder,
  },
  statEmoji: { fontSize: 24 },
  statValue: { fontSize: 22, fontWeight: '800', color: theme.textLight, marginTop: 4 },
  statLabel: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  levelCard: {
    width: '100%', backgroundColor: theme.glass, borderRadius: 20, padding: 16,
    marginTop: 16, borderWidth: 1, borderColor: theme.glassBorder,
  },
  levelTitle: { color: theme.textLight, fontWeight: '800', fontSize: 16, marginBottom: 10 },
  xpBarBg: { height: 14, borderRadius: 7, backgroundColor: 'rgba(255,255,255,0.3)', overflow: 'hidden' },
  xpBarFill: { height: '100%', borderRadius: 7 },
  xpText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, marginTop: 6, textAlign: 'right' },
  quote: { color: 'rgba(255,255,255,0.9)', marginTop: 28, fontStyle: 'italic', textAlign: 'center' },
});
