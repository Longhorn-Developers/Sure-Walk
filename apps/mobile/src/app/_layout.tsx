import { SplashScreen, Stack } from "expo-router";
import "../app/globals.css";
import { Platform, View } from "react-native";
import { SessionProvider } from "@/src/utils/context/user-context";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configureReanimatedLogger } from "react-native-reanimated";
import { GroupRideProvider } from "../utils/context/group-ride-context";

configureReanimatedLogger({ strict: false });

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const configureNavbarAndroid = async () => {
    if (Platform.OS === "android") {
      await NavigationBar.setPositionAsync("absolute");
      await NavigationBar.setBackgroundColorAsync("#ffffff00");
      await NavigationBar.setButtonStyleAsync("dark");
    }
  };

  useEffect(() => {
    configureNavbarAndroid();
  }, []);

  return (
    <View className="bg-white h-full w-full">
      <View className="flex-1 bg-white">
        <GestureHandlerRootView>
          <SessionProvider>
            <GroupRideProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerShown: false,
                  }}
                />
              </Stack>
            </GroupRideProvider>
          </SessionProvider>
        </GestureHandlerRootView>
      </View>
    </View>
  );
}
