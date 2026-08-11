import { TouchableOpacity } from "react-native";
import { View } from "react-native";
import Animated from "react-native-reanimated";

import FontText from "./font-text";

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const OutlineButton = ({
  title,
  onPress,
  icon,
  disabled = false,
  small = false,
  red = false,
}: {
  title: string;
  onPress: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
  small?: boolean;
  red?: boolean;
}) => {
  return (
    <AnimatedTouchable
      className={`border-[2px] ${red ? "border-red-700" : "border-ut-bluebonnet"} disabled:border-slate-500 disabled:bg-slate-100 transition-colors rounded-full px-5 py-3 flex-row gap-2 align-center justify-center`}
      onPress={() => onPress()}
      disabled={disabled}
    >
      {icon && <View className="items-center justify-center">{icon}</View>}
      <View className={`items-center justify-center ${small ? "h-4" : ""}`}>
        <FontText
          className={`${small ? "text-lg/[18px]" : "text-xl/10"} font-medium ${disabled ? "color-slate-500" : red ? "color-red-700" : "color-ut-bluebonnet"}`}
        >
          {title}
        </FontText>
      </View>
    </AnimatedTouchable>
  );
};

export default OutlineButton;
