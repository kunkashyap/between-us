import React from 'react';
import { View, Text, StyleSheet, Pressable, Platform } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { BookOpen, MapPin, Plus, Sparkles, MoreHorizontal } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export const BottomNavBar: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  const isTabActive = (route: string) => {
    if (route === '/(app)/(timeline)' || route === '/(timeline)') {
      return pathname.includes('/(timeline)') || pathname === '/' || pathname === '/(app)';
    }
    return pathname.includes(route);
  };

  return (
    <View style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      {/* TIMELINE */}
      <Pressable
        style={styles.tabItem}
        onPress={() => router.push('/(app)/(timeline)' as any)}
        accessibilityRole="tab"
        accessibilityLabel="Timeline tab"
      >
        <BookOpen
          size={18}
          color={isTabActive('/(timeline)') ? Colors.text : Colors.textMuted}
          strokeWidth={1.5}
        />
        <Text
          style={[
            styles.tabLabel,
            isTabActive('/(timeline)') ? styles.tabLabelActive : null,
          ]}
        >
          TIMELINE
        </Text>
      </Pressable>

      {/* PLACES */}
      <Pressable
        style={styles.tabItem}
        onPress={() => router.push('/(app)/places' as any)}
        accessibilityRole="tab"
        accessibilityLabel="Places tab"
      >
        <MapPin
          size={18}
          color={isTabActive('places') ? Colors.text : Colors.textMuted}
          strokeWidth={1.5}
        />
        <Text
          style={[
            styles.tabLabel,
            isTabActive('places') ? styles.tabLabelActive : null,
          ]}
        >
          PLACES
        </Text>
      </Pressable>

      {/* CENTER ADD (+) */}
      <Pressable
        style={styles.addButton}
        onPress={() => router.push('/(app)/(timeline)/memory/create' as any)}
        accessibilityRole="button"
        accessibilityLabel="Add memory"
      >
        <View style={styles.addCircle}>
          <Plus size={20} color={Colors.text} strokeWidth={1.75} />
        </View>
      </Pressable>

      {/* LITTLE THINGS */}
      <Pressable
        style={styles.tabItem}
        onPress={() => router.push('/(app)/little-things' as any)}
        accessibilityRole="tab"
        accessibilityLabel="Little things tab"
      >
        <Sparkles
          size={18}
          color={isTabActive('little-things') ? Colors.text : Colors.textMuted}
          strokeWidth={1.5}
        />
        <Text
          style={[
            styles.tabLabel,
            isTabActive('little-things') ? styles.tabLabelActive : null,
          ]}
        >
          LITTLE THINGS
        </Text>
      </Pressable>

      {/* MORE */}
      <Pressable
        style={styles.tabItem}
        onPress={() => router.push('/(app)/more' as any)}
        accessibilityRole="tab"
        accessibilityLabel="More tab"
      >
        <MoreHorizontal
          size={18}
          color={isTabActive('more') ? Colors.text : Colors.textMuted}
          strokeWidth={1.5}
        />
        <Text
          style={[
            styles.tabLabel,
            isTabActive('more') ? styles.tabLabelActive : null,
          ]}
        >
          MORE
        </Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: 10,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 4,
  },
  tabLabel: {
    fontSize: 9,
    letterSpacing: 1.2,
    color: Colors.textMuted,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.text,
  },
  addButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.surfaceElevated,
    borderWidth: 1,
    borderColor: Colors.borderStrong,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
