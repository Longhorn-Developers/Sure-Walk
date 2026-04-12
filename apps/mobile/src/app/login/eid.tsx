import { useLoginSession } from "@/src/utils/context/login-context";
import { useEffect, useState } from "react";
import { View } from "react-native";
import FontText from "@/src/components/font-text";
import TextInputField from "@/src/components/text-input-field";
import LargeButton from "@/src/components/large-button";
import { router } from "expo-router";

const EID = () => {
  const { eid, setEid } = useLoginSession();

  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const valid = (eid ?? "").trim().length > 3;
    setIsValid(valid);
  }, [eid]);

  return (
    <View className="flex-1 bg-white px-5 pt-8">
      <FontText className="text-2xl font-medium mb-2">
        What’s your UT EID?
      </FontText>
      <FontText className="text-lg mb-12">
        This helps us know who we’re picking up.
      </FontText>
      <View className="flex-1 gap-4 flex-col justify-start">
        <TextInputField
          fieldName="UT EID"
          value={eid}
          onChangeText={setEid}
          maxLength={10}
          placeholder="UT EID"
        />
      </View>
      <LargeButton
        title="Continue"
        onPress={() => {
          router.navigate("/login/assistance");
        }}
        disabled={!isValid}
      ></LargeButton>
    </View>
  );
};

export default EID;
