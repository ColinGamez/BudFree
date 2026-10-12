import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { getCravings, getProfile, Craving } from '../storage';
import { useAppTheme } from '../ThemeContext';

const flowerTrophy = require('../../assets/icons/flower3d.png');

const WEEKS = 12;

function dayStart(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

type DayCell = { count: number; slipped: boolean; isFuture: boolean; beforeQuit: boolean };

export default function StatsScreen() {
  const { themeDef } = useAppTheme();
  const [cravings, setCravings] = useState<Craving[]>([]);
  const [quitTs, setQuitTs] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getCravings().then(setCravings);
      getProfile().then((p) => p && setQuitTs(dayStart(new Date(p.quitDate).getTime())));
    }, [])
  );

  // --- Heatmap data: last WEEKS*7 days ---
  const today = dayStart(Date.now());
  const cells: DayCell[] = [];
  const byDay = new Map<number, { count: number; slipped: boolean }>();
  for (const c of cravings) {
    const k = dayStart(c.ts);
    const e = byDay.get(k) ?? { count: 0, slipped: false };
    e.count += 1;
    if (!c.beaten) e.slipped = true;
    byDay.set(k, e);
  }
  for (let i = WEEKS * 7 - 1; i >= 0; i--) {
    const k = today - i * 86400000;
    const e = byDay.get(k);
    cells.push({
      count: e?.count ?? 0,
      slipped: e?.slipped ?? false,
      isFuture: k > today,
      beforeQuit: quitTs > 0 && k < quitTs,
    });
  }
  const weeks: DayCell[][] = [];
  for (let w = 0; w < WEEKS; w++) weeks.push(cells.slice(w * 7, w * 7 + 7));

  // --- Intensity trend: last 14 cravings, oldest → newest ---
  const trend = cravings.slice(0, 14).reverse();

  const totalBeaten = cravings.filter((c) => c.beaten).length;
  const cleanDays = Math.max(0, Math.floor((today - quitTs) / 86400000));

  return (
    <LinearGradient colors={themeDef.gradient} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container}>
        <Image source={flowerTrophy} style={styles.hero} />
        <Text style={styles.title}>Your Stats</Text>
        <Text style={styles.sub}>{totalBeaten} cravings beaten · {cleanDays} days on the journey</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Craving heatmap — last {WEEKS} weeks</Text>
          <View style={styles.heatmap}>
            {weeks.map((week, wi) => (
              <View key={wi} style={styles.weekCol}>
                {week.map((cell, di) => (
                  <View
                    key={di}
                    style={[
                      styles.cell,
                      cell.beforeQuit && styles.cellBefore,
                      !cell.beforeQuit && cell.count === 0 && styles.cellClean,
                      !cell.beforeQuit && cell.count > 0 && !cell.slipped && styles.cellCraved,
                      cell.slipped && styles.cellSlipped,
                    ]}
                  />
                ))}
              </View>
            ))}
          </View>
          <View style={styles.legend}>
            <LegendDot color="#7CB342" label="clean day" />
            <LegendDot color="#FFD54F" label="cravings" />
            <LegendDot color="#FF8A65" label="slip" />
            <LegendDot color="rgba(255,255,255,0.25)" label="before quit" />
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Craving intensity trend</Text>
          {trend.length === 0 ? (
            <Text style={styles.empty}>No cravings logged yet. Use the Log tab when one hits.</Text>
          ) : (
            <View style={styles.chart}>
              {trend.map((c) => (
                <View key={c.ts} style={styles.barCol}>
                  <View
                    style={[
                      styles.bar,
                      { height: 12 + c.intensity * 22 },
                      !c.beaten && styles.barSlipped,
                    ]}
                  />
                  <Text style={styles.barLabel}>{c.intensity}</Text>
                </View>
              ))}
            </View>
          )}
          <Text style={styles.chartHint}>Oldest → newest · taller = stronger craving</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20, paddingTop: 60, alignItems: 'center' },
  hero: { width: 84, height: 84 },
  title: { fontSize: 28, fontWeight: '800', color: theme.textLight, marginTop: 6 },
  sub: { color: 'rgba(255,255,255,0.9)', marginTop: 4, marginBottom: 20 },
  card: {
    width: '100%', backgroundColor: theme.glass, borderRadius: 24, padding: 18,
    borderWidth: 1, borderColor: theme.glassBorder, marginBottom: 16,
  },
  cardTitle: { color: theme.textLight, fontWeight: '800', fontSize: 16, marginBottom: 14 },
  heatmap: { flexDirection: 'row', gap: 4, justifyContent: 'center' },
  weekCol: { gap: 4 },
  cell: { width: 18, height: 18, borderRadius: 5, backgroundColor: 'rgba(255,255,255,0.25)' },
  cellBefore: { backgroundColor: 'rgba(255,255,255,0.18)' },
  cellClean: { backgroundColor: '#7CB342' },
  cellCraved: { backgroundColor: '#FFD54F' },
  cellSlipped: { backgroundColor: '#FF8A65' },
  legend: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 14, justifyContent: 'center' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot: { width: 12, height: 12, borderRadius: 4 },
  legendText: { color: 'rgba(255,255,255,0.85)', fontSize: 11 },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: 6, height: 150, justifyContent: 'center' },
  barCol: { alignItems: 'center', justifyContent: 'flex-end' },
  bar: { width: 16, borderRadius: 6, backgroundColor: theme.leafGreen },
  barSlipped: { backgroundColor: theme.coral },
  barLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 10, marginTop: 4 },
  chartHint: { color: 'rgba(255,255,255,0.7)', fontSize: 11, textAlign: 'center', marginTop: 10 },
  empty: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', paddingVertical: 20 },
});
