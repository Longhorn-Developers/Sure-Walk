import { Stack } from "expo-router";
import "../app/globals.css";
import { View } from "react-native";

export default function RootLayout() {
  return (
    <View className="flex-1 bg-white pt-safe">
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </View>
  );
}
