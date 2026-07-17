import FontText from "@/src/components/font-text";
import { slate700 } from "@/src/utils/colors";
import { useSession } from "@/src/utils/context/user-context";
import { router } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { useEffect } from "react";
import { View, TouchableOpacity } from "react-native";

const CurrentRideInfo = () => {
  const { accessToken } = useSession();

  useEffect(() => {}, [accessToken]);

  return (
    <View className="bg-white flex-1 p-5 flex-col gap-10">
      <View className="flex-row gap-4 items-center mt-safe">
        <TouchableOpacity
          className="w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center"
          onPress={() => {
            router.back();
          }}
        >
          <CaretLeftIcon size={24} color={slate700} />
        </TouchableOpacity>
        <FontText className="font-medium text-2xl">Your ride details</FontText>
      </View>
    </View>
  );
};

export default CurrentRideInfo;
