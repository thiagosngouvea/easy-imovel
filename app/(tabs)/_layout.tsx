import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import React from 'react';

import { useClientOnlyValue } from '@/src/components/useClientOnlyValue';
import { useColorScheme } from '@/src/components/useColorScheme';
import Colors from '@/src/constants/Colors';
import { Platform } from 'react-native';

// You can explore the built-in icon families and icons on the web at https://icons.expo.fyi/
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: useClientOnlyValue(false, true),
        tabBarStyle: {
          backgroundColor: "#ffffff",
          paddingBottom: 6,
          paddingTop: 6,
          height: Platform.OS === "ios" ? 80 : 60,
          display: "flex",
          alignItems: "center",
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Explorar',
          tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />,
          headerShown: false,
          tabBarLabel: 'Explorar',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "400",
            marginBottom: Platform.OS === "ios" ? 15 : 0,
          },
          tabBarActiveBackgroundColor: "#ffffff",
          tabBarActiveTintColor: "#FB923C",
          tabBarInactiveTintColor: "#A0A0A0",
        }}
      />
      <Tabs.Screen
        name="details"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <TabBarIcon name="heart" color={color} />,
          headerShown: false,
          tabBarLabel: 'Favoritos',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "400",
            marginBottom: Platform.OS === "ios" ? 15 : 0,
          },
          tabBarActiveBackgroundColor: "#ffffff",
          tabBarActiveTintColor: "#FB923C",
          tabBarInactiveTintColor: "#A0A0A0",
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          title: 'Menu',
          tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />,
          headerShown: false,
          tabBarLabel: 'Menu',
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: "400",
            marginBottom: Platform.OS === "ios" ? 15 : 0,
          },
          tabBarActiveBackgroundColor: "#ffffff",
          tabBarActiveTintColor: "#FB923C",
          tabBarInactiveTintColor: "#A0A0A0",
          tabBarIconStyle: {
            marginBottom: 0,
          },
        }}
      />
    </Tabs>
  );
}
