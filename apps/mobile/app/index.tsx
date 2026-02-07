import * as NavigationBar from "expo-navigation-bar";
import * as SplashScreen from "expo-splash-screen";
import { Link } from "expo-router";
import { useEffect } from "react";
import { Platform, Text, View } from "react-native";

SplashScreen.preventAutoHideAsync();

export default function Index() {
  const configureNavbarAndroid = async () => {
    if (Platform.OS === "android") {
      await NavigationBar.setPositionAsync("absolute");
      await NavigationBar.setBackgroundColorAsync("#ffffff00");
      await NavigationBar.setButtonStyleAsync("dark");
    }
    await SplashScreen.hideAsync();
  };

  useEffect(() => {
    configureNavbarAndroid();
  }, []);

  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-5xl text-ut-burntorange font-bold">
        Login (placeholder)
      </Text>
      <Link replace href="/(tabs)/home">
        <Text className="text-2xl text-ut-burntorange font-bold">
          Skip to Home
        </Text>
      </Link>
    </View>
  );
}
