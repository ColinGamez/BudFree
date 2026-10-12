import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../theme';
import { saveProfile } from '../storage';

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const [spend, setSpend] = useState('10');

  const start = async () => {
    await saveProfile({
      quitDate: new Date().toISOString(),
      dailySpend: Math.max(0, Number(spend) || 0),
    });
    onDone();
  };

  return (
    <LinearGradient colors={[theme.gradientTop, theme.gradientMid, theme.gradientBottom]} style={styles.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={styles.center}>
        <Text style={styles.logo}>🌱</Text>
        <Text style={styles.title}>BudFree</Text>
        <Text style={styles.subtitle}>Your fresh start begins today.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>How much did you spend per day on weed? (€/$)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={spend}
            onChangeText={setSpend}
            placeholder="10"
            placeholderTextColor="rgba(13,59,76,0.4)"
          />
          <Text style={styles.hint}>This powers your “money saved” counter. Your quit date starts right now.</Text>
        </View>

        <Pressable style={styles.button} onPress={start}>
          <LinearGradient colors={[theme.glossTop, theme.glossBottom]} style={styles.gloss} />
          <Text style={styles.buttonText}>Start my journey 🚀</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  logo: { fontSize: 72 },
  title: { fontSize: 44, fontWeight: '800', color: theme.textLight, textShadowColor: 'rgba(0,60,90,0.4)', textShadowRadius: 8, textShadowOffset: { width: 0, height: 2 } },
  subtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', marginBottom: 32, marginTop: 4 },
  card: {
    width: '100%', backgroundColor: theme.glass, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: theme.glassBorder,
  },
  label: { color: theme.textLight, fontWeight: '600', marginBottom: 10 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 14, padding: 14,
    fontSize: 20, color: theme.textDark, fontWeight: '700', textAlign: 'center',
  },
  hint: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 12 },
  button: {
    marginTop: 28, borderRadius: 28, overflow: 'hidden', borderWidth: 1, borderColor: theme.glassBorder,
    paddingVertical: 16, paddingHorizontal: 48, backgroundColor: theme.leafGreen,
  },
  gloss: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.35 },
  buttonText: { color: theme.textLight, fontSize: 18, fontWeight: '800', textAlign: 'center' },
});
