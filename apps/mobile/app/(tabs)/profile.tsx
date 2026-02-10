import { Text, View } from "react-native";
import { useSession } from "@/utils/context/user-context";
import { Link } from "expo-router";

const Profile = () => {
  const { user, loadingState, logOut } = useSession();

  return (
    <View className="bg-white flex-1">
      <Text>Profile</Text>
      {loadingState === "loading" && <Text>Loading...</Text>}
      {loadingState === "error" && <Text>Error loading user info</Text>}
      {loadingState === "done" && (
        <View className="mt-4">
          <Text>
            Name: {user?.firstName} {user?.lastName}
          </Text>
          <Link replace href="/" onPress={logOut}>
            Log out
          </Link>
        </View>
      )}
    </View>
  );
};

export default Profile;
