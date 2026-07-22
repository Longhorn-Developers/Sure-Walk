import FontText from "@/src/components/font-text";
import LargeButton from "@/src/components/large-button";
import RadioButton from "@/src/components/radio-button";
import { router } from "expo-router";
import { useSearchParams } from "expo-router/build/hooks";
import { useEffect, useRef, useState } from "react";
import { Keyboard, ScrollView, View } from "react-native";
import TextInputField from "../components/text-input-field";
import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useSession } from "../utils/context/user-context";
import { getErrorMessage } from "../client";

const CancellationReason = () => {
  const cancellationReasons: [string, ...string[]] = [
    "My ride never came",
    "The estimated wait was too long",
    "Weather improved",
    "Got a different ride",
    "I didn't receive a call",
    "Other",
  ];

  const { fetchProtected } = useSession();
  const params = useSearchParams();
  const rideID = params.get("rideID");
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [extraText, setExtraText] = useState<string>("");
  const scrollViewRef = useRef<ScrollView>(null);

  const keyboardPaddingHeight = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(
    () => ({
      height: withTiming(keyboardPaddingHeight.value, {
        easing: Easing.out(Easing.quad),
      }),
    }),
    [keyboardPaddingHeight],
  );

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      keyboardPaddingHeight.set(270);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd();
      }, 250);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      keyboardPaddingHeight.set(20);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = async () => {
    try {
      const data = {
        rideID,
        cancellationReason: selectedOption,
        cancellationExtra: selectedOption === "Other" ? extraText : undefined,
      };
      const res = await fetchProtected(
        "/ride/cancellation-reason",
        "POST",
        data,
      );
      if (!res.ok) {
        throw new Error(await getErrorMessage(res));
      }
      router.back();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View className="bg-white flex-col h-full p-5 pb-safe">
      <View className="flex-row gap-4 items-center mt-safe mb-8">
        <FontText className="font-medium text-2xl">
          Reason for cancelling?
        </FontText>
      </View>
      <View className="relative mt-[-16px] z-5 flex-1 mx-[-20px] mb-4">
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
            height: 16,
            zIndex: 10,
          }}
        />
        <ScrollView
          className="flex-col py-4 pt-[-16px] px-5 gap-4"
          ref={scrollViewRef}
        >
          <View className="flex-col gap-4 flex-1 pt-4">
            {cancellationReasons.map((option, index) => (
              <RadioButton
                label={option}
                key={index}
                onPress={() => setSelectedOption(option)}
                selected={selectedOption === option}
              />
            ))}
            {selectedOption === "Other" && (
              <TextInputField
                fieldName="Reason"
                value={extraText}
                onChangeText={(text) => setExtraText(text)}
              />
            )}
          </View>
          <Animated.View style={[animatedStyle]} />
        </ScrollView>
      </View>
      <LargeButton
        title="Back to Home"
        onPress={submit}
        disabled={
          selectedOption === null ||
          (selectedOption === "Other" && extraText.length <= 5)
        }
      />
    </View>
  );
};

export default CancellationReason;
