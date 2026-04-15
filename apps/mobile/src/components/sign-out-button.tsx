import { TouchableOpacity } from "react-native";
import FontText from "./font-text";
import Animated from "react-native-reanimated";
import { SignOutIcon } from "phosphor-react-native";
import { View } from "react-native";
import { UTBluebonnet, UTBurntOrange } from "../utils/colors";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const SignOutButton = ({
  title,
  onPress,
  disabled = false,
  blue = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  blue?: boolean;
}) => {
  let color = blue ? "ut-bluebonnet" : "ut-burntorange";

  return (
    <AnimatedTouchable
      className={`px-4 py-3.5 rounded-full flex-col border border-${color} disabled:bg-gray-300`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <View className="flex-row items-center justify-center gap-2">
        <SignOutIcon color={blue ? UTBluebonnet : UTBurntOrange} />
        <FontText className={`text-${color} text-center text-xl`}>
          {title}
        </FontText>
      </View>
    </AnimatedTouchable>
  );
};

export default SignOutButton;
