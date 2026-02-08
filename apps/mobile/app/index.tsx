import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { Redirect } from "expo-router";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";
import { useSession } from "@/utils/context/user-context";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const { loadingState, user } = useSession();

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

  useEffect(() => {
    if (loadingState === "done") {
      SplashScreen.hideAsync();
    }
  }, [loadingState]);

  if (loadingState === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <Text className="text-lg">Loading...</Text>
      </View>
    );
  }

  if (user !== null) {
    return <Redirect href="/home" />;
  }

  return <Redirect href="/login" />;
}
