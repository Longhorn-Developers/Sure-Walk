import { ComponentProps } from "react";
import { Text } from "react-native";

const FontText = (props: ComponentProps<typeof Text>) => {
  const defaultStyles = !props.className?.includes("font-")
    ? "font-regular"
    : "";

  return (
    <Text {...props} className={`${defaultStyles} ${props.className || ""}`}>
      {props.children}
    </Text>
  );
};

export default FontText;
