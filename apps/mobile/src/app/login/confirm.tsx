import LargeButton from "@/src/components/large-button";
import { useLoginSession } from "@/src/utils/context/login-context";
import { router } from "expo-router";
import { CircleIcon } from "phosphor-react-native";
import { useRef, useState } from "react";
import {
  View,
  TextInput,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import FontText from "@/src/components/font-text";
import { gray500 } from "@/src/utils/colors";

const Confirm = () => {
  const { phoneNumber } = useLoginSession();
  const [code, setCode] = useState("");
  const [focused, setFocus] = useState<boolean>(false);
  const textInputRef = useRef<TextInput | null>(null);

  return (
    <View className="flex-1 bg-white px-5 pt-8">
      <FontText className="text-2xl font-medium mb-2">
        Verify your phone number
      </FontText>
      <FontText className="text-lg mb-12">
        Enter the code sent to {phoneNumber}.
      </FontText>
      <View className="flex-1 flex-col gap-2">
        <FontText className="text-lg font-semibold text-gray-900">
          Code
        </FontText>
        <TouchableWithoutFeedback
          onPress={() => {
            textInputRef.current?.focus();
            setFocus(true);
          }}
          className="w-full"
        >
          <View className="flex-row w-full justify-between h-[64px]">
            {[...Array(6).keys()].map((_, index) => (
              <View
                key={index}
                className={`py-4 px-3 border transition-colors ${focused ? "border-ut-bluebonnet" : "border-gray-200"} rounded-lg bg-gray-50 items-center justify-center`}
              >
                {code[index] ? (
                  <FontText
                    className={`flex-row items-center justify-center w-6 text-3xl font-medium text-center ${code[index] ? "text-gray-900" : "text-gray-500"}`}
                  >
                    {code[index] || "•"}
                  </FontText>
                ) : (
                  <View className="w-6 items-center justify-center">
                    <CircleIcon size={8} color={gray500} weight="fill" />
                  </View>
                )}
              </View>
            ))}
          </View>
        </TouchableWithoutFeedback>
        <TextInput
          ref={textInputRef}
          value={code}
          onChangeText={setCode}
          onBlur={() => setFocus(false)}
          className="display-none visible-hidden opacity-0"
          keyboardType="numeric"
          maxLength={6}
          returnKeyType={Platform.OS === "ios" ? "done" : undefined}
        />
      </View>
      <LargeButton
        title="Continue"
        onPress={() => {
          router.navigate("/login/assistance");
        }}
        disabled={code.length !== 6}
      />
    </View>
  );
};

export default Confirm;
