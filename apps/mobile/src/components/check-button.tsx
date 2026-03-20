import { CheckSquareIcon, SquareIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";
import FontText from "./font-text";
import { stone700, UTBurntOrange } from "../utils/colors";

const CheckButton = ({
  label: text,
  onPress = () => {},
  isChecked,
  color = UTBurntOrange,
}: {
  label: string;
  onPress?: () => void;
  isChecked: boolean;
  color?: string;
}) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <View className="flex-row items-center justify-start gap-2.5 transition-colors">
        {isChecked ? (
          <CheckSquareIcon size={20} color={color} weight="fill" />
        ) : (
          <SquareIcon size={20} color={stone700} />
        )}
        <FontText className="text-stone-700 text-lg">{text}</FontText>
      </View>
    </TouchableOpacity>
  );
};

export default CheckButton;
