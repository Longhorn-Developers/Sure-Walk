import { LayoutChangeEvent, TouchableOpacity, View } from "react-native";
import FontText from "./font-text";
import { CaretDownIcon } from "phosphor-react-native";
import { UTBurntOrange } from "../utils/colors";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const Accordion = ({ title, body }: { title: string; body: string }) => {
  const isOpen = useSharedValue<boolean>(false);
  const textHeight = useSharedValue<number>(0);

  const onLayout = (event: LayoutChangeEvent) => {
    const measuredHeight = event.nativeEvent.layout.height;
    if (measuredHeight > 0 && textHeight.value !== measuredHeight) {
      textHeight.value = measuredHeight;
    }
  };

  const animatedHeightStyle = useAnimatedStyle(() => ({
    height: withTiming(textHeight.value * Number(isOpen.value), {
      duration: 300,
    }),
  }));

  const animatedChevronStyle = useAnimatedStyle(() => {
    const rotation = isOpen.value ? "180deg" : "0deg";
    return {
      transform: [{ rotate: withTiming(rotation, { duration: 300 }) }],
    };
  });

  return (
    <View className="flex-col">
      <TouchableOpacity
        className="flex-row items-center justify-between gap-10"
        onPress={() => (isOpen.value = !isOpen.value)}
      >
        <FontText className="text-xl font-semibold shrink">{title}</FontText>
        <Animated.View style={animatedChevronStyle}>
          <CaretDownIcon size={24} color={UTBurntOrange} />
        </Animated.View>
      </TouchableOpacity>
      <Animated.View style={[{ overflow: "hidden" }, animatedHeightStyle]}>
        <View className="absolute w-full" onLayout={onLayout}>
          <FontText className="mt-3 p-2 text-lg font-normal bg-[#BF570026]">
            {body}
          </FontText>
        </View>
      </Animated.View>
    </View>
  );
};

export default Accordion;
