import { Stack } from "expo-router";
import "../app/globals.css";
import { View } from "react-native";
import { SessionProvider } from "@/utils/context/user-context";

export default function RootLayout() {
  return (
    <View className="flex-1 bg-white pt-safe">
      <SessionProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="(tabs)"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </SessionProvider>
    </View>
  );
}
