import { TouchableOpacity } from "react-native";
import FontText from "./font-text";
import Animated from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const LargeButton = ({
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
  let color = blue ? "bg-ut-bluebonnet" : "bg-ut-burntorange";

  return (
    <AnimatedTouchable
      className={`h-[56px] px-4 rounded-full flex-col transition-colors ${color} disabled:bg-slate-200 justify-center`}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
    >
      <FontText
        className={`${disabled ? "text-slate-500" : "text-white"} text-center text-xl font-medium`}
      >
        {title}
      </FontText>
    </AnimatedTouchable>
  );
};

export default LargeButton;
