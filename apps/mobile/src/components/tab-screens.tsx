import {
  useFonts,
  Geist_100Thin,
  Geist_200ExtraLight,
  Geist_300Light,
  Geist_400Regular,
  Geist_500Medium,
  Geist_600SemiBold,
  Geist_700Bold,
  Geist_800ExtraBold,
  Geist_900Black,
} from "@expo-google-fonts/geist";
import { useSegments, SplashScreen, Redirect, Tabs } from "expo-router";
import { HouseIcon, CarIcon, UserCircleIcon } from "phosphor-react-native";
import { useEffect } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { UTBurntOrange, slate200, slate900 } from "../utils/colors";
import { useCurrentRideSession } from "../utils/context/current-ride-context";
import { GroupRideProvider } from "../utils/context/group-ride-context";
import { MissedRideProvider } from "../utils/context/missed-ride-context";
import { RideProvider } from "../utils/context/ride-context";
import { RideDetailsProvider } from "../utils/context/ride-details-context";
import { useTabContext } from "../utils/context/tab-context";
import { useSession } from "../utils/context/user-context";
import FontText from "./font-text";

const TabScreens = () => {
  let paddingBottom: number = useSafeAreaInsets().bottom;

  const { loadingState, user, guidelinesAccepted } = useSession();
  const { loadingState: rideLoadingState } = useCurrentRideSession();
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
    if (
      loadingState !== "loading" &&
      rideLoadingState !== "loading" &&
      (loaded || error)
    ) {
      setTimeout(() => SplashScreen.hideAsync(), 200);
    }
  }, [loadingState, rideLoadingState, loaded, error]);

  if (
    loadingState === "loading" ||
    rideLoadingState === "loading" ||
    (!loaded && !error)
  ) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator size="large" color={UTBurntOrange} />
      </View>
    );
  }

  if (loadingState === "error") {
    // network issues
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <FontText className="text-2xl font-medium">No internet</FontText>
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
    <RideDetailsProvider>
      <MissedRideProvider>
        <RideProvider>
          <GroupRideProvider>
            <Tabs
              screenOptions={{
                tabBarStyle: {
                  paddingTop: 8,
                  minHeight:
                    Platform.OS !== "ios" ? 64 + paddingBottom : undefined,
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
                    <UserCircleIcon
                      size={32}
                      weight={focused ? "fill" : "regular"}
                    />
                  ),
                }}
              />
              <Tabs.Screen
                name="(my-ride)/current-ride-info"
                options={{ href: null }}
              />
            </Tabs>
          </GroupRideProvider>
        </RideProvider>
      </MissedRideProvider>
    </RideDetailsProvider>
  );
};

export default TabScreens;
