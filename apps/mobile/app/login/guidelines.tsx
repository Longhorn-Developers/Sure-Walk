import CheckButton from "@/components/check-button";
import GuidelinesList from "@/components/guidelines-list";
import LargeButton from "@/components/large-button";
import { useLoginSession } from "@/utils/context/login-context";
import { useSession } from "@/utils/context/user-context";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import FontText from "@/components/font-text";

const Guidelines = () => {
  const { firstName, lastName, phoneNumber, requiresAssistance, userType } =
    useLoginSession();
  const { setUser } = useSession();
  const [checked, setChecked] = useState(false);

  const updateUserAndContinue = () => {
    let eid = undefined;
    if (userType === "ut-affiliated") {
      eid = "asdf1234"; // TODO: Get real EID
    }
    setUser({
      id: "123",
      firstName,
      lastName,
      phoneNumber,
      requiresAssistance: requiresAssistance!,
      eid,
      userType: userType!,
    });
    router.replace("/home");
  };

  return (
    <View className="flex-1 bg-white">
      <View className="bg-white">
        <FontText className="text-3xl font-medium mb-2 px-5 z-10">
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
            bottom: 0,
            left: 0,
            right: 0,
            height: 32,
            zIndex: 10,
          }}
        />
        <ScrollView className="flex-col">
          <GuidelinesList includeBottomBorder />
          <View className="pt-6 px-5 pb-[46px]">
            <CheckButton
              label="I have read and accept the guidelines."
              isChecked={checked}
              onPress={() => setChecked(!checked)}
            />
          </View>
        </ScrollView>
      </View>
      <View className="px-5">
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
