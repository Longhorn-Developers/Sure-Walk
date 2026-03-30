import { View } from "react-native";
import FontText from "@/src/components/font-text";
import { useSession } from "@/src/utils/context/user-context";
import { Link } from "expo-router";

const Profile = () => {
  const { user, loadingState, logOut } = useSession();

  return (
    <View className="bg-white flex-1">
      <FontText>Profile</FontText>
      {loadingState === "loading" && <FontText>Loading...</FontText>}
      {loadingState === "error" && <FontText>Error loading user info</FontText>}
      {loadingState === "done" && (
        <View className="mt-4">
          <FontText>
            Name: {user?.firstName} {user?.lastName}
          </FontText>
          <Link
            replace
            href="/login"
            onPress={() => {
              logOut();
            }}
          >
            Log out
          </Link>
        </View>
      )}
    </View>
  );
};

export default Profile;
