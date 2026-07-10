import FontText from "@/src/components/font-text";
import LargeButton from "@/src/components/large-button";
import TextInputField from "@/src/components/text-input-field";
import { useTabContext } from "@/src/utils/context/tab-context";
import BottomSheet from "@gorhom/bottom-sheet";
import { useEffect, useRef, useState } from "react";
import { View } from "react-native";

const MyRide = () => {
  const [code, setCode] = useState<string>("");
  const sheetRef = useRef<BottomSheet>(null);
  const { setMyRideSheetRef } = useTabContext();
  const { goHome } = useTabContext();

  useEffect(() => {
    setMyRideSheetRef(sheetRef);
  }, [setMyRideSheetRef]);

  return (
    <BottomSheet
      ref={sheetRef}
      enableDynamicSizing={false}
      snapPoints={[180, 340]}
      index={-1}
      handleComponent={() => (
        <View className="rounded-t-[28px] flex-col items-center py-4">
          <View className="bg-slate-300 rounded w-8 h-1" />
        </View>
      )}
    >
      <View className="bg-white flex-1 flex-col px-5 pb-10">
        <FontText className="text-2xl font-medium">My Ride</FontText>
        <FontText className="text-lg font-normal mt-2 mb-6">
          No active rides currently.
        </FontText>
        <LargeButton
          title={/* @ts-ignore */ "Book Ride"}
          onPress={() => goHome()}
        />
        <FontText className="text-2xl font-medium mt-10">Join a Ride</FontText>
        <FontText className="text-lg font-normal mt-2 mb-6">
          Enter the ride code shared by your group leader.
        </FontText>
        <TextInputField
          placeholder="ABC123"
          autoCapitalize={"characters"}
          value={code}
          onChangeText={(text) => setCode(text.toUpperCase())}
        />
      </View>
    </BottomSheet>
  );
};

export default MyRide;
