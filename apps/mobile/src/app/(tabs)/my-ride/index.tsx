import FontText from "@/src/components/font-text";
import LargeButton from "@/src/components/large-button";
import TextInputField from "@/src/components/text-input-field";
import { router } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

const MyRide = () => {
  const [code, setCode] = useState<string>("");

  return (
    <View className="bg-white flex-1 flex-col pt-safe px-5">
      <FontText className="text-2xl font-medium mt-[34px]">My Ride</FontText>
      <FontText className="text-lg font-normal mt-2 mb-6">
        No active rides currently.
      </FontText>
      <LargeButton title="Book Ride" onPress={() => router.navigate("/home")} />
      <FontText className="text-2xl font-medium mt-10">Join a Ride</FontText>
      <FontText className="text-lg font-normal mt-2 mb-6">
        Enter the ride code shared by your group leader.
      </FontText>
      <TextInputField
        placeholder="ABC123"
        autoCapitalize={"characters"}
        value={code}
        onChangeText={(text) => setCode(text.toUpperCase())}
      />
    </View>
  );
};

export default MyRide;
