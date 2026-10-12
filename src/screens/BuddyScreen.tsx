import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Pressable, TextInput, Image, KeyboardAvoidingView, Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import {
  getBuddyProfile, saveBuddyProfile, getProfile, getStreak, getCoins, getXP,
  getCravings, levelForXP, BuddyProfile,
} from '../storage';
import { buddyGreeting, buddyReply, BuddyStats } from '../buddy';
import { useAppTheme } from '../ThemeContext';

const mascot = require('../../assets/custom/mascot.png');

type Msg = { id: number; from: 'buddy' | 'me'; text: string };

const REASONS = [
  { id: 'health', label: 'Health' },
  { id: 'money', label: 'Money' },
  { id: 'mind', label: 'Clear mind' },
  { id: 'family', label: 'Family' },
  { id: 'freedom', label: 'Freedom' },
];

const TRIGGERS = [
  { id: 'stress', label: 'Stress' },
  { id: 'boredom', label: 'Boredom' },
  { id: 'sleep', label: 'Sleep' },
  { id: 'social', label: 'Social' },
  { id: 'habit', label: 'Habit' },
];

export default function BuddyScreen() {
  const { themeDef } = useAppTheme();
  const [profile, setProfile] = useState<BuddyProfile | null>(null);
  const [stats, setStats] = useState<BuddyStats | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const scroll = useRef<ScrollView>(null);

  // setup form state
  const [nameInput, setNameInput] = useState('');
  const [reason, setReason] = useState('health');
  const [trigger, setTrigger] = useState('stress');
  const [goal, setGoal] = useState('30');

  const loadStats = async (): Promise<BuddyStats> => {
    const [p, streak, coins, xp, cravings] = await Promise.all([
      getProfile(), getStreak(), getCoins(), getXP(), getCravings(),
    ]);
    const days = p ? Math.floor((Date.now() - new Date(p.quitDate).getTime()) / 86400000) : 0;
    return {
      days, streak, coins,
      level: levelForXP(xp).level,
      cravingCount: cravings.length,
      beatenCount: cravings.filter((c) => c.beaten).length,
    };
  };

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const [bp, s] = await Promise.all([getBuddyProfile(), loadStats()]);
        setProfile(bp);
        setStats(s);
        if (bp) {
          setMsgs((m) => (m.length === 0 ? [{ id: Date.now(), from: 'buddy', text: buddyGreeting(bp, s) }] : m));
        }
      })();
    }, [])
  );

  const startBuddy = async () => {
    const bp: BuddyProfile = {
      userName: nameInput.trim(),
      quitReason: reason,
      goalDays: Math.max(1, Number(goal) || 30),
      mainTrigger: trigger,
    };
    await saveBuddyProfile(bp);
    setProfile(bp);
    const s = stats ?? (await loadStats());
    setStats(s);
    setMsgs([
      { id: Date.now(), from: 'buddy', text: `Nice to meet you, ${bp.userName || 'friend'}! I'm Bud 🌱` },
      { id: Date.now() + 1, from: 'buddy', text: buddyGreeting(bp, s) },
    ]);
  };

  const send = () => {
    const text = input.trim();
    if (!text || !stats) return;
    setInput('');
    const reply = buddyReply(text, profile, stats);
    setMsgs((m) => [
      ...m,
      { id: Date.now(), from: 'me', text },
      { id: Date.now() + 1, from: 'buddy', text: reply },
    ]);
    setTimeout(() => scroll.current?.scrollToEnd({ animated: true }), 100);
  };

  if (!profile) {
    return (
      <LinearGradient colors={themeDef.gradient} style={styles.bg}>
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Image source={mascot} style={styles.mascot} />
          <Text style={styles.title}>Meet Bud</Text>
          <Text style={styles.sub}>Your personal quit buddy. Let's tailor him to you.</Text>

          <View style={styles.card}>
            <Text style={styles.label}>What should Bud call you?</Text>
            <TextInput
              style={styles.input}
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Your name"
              placeholderTextColor="rgba(13,59,76,0.4)"
            />

            <Text style={styles.label}>Why are you quitting?</Text>
            <View style={styles.chipRow}>
              {REASONS.map((r) => (
                <Pressable key={r.id} style={[styles.chip, reason === r.id && styles.chipActive]} onPress={() => setReason(r.id)}>
                  <Text style={styles.chipText}>{r.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Your biggest trigger?</Text>
            <View style={styles.chipRow}>
              {TRIGGERS.map((t) => (
                <Pressable key={t.id} style={[styles.chip, trigger === t.id && styles.chipActive]} onPress={() => setTrigger(t.id)}>
                  <Text style={styles.chipText}>{t.label}</Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.label}>Goal (days clean)</Text>
            <TextInput
              style={styles.input}
              value={goal}
              onChangeText={setGoal}
              keyboardType="numeric"
              placeholder="30"
              placeholderTextColor="rgba(13,59,76,0.4)"
            />

            <Pressable style={styles.submit} onPress={startBuddy}>
              <Text style={styles.submitText}>Meet my buddy 🌱</Text>
            </Pressable>
          </View>
        </ScrollView>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient colors={themeDef.gradient} style={styles.bg}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={styles.header}>
          <Image source={mascot} style={styles.headerMascot} />
          <View>
            <Text style={styles.headerName}>Bud</Text>
            <Text style={styles.headerSub}>your quit buddy · always here</Text>
          </View>
        </View>

        <ScrollView
          ref={scroll}
          style={{ flex: 1 }}
          contentContainerStyle={styles.chat}
          onContentSizeChange={() => scroll.current?.scrollToEnd({ animated: false })}
        >
          {msgs.map((m) => (
            <View key={m.id} style={[styles.msgRow, m.from === 'me' && styles.msgRowMe]}>
              {m.from === 'buddy' && <Image source={mascot} style={styles.msgAvatar} />}
              <View style={[styles.bubble, m.from === 'me' ? styles.bubbleMe : styles.bubbleBuddy]}>
                <Text style={styles.bubbleText}>{m.text}</Text>
              </View>
            </View>
          ))}
        </ScrollView>

        <View style={styles.inputBar}>
          <TextInput
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
            placeholder="Tell Bud what's up…"
            placeholderTextColor="rgba(13,59,76,0.4)"
            onSubmitEditing={send}
          />
          <Pressable style={styles.sendBtn} onPress={send}>
            <Text style={styles.sendText}>➤</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20, paddingTop: 60, alignItems: 'center' },
  mascot: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: theme.glassHighlight },
  title: { fontSize: 30, fontWeight: '800', color: theme.textLight, marginTop: 10 },
  sub: { color: 'rgba(255,255,255,0.9)', marginTop: 4, marginBottom: 20, textAlign: 'center' },
  card: {
    width: '100%', backgroundColor: theme.glass, borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: theme.glassBorder,
  },
  label: { color: theme.textLight, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  input: {
    backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 14, padding: 12, color: theme.textDark,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.3)', borderWidth: 2, borderColor: 'transparent',
  },
  chipActive: { backgroundColor: theme.leafGreen, borderColor: 'rgba(255,255,255,0.6)' },
  chipText: { color: theme.textLight, fontWeight: '700', fontSize: 13 },
  submit: { marginTop: 20, backgroundColor: theme.sunshine, borderRadius: 18, padding: 14, alignItems: 'center' },
  submitText: { color: theme.textDark, fontWeight: '900', fontSize: 16 },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12,
  },
  headerMascot: { width: 48, height: 48, borderRadius: 24, borderWidth: 2, borderColor: theme.glassHighlight },
  headerName: { color: theme.textLight, fontWeight: '900', fontSize: 20 },
  headerSub: { color: 'rgba(255,255,255,0.85)', fontSize: 12 },
  chat: { padding: 16, paddingBottom: 8 },
  msgRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'flex-end' },
  msgRowMe: { justifyContent: 'flex-end' },
  msgAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 8 },
  bubble: { maxWidth: '78%', borderRadius: 18, padding: 12 },
  bubbleBuddy: { backgroundColor: 'rgba(255,255,255,0.9)', borderBottomLeftRadius: 4 },
  bubbleMe: { backgroundColor: theme.leafGreen, borderBottomRightRadius: 4 },
  bubbleText: { color: theme.textDark, fontSize: 15, lineHeight: 21 },
  inputBar: {
    flexDirection: 'row', gap: 10, padding: 12, paddingBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  chatInput: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.9)', borderRadius: 22,
    paddingHorizontal: 16, paddingVertical: 10, color: theme.textDark,
  },
  sendBtn: {
    width: 46, height: 46, borderRadius: 23, backgroundColor: theme.sunshine,
    alignItems: 'center', justifyContent: 'center',
  },
  sendText: { fontSize: 18, color: theme.textDark, fontWeight: '900' },
});
