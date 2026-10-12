import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { getProfile } from './src/storage';
import { theme } from './src/theme';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import PanicScreen from './src/screens/PanicScreen';
import ShopScreen from './src/screens/ShopScreen';
import CravingsScreen from './src/screens/CravingsScreen';
import { ThemeProvider } from './src/ThemeContext';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: 'transparent' },
};

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function App() {
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  const check = async () => {
    const p = await getProfile();
    setHasProfile(!!p);
    setLoading(false);
  };

  useEffect(() => {
    check();
  }, []);

  if (loading) {
    return (
      <LinearGradient colors={[theme.gradientTop, theme.gradientMid, theme.gradientBottom]} style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator color="#fff" size="large" />
      </LinearGradient>
    );
  }

  if (!hasProfile) {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onDone={() => setHasProfile(true)} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NavigationContainer theme={navTheme}>
          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: {
                backgroundColor: 'rgba(255,255,255,0.85)',
                borderTopWidth: 0,
                height: 64,
                paddingBottom: 8,
              },
              tabBarActiveTintColor: theme.deepGreen,
              tabBarInactiveTintColor: '#7a9aa8',
            }}
          >
            <Tab.Screen
              name="Home"
              component={HomeScreen}
              options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏠" focused={focused} /> }}
            />
            <Tab.Screen
              name="Panic"
              component={PanicScreen}
              options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🆘" focused={focused} /> }}
            />
            <Tab.Screen
              name="Badges"
              component={AchievementsScreen}
              options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🏅" focused={focused} /> }}
            />
            <Tab.Screen
              name="Log"
              component={CravingsScreen}
              options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🌊" focused={focused} /> }}
            />
            <Tab.Screen
              name="Shop"
              component={ShopScreen}
              options={{ tabBarIcon: ({ focused }) => <TabIcon emoji="🛍️" focused={focused} /> }}
            />
          </Tab.Navigator>
        </NavigationContainer>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
