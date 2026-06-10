import { TouchableOpacity } from "react-native";
import FontText from "./font-text";
import { View } from "react-native";
import Animated from "react-native-reanimated";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const OutlineButton = ({
  title,
  onPress,
  icon,
  disabled = false,
  small = false,
}: {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  small?: boolean;
}) => {
  return (
    <AnimatedTouchable
      className={`border-[2px] border-ut-bluebonnet disabled:border-slate-500 disabled:bg-slate-100 transition-colors rounded-full px-5 py-3 flex-row gap-2 align-center justify-center`}
      onPress={() => onPress()}
      disabled={disabled}
    >
      <View className="items-center justify-center">{icon}</View>
      <View className="items-center justify-center">
        <FontText
          className={`${small ? "text-xl/6" : "text-xl/10"} font-medium ${disabled ? "color-slate-500" : "color-ut-bluebonnet"}`}
        >
          {title}
        </FontText>
      </View>
    </AnimatedTouchable>
  );
};

export default OutlineButton;
