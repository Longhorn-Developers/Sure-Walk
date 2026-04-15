import { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import FontText from "./font-text";
import { CaretDownIcon } from "phosphor-react-native";

const DropdownSelect = ({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: { label: string; value: any }[];
  value: any;
  onSelect: (value: any) => void;
}) => {
  const [open, setOpen] = useState(false);

  const selected = options.find((o) => o.value === value);

  return (
    <View className="flex flex-col gap-2 w-full">
      <FontText className="font-medium text-4 tracking-[0.48px]">
        {label}
      </FontText>
      <TouchableOpacity
        className="flex-row justify-between "
        onPress={() => setOpen(!open)}
      >
        <FontText className="">
          {selected ? selected.label : "Select an option"}
        </FontText>
        <CaretDownIcon size={24} />
      </TouchableOpacity>

      {open && (
        <View className="border border-[#e5e7eb]">
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              className={`px-4 py-3 ${
                index !== options.length - 1 ? "border-b border-[#e5e7eb]" : ""
              } ${value === option.value ? "bg-blue-50" : "bg-white"}`}
              onPress={() => {
                onSelect(option.value);
                setOpen(false);
              }}
            >
              <FontText
                className={
                  value === option.value ? "text-blue-600" : "text-slate-700"
                }
              >
                {option.label}
              </FontText>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View className="border-b border-b-[#e5e7eb] w-full" />
    </View>
  );
};

export default DropdownSelect;
