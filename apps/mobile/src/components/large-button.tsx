import { TouchableOpacity } from "react-native";
import FontText from "./font-text";
import Animated from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const LargeButton = ({
  title,
  onPress,
  disabled = false,
  orange = false,
}: {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  orange?: boolean;
}) => {
  let color = orange ? "bg-ut-burntorange" : "bg-ut-bluebonnet";

  return (
    <AnimatedTouchable
      className={`px-4 py-3.5 rounded-full flex-col transition-colors ${color} disabled:bg-gray-300`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <FontText className="text-white text-center text-xl">{title}</FontText>
    </AnimatedTouchable>
  );
};

export default LargeButton;
