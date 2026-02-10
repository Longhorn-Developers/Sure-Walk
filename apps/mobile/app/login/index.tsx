import { useSession } from "@/utils/context/user-context";
import { Link } from "expo-router";
import { Text, View } from "react-native";

const Index = () => {
  const { setUser } = useSession();

  const placeholderLogin = () => {
    setUser({
      id: "123",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "123-456-7890",
      requiresAssistance: true,
      eid: "jd4321",
    });
  };

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-lg">Login Page</Text>
      <Link className="mt-4" onPress={placeholderLogin} replace href="/">
        Click here to login
      </Link>
    </View>
  );
};

export default Index;
