import {
  Platform,
  Pressable,
  StyleProp,
  TextInput,
  TextStyle,
  View,
} from "react-native";
import FontText from "./font-text";
import { gray500 } from "../utils/colors";
import { useRef } from "react";

const EditProfileTextInput = ({
  fieldName,
  ...props
}: { fieldName: string } & React.ComponentProps<typeof TextInput>) => {
  let _style: StyleProp<TextStyle> = {};
  if (Platform.OS === "ios") {
    _style.lineHeight = 0;
  }
  const inputRef = useRef<TextInput>(null);

  return (
    <Pressable
      className="flex flex-col items-start w-full h-[55px]"
      onPress={() => inputRef.current?.focus()}
    >
      <FontText className="font-medium text-md">{fieldName}</FontText>
      <TextInput
        className="w-full text-md mt-4 mb-1 font-regular"
        placeholderTextColor={gray500}
        style={_style}
        ref={inputRef}
        {...props}
      />
      <View className="border-b border-b-[#e5e7eb] w-full" />
    </Pressable>
  );
};

export default EditProfileTextInput;
