import FontText from "@/src/components/font-text";
import LargeButton from "@/src/components/large-button";
import OutlineButton from "@/src/components/outline-button";
import TextInputField from "@/src/components/text-input-field";
import { UTBluebonnet, UTBurntOrange } from "@/src/utils/colors";
import { useCurrentRideSession } from "@/src/utils/context/current-ride-context";
import { useMissedRideSession } from "@/src/utils/context/missed-ride-context";
import { useTabContext } from "@/src/utils/context/tab-context";
import { useToastContext } from "@/src/utils/context/toast-context";
import { useSession } from "@/src/utils/context/user-context";
import { WEST_CAMPUS_LOCATIONS } from "@/src/utils/locations/dropoff-locations";
import { CAMPUS_LOCATIONS } from "@/src/utils/locations/pickup-locations";
import Location from "@/src/utils/types/location";
import BottomSheet from "@gorhom/bottom-sheet";
import { router } from "expo-router";
import { ArrowCircleRightIcon, WarningIcon } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  LayoutChangeEvent,
  Modal,
  Pressable,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";
import { useDerivedValue, useSharedValue } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MyRide = ({ initialIndex }: { initialIndex: number }) => {
  const { height } = useWindowDimensions();
  const { top } = useSafeAreaInsets();
  const [code, setCode] = useState<string>("");
  const sheetRef = useRef<BottomSheet>(null);
  const { setMyRideSheetRef } = useTabContext();
  const { goHome } = useTabContext();
  const { fetchProtected, accessToken } = useSession();
  const { currentRide, setCurrentRide, loadingState, setLoadingState } =
    useCurrentRideSession();
  const { missedRide, showModal, setShowModal } = useMissedRideSession();
  const { setToast } = useToastContext();
  const inputRef = useRef<TextInput>(null);
  const [pickupLocation, setPickupLocation] = useState<Location | undefined>(
    undefined,
  );
  const [dropoffLocation, setDropoffLocation] = useState<Location | undefined>(
    undefined,
  );
  const [missedPickupLocation, setMissedPickupLocation] = useState<
    Location | undefined
  >(undefined);
  const [missedDropoffLocation, setMissedDropoffLocation] = useState<
    Location | undefined
  >(undefined);
  const snap0 = useSharedValue<number>(180);
  const snap1 = useSharedValue<number>(340);
  const snapPoints = useDerivedValue<(string | number)[]>(
    () => [snap0.value, snap1.value, "80.5%"],
    [snap0, snap1, height, top],
  );
  const [disabled, setDisabled] = useState<boolean>(false);

  useEffect(() => {
    setMyRideSheetRef(sheetRef);
  }, [setMyRideSheetRef]);

  useEffect(() => {
    if (currentRide) {
      setPickupLocation(
        CAMPUS_LOCATIONS.find((loc) => loc.id === currentRide.pickupLocationID),
      );
      setDropoffLocation(
        WEST_CAMPUS_LOCATIONS.find(
          (loc) => loc.id === currentRide.dropoffLocationID,
        ),
      );
    } else {
      setPickupLocation(undefined);
      setDropoffLocation(undefined);
    }
  }, [currentRide]);

  useEffect(() => {
    if (missedRide) {
      setMissedPickupLocation(
        CAMPUS_LOCATIONS.find((loc) => loc.id === missedRide.pickupLocationID),
      );
      setMissedDropoffLocation(
        WEST_CAMPUS_LOCATIONS.find(
          (loc) => loc.id === missedRide.dropoffLocationID,
        ),
      );
    } else {
      setMissedPickupLocation(undefined);
      setMissedDropoffLocation(undefined);
    }
  }, [missedRide]);

  useEffect(() => {
    const fetchCurrentRide = async () => {
      try {
        const res = await fetchProtected("/ride", "GET");
        if (res.status === 204) {
          setCurrentRide(null);
        } else if (res.status === 200) {
          setCurrentRide(await res.json());
        } else {
          throw new Error("Could not fetch current ride details.");
        }
        setLoadingState("done");
      } catch (err) {
        // ignore error, could be because app minimized
        console.log(err);
      }
    };

    const interval = setInterval(fetchCurrentRide, 30 * 1000);
    return () => {
      clearInterval(interval);
    };
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

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
    <>
      <BottomSheet
        ref={sheetRef}
        enableDynamicSizing={false}
        snapPoints={snapPoints}
        index={initialIndex}
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
              {loadingState === "done" && !currentRide && (
                <>
                  <FontText className="text-2xl font-medium">My Ride</FontText>
                  <FontText className="text-lg font-normal mt-2 mb-6">
                    No active rides currently.
                  </FontText>
                  <LargeButton title="Book Ride" onPress={() => goHome()} />
                </>
              )}
              {loadingState === "done" && currentRide && (
                <>
                  <FontText className="text-2xl font-medium mb-6">
                    Active Ride
                  </FontText>
                  <View className="pb-4 bg-slate-50 rounded-2xl border border-slate-200 flex-col mb-6 gap-2">
                    <View className="flex-row items-center gap-2 mb-2 px-5 py-1.5 bg-orange-100 rounded-t-2xl">
                      <FontText className="text-lg font-semibold color-ut-burntorange">
                        {pickupLocation?.abbreviation}
                      </FontText>
                      <ArrowCircleRightIcon
                        weight="fill"
                        color={UTBurntOrange}
                        size={24}
                      />
                      <FontText className="text-lg font-semibold color-ut-burntorange">
                        {dropoffLocation?.name}
                      </FontText>
                    </View>
                    {currentRide.eta && (
                      <FontText className="text-lg font-semibold px-5">
                        ETA:{" "}
                        <FontText className="text-lg font-regular">
                          {currentRide.eta ?? ""}
                        </FontText>
                      </FontText>
                    )}
                    <FontText className="text-lg font-semibold px-5">
                      Status:{" "}
                      <FontText className="text-lg font-regular">
                        {`${currentRide.rideState.at(0)?.toUpperCase()}${currentRide.rideState.slice(1)}`}
                      </FontText>
                    </FontText>
                  </View>
                  <LargeButton
                    title="View Live Tracking"
                    onPress={() => {
                      setDisabled(true);
                      setTimeout(
                        () => router.push("/home/ride-info-wrapper"),
                        300,
                      );
                      setTimeout(() => setDisabled(false), 1000);
                    }}
                    disabled={disabled}
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
              placeholder="ABC1234"
              autoCapitalize={"characters"}
              value={code}
              onChangeText={(text) => setCode(text.toUpperCase())}
              onFocus={() => sheetRef.current?.expand()}
              onBlur={() => sheetRef.current?.snapToIndex(1)}
              inputRef={inputRef}
              returnKeyType="go"
              onSubmitEditing={() => {
                if (code.length !== 7) {
                  setToast({
                    title: "Invalid Code",
                    description: "Please enter a valid 7-digit ride code.",
                    onDismiss: () => setToast(null),
                    isError: true,
                  });
                  return;
                }
                router.push(`/home/ride-info-wrapper?shareCode=${code}`);
              }}
            />
          </View>
        </View>
      </BottomSheet>
      <Modal
        animationType="fade"
        transparent
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
        className="z-1000"
      >
        <Pressable
          className="flex-1 bg-[#00000080] items-center justify-center p-5"
          onPress={() => setShowModal(false)}
        >
          <Pressable className="p-4 bg-white flex-col gap-4 rounded-3xl w-full">
            <View className="flex-row gap-2 items-center mb-2">
              <WarningIcon color={UTBurntOrange} size={32} />
              <FontText className="text-2xl font-medium">Missed Ride</FontText>
            </View>
            <View className="flex-col gap-4">
              <FontText className="text-lg">
                You have missed the following ride:
              </FontText>
              <View className="flex-row px-5 py-4 gap-2 bg-slate-50 border border-slate-200 items-center rounded-2xl">
                <FontText className="text-lg font-semibold">
                  {missedPickupLocation?.abbreviation ?? ""}
                </FontText>
                <ArrowCircleRightIcon
                  color={UTBluebonnet}
                  size={24}
                  weight="fill"
                />
                <FontText className="text-lg font-semibold">
                  {missedDropoffLocation?.name ?? ""}
                </FontText>
              </View>
              <View className="flex-col gap-3">
                <LargeButton
                  title="Book a New Ride"
                  onPress={() => {
                    setShowModal(false);
                    goHome();
                  }}
                />
                <OutlineButton
                  title="Return"
                  onPress={() => setShowModal(false)}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

export default MyRide;
