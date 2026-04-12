import {
  Platform,
  TextInput,
  TextStyle,
  TouchableOpacity,
  View,
} from "react-native";
import FontText from "./font-text";
import { gray500 } from "../utils/colors";

const TextInputField = ({
  fieldName,
  optionalPressableText,
  optionalPressableCallback,
  styleProps,
  ...props
}: {
  fieldName: string;
  optionalPressableText?: string;
  optionalPressableCallback?: () => void;
  styleProps?: TextStyle;
} & React.ComponentProps<typeof TextInput>) => {
  let _style: TextStyle = styleProps ?? {};
  if (Platform.OS === "ios") {
    _style.lineHeight = 0;
  }

  return (
    <View className="flex-col gap-2">
      <View className="flex-row justify-between">
        <FontText className="text-lg font-semibold text-gray-900">
          {fieldName}
        </FontText>
        {optionalPressableCallback && (
          <TouchableOpacity onPress={() => optionalPressableCallback()}>
            <FontText className="text-lg font-semibold text-ut-bluebonnet">
              {optionalPressableText}
            </FontText>
          </TouchableOpacity>
        )}
      </View>
      <TextInput
        className="bg-gray-50 border border-gray-200 text-gray-900 text-lg font-regular rounded-lg transition-colors focus:ring-ut-bluebonnet focus:border-ut-bluebonnet block w-full p-4"
        {...props}
        placeholderTextColor={gray500}
        style={_style}
      />
    </View>
  );
};

export default TextInputField;
