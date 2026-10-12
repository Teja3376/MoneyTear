import React from "react";
import { Tabs } from "expo-router";

import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";

export default function AppTabs() {
  return (
    <Tabs
      screenOptions={{
        header: () => <AppHeader />,
        headerShown: true,
      }}
      tabBar={(props) => <BottomNavigation {...props} />}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="category"
        options={{
          title: "Category",
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
