import { SplashScreen, Tabs } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform } from "react-native";
import {
  ClipboardTextIcon,
  UserCircleIcon,
  HouseIcon,
} from "phosphor-react-native";
import {
  Geist_100Thin,
  Geist_200ExtraLight,
  Geist_300Light,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
  Geist_900Black,
  useFonts,
} from "@expo-google-fonts/geist";
import { useEffect } from "react";

SplashScreen.preventAutoHideAsync();

const _layout = () => {
  let paddingBottom: number = useSafeAreaInsets().bottom;

  const [loaded, error] = useFonts({
    Geist_100Thin,
    Geist_200ExtraLight,
    Geist_300Light,
    Geist_400Regular,
    Geist_500Medium,
    Geist_600SemiBold,
    Geist_700Bold,
    Geist_800ExtraBold,
    Geist_900Black,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          paddingTop: 8,
          minHeight: Platform.OS !== "ios" ? 64 + paddingBottom : undefined,
          paddingBottom: paddingBottom,
          boxShadow: "none",
          borderTopColor: "#E2E8F0",
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: "Geist_400Regular",
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
