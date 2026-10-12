import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { addXP, addCoins } from '../storage';

type Phase = 'idle' | 'in' | 'hold' | 'out';

export default function PanicScreen() {
  const [phase, setPhase] = useState<Phase>('idle');
  const [cycles, setCycles] = useState(0);
  const scale = useRef(new Animated.Value(1)).current;
  const done = cycles >= 3;

  useEffect(() => {
    if (phase === 'idle' || done) return;
    const duration = phase === 'in' ? 4000 : phase === 'hold' ? 4000 : 6000;
    const toValue = phase === 'in' ? 1.6 : phase === 'hold' ? 1.6 : 1;
    const anim = Animated.timing(scale, { toValue, duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true });
    anim.start(({ finished }) => {
      if (!finished) return;
      if (phase === 'in') setPhase('hold');
      else if (phase === 'hold') setPhase('out');
      else {
        setCycles((c) => c + 1);
        setPhase('in');
      }
    });
    return () => anim.stop();
  }, [phase, done]);

  const finish = async () => {
    await addXP(25);
    await addCoins(10);
  };

  useEffect(() => {
    if (done) finish();
  }, [done]);

  const label = phase === 'in' ? 'Breathe in…' : phase === 'hold' ? 'Hold…' : phase === 'out' ? 'Breathe out…' : '';

  return (
    <LinearGradient colors={['#3E7CB1', '#5DA9D6', '#9ADCF5']} style={styles.bg}>
      <View style={styles.container}>
        <Text style={styles.title}>🆘 Panic Button</Text>
        <Text style={styles.sub}>Cravings pass. Breathe with me.</Text>

        {phase === 'idle' ? (
          <Pressable style={styles.panicButton} onPress={() => { setCycles(0); setPhase('in'); }}>
            <Text style={styles.panicEmoji}>🫧</Text>
            <Text style={styles.panicText}>I'M HAVING A CRAVING</Text>
          </Pressable>
        ) : done ? (
          <View style={styles.doneCard}>
            <Text style={styles.doneEmoji}>🎉</Text>
            <Text style={styles.doneTitle}>Craving beaten!</Text>
            <Text style={styles.doneSub}>+25 XP · +10 coins</Text>
            <Pressable style={styles.again} onPress={() => { setCycles(0); setPhase('in'); }}>
              <Text style={styles.againText}>Go again</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.breathArea}>
            <Animated.View style={[styles.breathCircle, { transform: [{ scale }] }]} />
            <Text style={styles.phaseText}>{label}</Text>
            <Text style={styles.cycleText}>Cycle {cycles + 1} / 3</Text>
          </View>
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: '800', color: theme.textLight },
  sub: { color: 'rgba(255,255,255,0.9)', marginTop: 6, marginBottom: 40 },
  panicButton: {
    backgroundColor: theme.coral, borderRadius: 40, paddingVertical: 32, paddingHorizontal: 40,
    alignItems: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 6 },
  },
  panicEmoji: { fontSize: 48 },
  panicText: { color: theme.textLight, fontWeight: '900', fontSize: 18, marginTop: 8 },
  breathArea: { alignItems: 'center', height: 320, justifyContent: 'center' },
  breathCircle: {
    width: 160, height: 160, borderRadius: 80,
    backgroundColor: 'rgba(255,255,255,0.5)', borderWidth: 2, borderColor: 'rgba(255,255,255,0.8)',
  },
  phaseText: { color: theme.textLight, fontSize: 24, fontWeight: '700', marginTop: 32 },
  cycleText: { color: 'rgba(255,255,255,0.8)', marginTop: 8 },
  doneCard: {
    backgroundColor: theme.glass, borderRadius: 28, padding: 32, alignItems: 'center',
    borderWidth: 1, borderColor: theme.glassBorder,
  },
  doneEmoji: { fontSize: 56 },
  doneTitle: { color: theme.textLight, fontSize: 26, fontWeight: '800', marginTop: 12 },
  doneSub: { color: theme.sunshine, fontSize: 16, fontWeight: '700', marginTop: 6 },
  again: { marginTop: 20, backgroundColor: theme.leafGreen, borderRadius: 20, paddingVertical: 10, paddingHorizontal: 24 },
  againText: { color: theme.textLight, fontWeight: '800' },
});
