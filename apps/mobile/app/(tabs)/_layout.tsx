import { Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import {
  ClipboardTextIcon,
  UserCircleIcon,
  HouseIcon,
} from "phosphor-react-native";

const _layout = () => {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          paddingTop: 8,
          minHeight:
            Platform.OS !== "ios" ? 64 + useSafeAreaInsets().bottom : undefined,
          paddingBottom: useSafeAreaInsets().bottom,
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
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: ({ focused }) => (
            <HouseIcon size={32} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
      <Tabs.Screen
        name="guidelines"
        options={{
          headerShown: false,
          tabBarLabel: "Guidelines",
          tabBarIcon: ({ focused }) => (
            <ClipboardTextIcon
              size={32}
              weight={focused ? "fill" : "regular"}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          tabBarLabel: "Profile",
          tabBarIcon: ({ focused }) => (
            <UserCircleIcon size={32} weight={focused ? "fill" : "regular"} />
          ),
        }}
      />
    </Tabs>
  );
};

export default _layout;
