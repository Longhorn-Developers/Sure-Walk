import { InfoIcon, WarningCircleIcon, XIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  FadeOutUp,
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
  return (
    <Animated.View
      className={`flex-row gap-4 px-4 pt-3 pb-3.5 items-center ${isError ? "bg-red-700" : "bg-slate-50"} rounded-xl`}
      entering={FadeInDown.duration(300).easing(Easing.out(Easing.cubic))}
      exiting={FadeOutUp.duration(300).easing(Easing.out(Easing.cubic))}
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
  );
};

export default Toast;
