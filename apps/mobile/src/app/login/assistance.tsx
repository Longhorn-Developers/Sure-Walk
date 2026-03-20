import LargeButton from "@/src/components/large-button";
import RadioButton from "@/src/components/radio-button";
import { useLoginSession } from "@/src/utils/context/login-context";
import { router } from "expo-router";
import { View } from "react-native";
import FontText from "@/src/components/font-text";

const Assistance = () => {
  const { requiresAssistance, setRequiresAssistance } = useLoginSession();

  return (
    <View className="flex-1 bg-white px-5 pt-8">
      <FontText className="text-2xl font-medium mb-2">
        Do you need ADA assistance?
      </FontText>
      <FontText className="text-lg mb-12">
        This includes wheelchair accommodation, service animals, or other needs.
      </FontText>
      <View className="flex-1 gap-4 flex-col justify-start">
        <RadioButton
          label="Yes, I need assistance"
          selected={requiresAssistance === true}
          onPress={() => setRequiresAssistance(true)}
        ></RadioButton>
        <RadioButton
          label="No, I do not need assistance"
          selected={requiresAssistance === false}
          onPress={() => setRequiresAssistance(false)}
        ></RadioButton>
      </View>
      <LargeButton
        title="Continue"
        onPress={() => {
          router.navigate("/login/guidelines");
        }}
        disabled={requiresAssistance === undefined}
      ></LargeButton>
    </View>
  );
};

export default Assistance;
