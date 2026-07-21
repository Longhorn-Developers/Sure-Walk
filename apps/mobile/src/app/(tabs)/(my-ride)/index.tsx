import FontText from "@/src/components/font-text";
import LargeButton from "@/src/components/large-button";
import TextInputField from "@/src/components/text-input-field";
import { UTBluebonnet } from "@/src/utils/colors";
import { useCurrentRideSession } from "@/src/utils/context/current-ride-context";
import { useTabContext } from "@/src/utils/context/tab-context";
import { useSession } from "@/src/utils/context/user-context";
import { WEST_CAMPUS_LOCATIONS } from "@/src/utils/locations/dropoff-locations";
import { CAMPUS_LOCATIONS } from "@/src/utils/locations/pickup-locations";
import Location from "@/src/utils/types/location";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ArrowCircleRightIcon } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MyRide = () => {
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const [code, setCode] = useState<string>("");
  const sheetRef = useRef<BottomSheet>(null);
  const { setMyRideSheetRef } = useTabContext();
  const { goHome } = useTabContext();
  const { fetchProtected } = useSession();
  const { currentRideMini, setCurrentRideMini, loadingState, setLoadingState } =
    useCurrentRideSession();
  const inputRef = useRef<TextInput>(null);
  const [pickupLocation, setPickupLocation] = useState<Location | undefined>(
    undefined,
  );
  const [dropoffLocation, setDropoffLocation] = useState<Location | undefined>(
    undefined,
  );
  const snap0 = useSharedValue<number>(180);
  const snap1 = useSharedValue<number>(340);
  const snapPoints = useDerivedValue<(string | number)[]>(
    () => [snap0.value, snap1.value, `${(1 - top / height) * 100}%`],
    [snap0, snap1, height, top],
  );

  useEffect(() => {
    setMyRideSheetRef(sheetRef);
  }, [setMyRideSheetRef]);

  useEffect(() => {
    if (currentRideMini) {
      setPickupLocation(
        CAMPUS_LOCATIONS.find(
          (loc) => loc.id === currentRideMini.pickupLocationID,
        ),
      );
      setDropoffLocation(
        WEST_CAMPUS_LOCATIONS.find(
          (loc) => loc.id === currentRideMini.dropoffLocationID,
        ),
      );
    } else {
      setPickupLocation(undefined);
      setDropoffLocation(undefined);
    }
  }, [currentRideMini]);

  useEffect(() => {
    const fetchCurrentRide = async () => {
      try {
        const res = await fetchProtected("/ride", "GET");
        if (res.status === 204) {
          setCurrentRideMini(null);
          goHome();
        } else if (res.status === 200) {
          setCurrentRideMini(await res.json());
        } else {
          throw new Error("Could not fetch current ride details.");
        }
        setLoadingState("done");
      } catch (err) {
        console.log(err);
        setLoadingState("error");
      }
    };

    // const interval = setInterval(fetchCurrentRide, 30 * 1000);
    fetchCurrentRide();
    return () => {
      // clearInterval(interval);
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleLayout1 = (event: LayoutChangeEvent) => {
    let height = event.nativeEvent.layout.height;
    if (height === 0) {
      height = 180;
    }
    snap0.set(height + 50);
  };

  const handleLayout2 = (event: LayoutChangeEvent) => {
    let height = event.nativeEvent.layout.height;
    if (height === 0) {
      height = 340;
    }
    snap1.set(height + 52);
  };

  return (
    <BottomSheet
      ref={sheetRef}
      enableDynamicSizing={false}
      snapPoints={snapPoints}
      index={-1}
      handleComponent={() => (
        <View className="rounded-t-[28px] flex-col items-center py-4">
          <View className="bg-slate-300 rounded w-8 h-1" />
        </View>
      )}
      style={{ zIndex: 500 }}
      onChange={(index) => {
        if (index < 2) {
          inputRef.current?.blur();
        }
      }}
    >
      <View className="bg-white flex-1 flex-col px-5 pb-10">
        <View className="flex-col" onLayout={handleLayout2}>
          <View onLayout={handleLayout1}>
            {loadingState === "done" && !currentRideMini && (
              <>
                <FontText className="text-2xl font-medium">My Ride</FontText>
                <FontText className="text-lg font-normal mt-2 mb-6">
                  No active rides currently.
                </FontText>
                <LargeButton title="Book Ride" onPress={() => goHome()} />
              </>
            )}
            {loadingState === "done" && currentRideMini && (
              <>
                <FontText className="text-2xl font-medium mb-6">
                  Active Ride
                </FontText>
                <View className="py-4 px-5 bg-slate-50 rounded-2xl border border-slate-200 flex-col mb-6">
                  <View className="flex-row items-center gap-2 mb-4">
                    <FontText className="text-lg font-semibold">
                      {pickupLocation?.abbreviation}
                    </FontText>
                    <ArrowCircleRightIcon
                      weight="fill"
                      color={UTBluebonnet}
                      size={24}
                    />
                    <FontText className="text-lg font-semibold">
                      {dropoffLocation?.name}
                    </FontText>
                  </View>
                  {currentRideMini.eta && (
                    <FontText className="text-lg font-semibold">
                      ETA:{" "}
                      <FontText className="text-lg font-regular">
                        {currentRideMini.eta}
                      </FontText>
                    </FontText>
                  )}
                  <FontText className="text-lg font-semibold">
                    Status:{" "}
                    <FontText className="text-lg font-regular">
                      {`${currentRideMini.rideState.at(0)?.toUpperCase()}${currentRideMini.rideState.slice(1)}`}
                    </FontText>
                  </FontText>
                </View>
                <LargeButton
                  title="View Live Tracking"
                  onPress={() => {
                    setCurrentRideMini({
                      pickupLocationID: currentRideMini.pickupLocationID,
                      dropoffLocationID: currentRideMini.dropoffLocationID,
                      eta: currentRideMini.eta,
                      rideState: "received",
                    });
                    router.push("/home/ride-info-wrapper");
                  }}
                />
              </>
            )}
          </View>
          <FontText className="text-2xl font-medium mt-10">
            Join a Ride
          </FontText>
          <FontText className="text-lg font-normal mt-2 mb-6">
            Enter the ride code shared by your group leader.
          </FontText>
          <TextInputField
            placeholder="ABC123"
            autoCapitalize={"characters"}
            value={code}
            onChangeText={(text) => setCode(text.toUpperCase())}
            onFocus={() => sheetRef.current?.expand()}
            onBlur={() => sheetRef.current?.snapToIndex(1)}
            inputRef={inputRef}
            returnKeyType="go"
            onSubmitEditing={() => {
              router.push(`/home/ride-info-wrapper?shareCode=${code}`);
            }}
          />
        </View>
      </View>
    </BottomSheet>
  );
};

export default MyRide;
