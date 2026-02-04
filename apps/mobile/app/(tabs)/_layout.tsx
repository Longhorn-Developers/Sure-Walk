import { Tabs } from "expo-router";
import Feather from "@expo/vector-icons/Feather";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          paddingTop: 8,
          height: 64,
          boxShadow: "none",
          borderTopColor: "#E2E8F0",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: "Geist", // TODO: actually use the font
          fontSize: 12,
          paddingTop: 2,
          color: "#0F172A",
        },
        tabBarIconStyle: {
          color: "#0F172A",
        }
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: () => (
            <Feather name="home" size={28} /> // TODO: get clarification on icon libraries
          ),
        }}
      />
      <Tabs.Screen
        name="guidelines"
        options={{
          headerShown: false,
          tabBarLabel: "Guidelines",
          tabBarIcon: () => (
            <Feather name="clipboard" size={28} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarLabel: "Profile",
          tabBarIcon: () => (
            <Feather name="user" size={28} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
