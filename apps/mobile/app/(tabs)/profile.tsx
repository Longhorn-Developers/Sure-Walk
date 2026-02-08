import { Text, View } from "react-native";
import { useSession } from "@/utils/context/user-context";

const Profile = () => {
  const { user, loadingState } = useSession();

  return (
    <View className="bg-white flex-1">
      <Text>Profile</Text>
      {loadingState === "loading" && <Text>Loading...</Text>}
      {loadingState === "error" && <Text>Error loading user info</Text>}
      {loadingState === "done" && (
        <Text>
          Name: {user?.firstName} {user?.lastName}
        </Text>
      )}
    </View>
  );
};

export default Profile;
