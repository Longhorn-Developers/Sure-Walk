import "../app/globals.css";

import * as NavigationBar from "expo-navigation-bar";
import { SplashScreen, Stack } from "expo-router";
import { useEffect } from "react";
import { Platform, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { configureReanimatedLogger } from "react-native-reanimated";

import { SessionProvider } from "@/src/utils/context/user-context";

import { ToastProvider } from "../utils/context/toast-context";

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
      <KeyboardProvider>
        <GestureHandlerRootView>
          <ToastProvider>
            <SessionProvider>
              <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen
                  name="(tabs)"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="login"
                  options={{
                    headerShown: false,
                  }}
                />
                <Stack.Screen
                  name="cancellation-reason"
                  options={{ presentation: "containedModal" }}
                />
                <Stack.Screen
                  name="feedback"
                  options={{ presentation: "containedModal" }}
                />
              </Stack>
            </SessionProvider>
          </ToastProvider>
        </GestureHandlerRootView>
      </KeyboardProvider>
    </View>
  );
}
