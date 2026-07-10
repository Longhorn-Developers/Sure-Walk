import { Redirect, SplashScreen, Tabs, useSegments } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Platform, View, ActivityIndicator } from "react-native";
import { UserCircleIcon, HouseIcon, CarIcon } from "phosphor-react-native";
import { useSession } from "@/src/utils/context/user-context";
import { useEffect } from "react";
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
import { slate200, slate900, UTBurntOrange } from "@/src/utils/colors";
import { useTabContext } from "@/src/utils/context/tab-context";

SplashScreen.preventAutoHideAsync();

const _layout = () => {
  let paddingBottom: number = useSafeAreaInsets().bottom;

  const { loadingState, user, guidelinesAccepted } = useSession();
  const { goHome, goMyRide, activeTab } = useTabContext();
  const segments = useSegments();

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
    if (loadingState !== "loading" && (loaded || error)) {
      SplashScreen.hideAsync();
    }
  }, [loadingState, loaded, error]);

  if (loadingState === "loading" || (!loaded && !error)) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={UTBurntOrange} />
      </View>
    );
  }

  if (user === null) {
    return <Redirect href="/login" />;
  }

  if (!guidelinesAccepted) {
    return <Redirect href="/login/guidelines" />;
  }

  return (
    <Tabs
      screenOptions={{
        tabBarStyle: {
          paddingTop: 8,
          minHeight: Platform.OS !== "ios" ? 64 + paddingBottom : undefined,
          paddingBottom: paddingBottom,
          boxShadow: "none",
          borderTopColor: slate200,
          borderTopWidth: 1,
        },
        tabBarLabelStyle: {
          fontFamily: "Geist_400Regular",
          fontSize: 12,
          paddingTop: 2,
          color: slate900,
        },
        tabBarIconStyle: {
          color: slate900,
        },
      }}
      screenListeners={{
        tabPress: (e) => {
          // don't show animation when currently on profile tab
          let instant = false;
          // @ts-ignore
          if (segments.includes("profile")) {
            instant = true;
          }

          if (e.target?.startsWith("home-")) {
            goHome(instant);
          }

          if (e.target?.includes("my-ride")) {
            e.preventDefault();
            goMyRide(instant);
          }
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          headerShown: false,
          tabBarLabel: "Home",
          tabBarIcon: () => (
            <HouseIcon
              size={32}
              weight={
                // @ts-ignore
                segments.includes("home") && activeTab === "home"
                  ? "fill"
                  : "regular"
              }
            />
          ),
        }}
      />
      <Tabs.Screen
        name="(my-ride)/index"
        options={{
          headerShown: false,
          tabBarLabel: "My Ride",
          tabBarIcon: () => (
            <CarIcon
              size={32}
              weight={
                // @ts-ignore
                segments.includes("home") && activeTab === "my-ride"
                  ? "fill"
                  : "regular"
              }
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
