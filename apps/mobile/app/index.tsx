import { Link } from "expo-router";
import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-white">
      <Text className="text-5xl text-ut-burntorange font-bold">
        Edit app/index.tsx to edit this screen.
      </Text>
      <Link href="/(tabs)/home">
        <Text className="text-2xl text-ut-burntorange font-bold">
          Go to Home Page!
        </Text>
      </Link>
    </View>
  );
}
