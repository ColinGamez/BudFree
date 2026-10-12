import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { getCravings, logCraving, addXP, addCoins, Craving, CravingType } from '../storage';
import { useAppTheme } from '../ThemeContext';

const TYPE_META: { id: CravingType; label: string; icon: any }[] = [
  { id: 'flower', label: 'Flower', icon: require('../../assets/icons/flower.png') },
  { id: 'preroll', label: 'Pre-roll', icon: require('../../assets/icons/preroll.png') },
  { id: 'vape', label: 'Vape', icon: require('../../assets/icons/vape.png') },
  { id: 'edible', label: 'Edible', icon: require('../../assets/icons/edible.png') },
  { id: 'dab', label: 'Dab', icon: require('../../assets/icons/dab.png') },
  { id: 'drink', label: 'Drink', icon: require('../../assets/icons/drink.png') },
];

function iconFor(type: CravingType) {
  return TYPE_META.find((t) => t.id === type)?.icon;
}

function timeAgo(ts: number): string {
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function CravingsScreen() {
  const { themeDef } = useAppTheme();
  const [cravings, setCravings] = useState<Craving[]>([]);
  const [type, setType] = useState<CravingType>('flower');
  const [intensity, setIntensity] = useState(3);
  const [note, setNote] = useState('');
  const [beaten, setBeaten] = useState(true);

  useFocusEffect(
    useCallback(() => {
      getCravings().then(setCravings);
    }, [])
  );

  const submit = async () => {
    const list = await logCraving({ type, intensity, note: note.trim(), beaten });
    setCravings(list);
    setNote('');
    setIntensity(3);
    if (beaten) {
      await addXP(15);
      await addCoins(5);
      Alert.alert('Craving logged 💪', 'You beat it — +15 XP · +5 coins');
    } else {
      Alert.alert('Logged 🤝', 'No shame. Awareness is progress too.');
    }
  };

  return (
    <LinearGradient colors={themeDef.gradient} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>🌊 Craving Log</Text>
        <Text style={styles.sub}>Name it to tame it.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>What are you craving?</Text>
          <View style={styles.typeGrid}>
            {TYPE_META.map((t) => (
              <Pressable
                key={t.id}
                style={[styles.typeChip, type === t.id && styles.typeChipActive]}
                onPress={() => setType(t.id)}
              >
                <Image source={t.icon} style={styles.typeIcon} />
                <Text style={[styles.typeLabel, type === t.id && styles.typeLabelActive]}>{t.label}</Text>
              </Pressable>
            ))}
          </View>

          <Text style={styles.label}>Intensity</Text>
          <View style={styles.intensityRow}>
            {[1, 2, 3, 4, 5].map((n) => (
              <Pressable
                key={n}
                style={[styles.dot, intensity >= n && styles.dotActive]}
                onPress={() => setIntensity(n)}
              />
            ))}
          </View>

          <Text style={styles.label}>What triggered it? (optional)</Text>
          <TextInput
            style={styles.input}
            value={note}
            onChangeText={setNote}
            placeholder="stress, boredom, saw a friend smoke…"
            placeholderTextColor="rgba(13,59,76,0.4)"
          />

          <View style={styles.beatenRow}>
            <Pressable
              style={[styles.beatenBtn, beaten && styles.beatenYes]}
              onPress={() => setBeaten(true)}
            >
              <Text style={styles.beatenText}>I beat it 💪</Text>
            </Pressable>
            <Pressable
              style={[styles.beatenBtn, !beaten && styles.beatenNo]}
              onPress={() => setBeaten(false)}
            >
              <Text style={styles.beatenText}>I slipped</Text>
            </Pressable>
          </View>

          <Pressable style={styles.submit} onPress={submit}>
            <Text style={styles.submitText}>Log it</Text>
          </Pressable>
        </View>

        <Text style={styles.historyTitle}>History ({cravings.length})</Text>
        {cravings.slice(0, 20).map((c) => (
          <View key={c.ts} style={styles.historyRow}>
            <Image source={iconFor(c.type)} style={styles.historyIcon} />
            <View style={{ flex: 1 }}>
              <Text style={styles.historyText}>
                {TYPE_META.find((t) => t.id === c.type)?.label} · intensity {c.intensity}/5
              </Text>
              {!!c.note && <Text style={styles.historyNote}>{c.note}</Text>}
              <Text style={styles.historyTime}>{timeAgo(c.ts)}</Text>
            </View>
            <Text style={styles.historyBadge}>{c.beaten ? '💪' : '🌧️'}</Text>
          </View>
        ))}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: theme.textLight, textAlign: 'center' },
  sub: { color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 4, marginBottom: 20 },
  card: {
    backgroundColor: theme.glass, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: theme.glassBorder,
  },
  label: { color: theme.textLight, fontWeight: '700', marginTop: 14, marginBottom: 10 },
  typeGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  typeChip: {
    width: '30%', alignItems: 'center', padding: 10, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.35)', borderWidth: 2, borderColor: 'transparent',
  },
  typeChipActive: { borderColor: theme.sunshine, backgroundColor: 'rgba(255,255,255,0.7)' },
  typeIcon: { width: 40, height: 40 },
  typeLabel: { fontSize: 12, fontWeight: '700', color: theme.textDark, marginTop: 6 },
  typeLabelActive: { color: theme.deepGreen },
  intensityRow: { flexDirection: 'row', gap: 12 },
  dot: { width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActive: { backgroundColor: theme.coral },
  input: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 14, padding: 12,
    color: theme.textDark,
  },
  beatenRow: { flexDirection: 'row', gap: 10, marginTop: 18 },
  beatenBtn: {
    flex: 1, padding: 12, borderRadius: 16, alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 2, borderColor: 'transparent',
  },
  beatenYes: { backgroundColor: theme.leafGreen, borderColor: 'rgba(255,255,255,0.6)' },
  beatenNo: { backgroundColor: theme.coral, borderColor: 'rgba(255,255,255,0.6)' },
  beatenText: { color: theme.textLight, fontWeight: '800' },
  submit: {
    marginTop: 16, backgroundColor: theme.sunshine, borderRadius: 18, padding: 14, alignItems: 'center',
  },
  submitText: { color: theme.textDark, fontWeight: '900', fontSize: 16 },
  historyTitle: { color: theme.textLight, fontWeight: '800', fontSize: 18, marginTop: 24, marginBottom: 10 },
  historyRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: theme.glass,
    borderRadius: 16, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: theme.glassBorder,
  },
  historyIcon: { width: 36, height: 36, tintColor: theme.textLight },
  historyText: { color: theme.textLight, fontWeight: '700' },
  historyNote: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  historyTime: { color: 'rgba(255,255,255,0.7)', fontSize: 11, marginTop: 2 },
  historyBadge: { fontSize: 20 },
});
