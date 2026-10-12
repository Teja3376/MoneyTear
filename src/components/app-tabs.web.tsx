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
        name="explore"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}
