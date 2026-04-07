import { TouchableOpacity, View } from "react-native";
import FontText from "./font-text";

const RadioButton = ({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
    >
      <View
        className={`flex-row items-center gap-4 transition-colors border rounded-lg ${selected ? "bg-[#E0F2FE] border-ut-bluebonnet" : "bg-gray-50 border-gray-200"} px-6 py-4 rounded-full`}
      >
        <View
          className={`flex w-5 h-5 rounded-full transition-colors border ${selected ? "border-ut-bluebonnet" : "border-gray-500"} items-center justify-center`}
        >
          <View
            className={`w-3.5 h-3.5 rounded-full transition-colors ${selected ? "bg-ut-bluebonnet" : "bg-gray-50"}`}
          />
        </View>
        <FontText className="text-gray-900 text-lg font-medium">
          {label}
        </FontText>
      </View>
    </TouchableOpacity>
  );
};

export default RadioButton;
