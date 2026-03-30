import CheckButton from "@/src/components/check-button";
import GuidelinesList from "@/src/components/guidelines-list";
import LargeButton from "@/src/components/large-button";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontText from "@/src/components/font-text";
import { useSession } from "@/src/utils/context/user-context";

const Guidelines = () => {
  const { acceptGuidelines } = useSession();
  const [checked, setChecked] = useState(false);

  const updateUserAndContinue = async () => {
    await acceptGuidelines();
    router.replace("/home");
  };

  return (
    <View className="flex-1 bg-white pt-8">
      <View className="bg-white">
        <FontText className="text-2xl font-medium mb-2 px-5 z-10">
          Information and Guidelines
        </FontText>
        <FontText className="text-lg px-5 z-10">
          Read and accept to continue.
        </FontText>
      </View>
      <View className="relative flex-1 p-0">
        <LinearGradient
          colors={["#ffffffff", "#ffffff00"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 16,
            zIndex: 10,
          }}
        />
        <LinearGradient
          colors={["#ffffff00", "#ffffffff"]}
          style={{
            position: "absolute",
            bottom: -1,
            left: 0,
            right: 0,
            height: 32,
            zIndex: 10,
          }}
        />
        <ScrollView className="flex-col">
          <GuidelinesList includeBottomBorder />
          <View className="pt-6 px-5 pb-[38px]">
            <CheckButton
              label="I have read and accept the guidelines."
              isChecked={checked}
              onPress={() => setChecked(!checked)}
            />
          </View>
        </ScrollView>
      </View>
      <View className="px-5 mt-2">
        <LargeButton
          title="Continue"
          onPress={updateUserAndContinue}
          disabled={!checked}
        />
      </View>
    </View>
  );
};

export default Guidelines;
