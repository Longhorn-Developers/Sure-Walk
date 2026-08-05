import { SplashScreen, Stack } from "expo-router";
import "../app/globals.css";
import { Platform, View } from "react-native";
import { SessionProvider } from "@/src/utils/context/user-context";
import { useEffect } from "react";
import * as NavigationBar from "expo-navigation-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { configureReanimatedLogger } from "react-native-reanimated";
import { GroupRideProvider } from "../utils/context/group-ride-context";
import { RideProvider } from "../utils/context/ride-context";
import { TabProvider } from "../utils/context/tab-context";
import { CurrentRideProvider } from "../utils/context/current-ride-context";
import { RideDetailsProvider } from "../utils/context/ride-details-context";
import { MissedRideProvider } from "../utils/context/missed-ride-context";
import { ToastProvider } from "../utils/context/toast-context";
import { KeyboardProvider } from "react-native-keyboard-controller";

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
        <ToastProvider>
          <GestureHandlerRootView>
            <TabProvider>
              <SessionProvider>
                <CurrentRideProvider>
                  <RideDetailsProvider>
                    <MissedRideProvider>
                      <RideProvider>
                        <GroupRideProvider>
                          <Stack screenOptions={{ headerShown: false }}>
                            <Stack.Screen
                              name="(tabs)"
                              options={{
                                headerShown: false,
                              }}
                            />
                            <Stack.Screen
                              name="cancellation-reason"
                              options={{ presentation: "fullScreenModal" }}
                            />
                          </Stack>
                        </GroupRideProvider>
                      </RideProvider>
                    </MissedRideProvider>
                  </RideDetailsProvider>
                </CurrentRideProvider>
              </SessionProvider>
            </TabProvider>
          </GestureHandlerRootView>
        </ToastProvider>
      </KeyboardProvider>
    </View>
  );
}
