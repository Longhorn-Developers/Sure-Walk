import { InfoIcon, WarningCircleIcon, XIcon } from "phosphor-react-native";
import { useEffect, useRef } from "react";
import { TouchableOpacity, View } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutDown,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

import { slate50, UTBluebonnet } from "../utils/colors";
import FontText from "./font-text";

export type ToastProps = {
  title: string;
  description: string;
  onDismiss: () => void;
  isError?: boolean;
};

const Toast = ({ title, description, onDismiss, isError }: ToastProps) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const setTimer = () => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 10000);
    timeoutRef.current = timer;
  };

  const clearTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  useEffect(() => {
    setTimer();
    return clearTimer;
  }, [onDismiss]); // eslint-disable-line react-hooks/exhaustive-deps

  const translateY = useSharedValue(0);

  const gesture = Gesture.Pan()
    .onStart(() => {
      runOnJS(clearTimer)();
    })
    .onUpdate((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onEnd((event) => {
      if (event.translationY > 30) {
        translateY.value = withTiming(200, { duration: 150 }, () => {
          runOnJS(onDismiss)();
        });
      } else {
        translateY.value = withTiming(0, { easing: Easing.out(Easing.cubic) });
        runOnJS(setTimer)();
      }
    });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: (100 - Math.min(100, translateY.value)) / 100,
  }));

  return (
    <GestureDetector gesture={gesture} key={Math.random()}>
      <Animated.View style={animatedStyle}>
        <Animated.View
          className={`flex-row gap-4 px-4 pt-3 pb-3.5 items-center ${isError ? "bg-red-700" : "bg-slate-50"} rounded-xl`}
          entering={FadeInDown.duration(300).easing(Easing.out(Easing.cubic))}
          exiting={FadeOutDown.duration(300).easing(Easing.out(Easing.cubic))}
          style={[
            {
              boxShadow: isError
                ? "0px 4px 10px rgba(128, 0, 0, 0.4)"
                : "0px 4px 10px rgba(100, 100, 150, 0.2)",
            },
          ]}
        >
          {isError ? (
            <WarningCircleIcon color={slate50} size={24} />
          ) : (
            <InfoIcon color={UTBluebonnet} size={24} />
          )}
          <View className="flex-col flex-1">
            <FontText
              className={`font-normal text-lg ${isError ? "color-slate-50" : "color-ut-bluebonnet"}`}
            >
              {title}
            </FontText>
            <FontText
              className={`font-normal text-md ${isError ? "color-slate-50" : "color-ut-bluebonnet"}`}
            >
              {description}
            </FontText>
          </View>
          <TouchableOpacity onPress={onDismiss}>
            <XIcon color={isError ? slate50 : UTBluebonnet} size={24} />
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </GestureDetector>
  );
};

export default Toast;
