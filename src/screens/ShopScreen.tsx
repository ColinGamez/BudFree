import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import { theme } from '../theme';
import { THEMES, ThemeDef } from '../themes';
import { getCoins, getOwnedThemes, getEquippedTheme, buyTheme, equipTheme } from '../storage';
import { useAppTheme } from '../ThemeContext';

export default function ShopScreen() {
  const [coins, setCoins] = useState(0);
  const [owned, setOwned] = useState<string[]>(['aero']);
  const [equipped, setEquipped] = useState('aero');
  const { themeDef, reloadTheme } = useAppTheme();

  const refresh = async () => {
    setCoins(await getCoins());
    setOwned(await getOwnedThemes());
    setEquipped(await getEquippedTheme());
  };

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [])
  );

  const onPressItem = async (item: ThemeDef) => {
    const isOwned = owned.includes(item.id);
    if (isOwned) {
      await equipTheme(item.id);
      await reloadTheme();
      await refresh();
      return;
    }
    if (coins < item.price) {
      Alert.alert('Not enough coins 🪙', `You need ${item.price - coins} more coins. Beat cravings and hit milestones to earn more!`);
      return;
    }
    const ok = await buyTheme(item.id, item.price);
    if (ok) {
      await equipTheme(item.id);
      await reloadTheme();
      await refresh();
      Alert.alert('Unlocked! 🎉', `${item.name} is now equipped.`);
    }
  };

  return (
    <LinearGradient colors={themeDef.gradient} style={styles.bg}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>🛍️ Reward Shop</Text>
        <View style={styles.coinPill}>
          <Text style={styles.coinText}>🪙 {coins} coins</Text>
        </View>

        {THEMES.map((item) => {
          const isOwned = owned.includes(item.id);
          const isEquipped = equipped === item.id;
          return (
            <Pressable key={item.id} style={styles.card} onPress={() => onPressItem(item)}>
              <LinearGradient colors={item.gradient} style={styles.preview}>
                <Text style={styles.previewEmoji}>{item.emoji}</Text>
              </LinearGradient>
              <View style={styles.cardBody}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
              <View style={[styles.pricePill, isEquipped && styles.equippedPill]}>
                <Text style={styles.priceText}>
                  {isEquipped ? '✓ Equipped' : isOwned ? 'Equip' : `🪙 ${item.price}`}
                </Text>
              </View>
            </Pressable>
          );
        })}

        <Text style={styles.hint}>Earn coins by beating cravings, keeping streaks, and unlocking badges.</Text>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1 },
  container: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: theme.textLight, textAlign: 'center' },
  coinPill: {
    alignSelf: 'center', backgroundColor: 'rgba(255,255,255,0.3)', borderRadius: 20,
    paddingVertical: 8, paddingHorizontal: 20, marginTop: 12, marginBottom: 20,
    borderWidth: 1, borderColor: theme.glassBorder,
  },
  coinText: { color: theme.textLight, fontWeight: '800', fontSize: 16 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: theme.glass,
    borderRadius: 20, marginBottom: 12, overflow: 'hidden',
    borderWidth: 1, borderColor: theme.glassBorder,
  },
  preview: { width: 72, height: 72, justifyContent: 'center', alignItems: 'center' },
  previewEmoji: { fontSize: 32 },
  cardBody: { flex: 1, paddingHorizontal: 14 },
  itemName: { color: theme.textLight, fontWeight: '800', fontSize: 16 },
  itemDesc: { color: 'rgba(255,255,255,0.85)', fontSize: 12, marginTop: 2 },
  pricePill: {
    backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 16,
    paddingVertical: 8, paddingHorizontal: 12, marginRight: 12,
  },
  equippedPill: { backgroundColor: theme.leafGreen },
  priceText: { color: theme.textLight, fontWeight: '800', fontSize: 13 },
  hint: { color: 'rgba(255,255,255,0.85)', textAlign: 'center', marginTop: 16, fontSize: 12 },
});
