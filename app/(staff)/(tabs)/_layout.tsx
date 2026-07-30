import React, { useEffect } from 'react';
import { Tabs } from 'expo-router';
import { View, Text, StyleSheet, Platform, TouchableOpacity, Dimensions } from 'react-native';
import { Briefcase, History, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const TABBAR_MARGIN = 45;
const TABBAR_WIDTH = SCREEN_WIDTH - TABBAR_MARGIN * 2;

const ACTIVE_COLOR = '#3D3635';
const INACTIVE_COLOR = '#9A9A9A';

const ICONS: Record<string, typeof Briefcase> = {
  index: Briefcase,
  history: History,
  profile: User,
};

// 懸浮玻璃擬態 Tab Bar：BlurView 毛玻璃 + Reanimated 滑塊動畫（比照 iOS 26 Liquid Glass 風格）
function GlassTabBar({ state, descriptors, navigation }: any) {
  const routes = state.routes;
  const tabWidth = TABBAR_WIDTH / routes.length;
  const translateX = useSharedValue(state.index * tabWidth);

  useEffect(() => {
    translateX.value = withSpring(state.index * tabWidth, {
      damping: 26,
      stiffness: 160,
    });
  }, [state.index, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value + 4 }],
  }));

  return (
    <View style={styles.tabBarWrapper}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint={Platform.OS === 'ios' ? 'systemUltraThinMaterialLight' : 'light'}
        style={StyleSheet.absoluteFill}
      >
        <View style={styles.contentContainer}>
          <Animated.View style={[styles.pillIndicator, { width: tabWidth - 8 }, indicatorStyle]} />

          {routes.map((route: any, index: number) => {
            const { options } = descriptors[route.key];
            const isFocused = state.index === index;
            const Icon = ICONS[route.name] ?? Briefcase;

            const onPress = () => {
              if (Platform.OS === 'ios') {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              }
              const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name, route.params);
              }
            };

            return (
              <TouchableOpacity key={route.key} onPress={onPress} style={styles.tabItem} activeOpacity={0.85}>
                <View style={styles.iconTextWrapper}>
                  <Icon size={20} color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR} />
                  <Text style={[styles.tabLabel, { color: isFocused ? ACTIVE_COLOR : INACTIVE_COLOR }]}>
                    {options.title}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

export default function StaffTabsLayout() {
  return (
    <Tabs tabBar={(props) => <GlassTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: '案件' }} />
      <Tabs.Screen name="history" options={{ title: '歷史' }} />
      <Tabs.Screen name="profile" options={{ title: '自己' }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarWrapper: {
    position: 'absolute',
    bottom: 30,
    left: TABBAR_MARGIN,
    right: TABBAR_MARGIN,
    height: 64,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'transparent',
    borderWidth: 0.6,
    borderColor: 'rgba(255,255,255,0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'relative',
  },
  tabItem: {
    flex: 1,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  iconTextWrapper: { alignItems: 'center', justifyContent: 'center', gap: 3 },
  pillIndicator: {
    position: 'absolute',
    height: 46,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 23,
    zIndex: 1,
  },
  tabLabel: { fontSize: 10, fontWeight: '700' },
});
