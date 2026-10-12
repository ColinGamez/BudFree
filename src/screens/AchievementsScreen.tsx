import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { getProfile } from '../storage';

type Achievement = {
  id: string;
  emoji: string;
  name: string;
  desc: string;
  unlocked: boolean;
};

export default function AchievementsScreen() {
  const [days, setDays] = useState(0);

  useEffect(() => {
    getProfile().then((p) => {
      if (p) setDays((Date.now() - new Date(p.quitDate).getTime()) / 86400000);
    });
  }, []);

  const achievements: Achievement[] = [
    { id: 'first-hour', emoji: '⏱️', name: 'First Hour', desc: '1 hour clean', unlocked: days >= 1 / 24 },
    { id: 'day-1', emoji: '🌅', name: 'New Dawn', desc: '24 hours clean', unlocked: days >= 1 },
    { id: 'day-3', emoji: '🌱', name: 'Sprout', desc: '3 days clean', unlocked: days >= 3 },
    { id: 'week-1', emoji: '🌿', name: 'One Week Wonder', desc: '7 days clean', unlocked: days >= 7 },
    { id: 'week-2', emoji: '💪', name: 'Fortnight Fighter', desc: '14 days clean', unlocked: days >= 14 },
    { id: 'month-1', emoji: '🌳', name: 'Monthly Milestone', desc: '30 days clean', unlocked: days >= 30 },
    { id: 'day-90', emoji: '🏆', name: 'Brain Reboot', desc: '90 days clean', unlocked: days >= 90 },
    { id: 'year-1', emoji: '👑', name: 'Legendary', desc: '1 year clean', unlocked: days >= 365 },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <LinearGradient colors={[theme.gradientTop, theme.gradientMid, theme.gradientBottom]} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🏅 Achievements</Text>
        <Text style={styles.sub}>{unlockedCount} / {achievements.length} unlocked</Text>
        <View style={styles.grid}>
          {achievements.map((a) => (
            <View key={a.id} style={[styles.badge, !a.unlocked && styles.locked]}>
              <Text style={styles.badgeEmoji}>{a.unlocked ? a.emoji : '🔒'}</Text>
              <Text style={styles.badgeName}>{a.name}</Text>
              <Text style={styles.badgeDesc}>{a.desc}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: theme.textLight, textAlign: 'center' },
  sub: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  badge: {
    width: '47%', backgroundColor: theme.glass, borderRadius: 20, padding: 16,
    alignItems: 'center', borderWidth: 1, borderColor: theme.glassBorder,
  },
  locked: { opacity: 0.45 },
  badgeEmoji: { fontSize: 36 },
  badgeName: { color: theme.textLight, fontWeight: '800', marginTop: 8, textAlign: 'center' },
  badgeDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 4, textAlign: 'center' },
});
