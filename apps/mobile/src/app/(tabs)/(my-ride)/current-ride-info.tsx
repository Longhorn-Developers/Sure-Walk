import { API_URL } from "@/src/client/auth";
import FontText from "@/src/components/font-text";
import { GuidelinesListShort } from "@/src/components/guidelines-list";
import PickupDropoffLocationInfo from "@/src/components/pickup-dropoff-location-info";
import RideStateStep, {
  RideStateStepDivider,
} from "@/src/components/ride-state-step";
import RiderCard from "@/src/components/rider-card";
import { slate700, UTBurntOrange } from "@/src/utils/colors";
import { useSession } from "@/src/utils/context/user-context";
import { WEST_CAMPUS_LOCATIONS } from "@/src/utils/locations/dropoff-locations";
import { CAMPUS_LOCATIONS } from "@/src/utils/locations/pickup-locations";
import LoadingState from "@/src/utils/types/loading-state";
import Location from "@/src/utils/types/location";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetScrollViewMethods,
} from "@gorhom/bottom-sheet";
import CurrentRideSmall from "@sure-walk/utils/types/current-ride-small";
import InProgressRideState from "@sure-walk/utils/types/in-progress-ride-state";
import VehicleInfoShort from "@sure-walk/utils/types/vehicle-info-short";
import RideEvent from "@sure-walk/utils/types/ride-event";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  CaretLeftIcon,
  CopyIcon,
  CrownSimpleIcon,
} from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  AppState,
  LayoutChangeEvent,
} from "react-native";
import MapView from "react-native-maps";
import Animated, {
  FadeInUp,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  Easing,
  useAnimatedRef,
  useAnimatedReaction,
  withTiming,
  scrollTo,
} from "react-native-reanimated";
import * as Clipboard from "expo-clipboard";
import { useSearchParams } from "expo-router/build/hooks";
import { useRideDetailsSession } from "@/src/utils/context/ride-details-context";
import { useCurrentRideSession } from "@/src/utils/context/current-ride-context";
import OutlineButton from "@/src/components/outline-button";
import CancelRideModal from "@/src/components/cancel-ride-modal";
import { useMissedRideSession } from "@/src/utils/context/missed-ride-context";

const CurrentRideInfo = () => {
  const { accessToken, fetchProtected, user } = useSession();
  const { firstName, lastName, userType, eid } = user!;
  const { setRideDetails, rideDetails } = useRideDetailsSession();
  const { setCurrentRide } = useCurrentRideSession();
  const params = useSearchParams();
  const shareCode = params.get("shareCode");
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfoShort | null>(null);
  const [rideState, setRideState] = useState<InProgressRideState>("received");
  const wsRef = useRef<WebSocket>(undefined);
  const mapRef = useRef<MapView | null>(null);
  const sheetRef = useRef<BottomSheet | null>(null);
  const scrollRef = useRef<BottomSheetScrollViewMethods | null>(null);
  const rideStepsScrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollTarget = useSharedValue(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { setMissedRide, setShowModal } = useMissedRideSession();

  const snap0 = useSharedValue<number>(72);
  const snap1 = useSharedValue<number>(156);
  const snapPoints = useDerivedValue<(string | number)[]>(
    () => [snap0.value, snap1.value + snap0.value, "70%"],
    [snap0],
  ) as SharedValue<(string | number)[]>;

  const [pickupLocation, setPickupLocation] = useState<Location | undefined>(
    undefined,
  );
  const [dropoffLocation, setDropoffLocation] = useState<Location | undefined>(
    undefined,
  );

  const animateToStep = (rideState: InProgressRideState) => {
    if (rideState === "en route") {
      scrollTarget.value = withTiming(268, {
        duration: 1400,
        easing: Easing.inOut(Easing.sin),
      });
    }
    if (
      rideState === "arrived" ||
      rideState === "in progress" ||
      rideState === "dropped off"
    ) {
      scrollTarget.value = withTiming(402, {
        duration: 1700,
        easing: Easing.inOut(Easing.sin),
      });
    }
  };

  const connect = () => {
    const wsURL = API_URL.replace("http", "ws");
    const ws = new WebSocket(
      `${wsURL}/ride/events${shareCode ? `?shareCode=${shareCode}` : ""}`,
      `Bearer ${accessToken ?? ""}`,
    );
    wsRef.current = ws;

    ws.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data) as RideEvent<object>;
      switch (payload.eventType) {
        case "connected": {
          console.log("websocket connected");
          setLoadingState("done");
          const data = payload.data as CurrentRideSmall;
          setRideDetails(data);
          animateToStep(data.rideState);
          break;
        }
        case "routeUpdate": {
          const data = payload.data as { rideState: InProgressRideState };
          setRideState(data.rideState);
          animateToStep(data.rideState);
          break;
        }
        case "vehicleInfo": {
          const data = payload.data as VehicleInfoShort;
          setTimeout(() => setVehicleInfo(data), 2000);
          break;
        }
      }
    });

    ws.addEventListener("error", (event) => {
      console.log("Websocket error: ", event);
    });

    const onClose = async (event: CloseEvent) => {
      console.log("Websocket closed: ", event.code, event.reason);
      if (event.code === 1000) {
        ws.removeEventListener("close", onClose);
        if (
          event.reason === "complete" ||
          event.reason === "Ride cancelled." ||
          event.reason === "Missed pickup."
        ) {
          if (!shareCode) {
            // not viewing a group ride
            setCurrentRide(null);
          }
          if (event.reason === "Missed pickup.") {
            setShowModal(true);
          }
          router.dismissTo("/home");
        }
        setRideDetails(null);
      } else if (event.reason.includes("401")) {
        try {
          // force refresh
          await fetchProtected("/me", "GET");
        } catch (err) {
          console.error(err);
        }
      } else if (event.reason.includes("404")) {
        // 404
        ws.removeEventListener("close", onClose);
        router.dismissTo("/home");
        setRideDetails(null);
        if (!shareCode) {
          console.error("There is no active ride.");
          setCurrentRide(null);
        } else {
          console.error("Could not find a ride with that ride code.");
        }
      } else {
        // unknown error, reconnect?
        connect();
      }
    };

    ws.addEventListener("close", onClose);
  };

  useEffect(() => {
    setRideDetails({
      pickupLocationID: rideDetails?.pickupLocationID!,
      dropoffLocationID: rideDetails?.dropoffLocationID!,
      groupRide: rideDetails?.groupRide ?? [],
      shareCode: rideDetails?.shareCode,
      rideState: rideState,
      eta: rideDetails?.eta,
    });
  }, [rideState]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (rideDetails) {
      setCurrentRide({
        pickupLocationID: rideDetails?.pickupLocationID!,
        dropoffLocationID: rideDetails?.dropoffLocationID!,
        rideState: rideDetails?.rideState!,
        eta: rideDetails?.eta,
      });
      setMissedRide({
        pickupLocationID: rideDetails?.pickupLocationID!,
        dropoffLocationID: rideDetails?.dropoffLocationID!,
        rideState: rideDetails?.rideState!,
        eta: rideDetails?.eta,
      });
    }
  }, [rideDetails]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setRideDetails(null);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    connect();

    const appStateListener = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (
          nextAppState === "active" &&
          (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)
        ) {
          console.log(
            "App returned to foreground, rebuilding socket connection.",
          );
          connect();
        }
      },
    );

    return () => {
      appStateListener.remove();
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (rideDetails) {
      setPickupLocation(
        CAMPUS_LOCATIONS.find((loc) => loc.id === rideDetails.pickupLocationID),
      );
      setDropoffLocation(
        WEST_CAMPUS_LOCATIONS.find(
          (loc) => loc.id === rideDetails.dropoffLocationID,
        ),
      );
    } else {
      setPickupLocation(undefined);
      setDropoffLocation(undefined);
    }
  }, [rideDetails]);

  const handleLayout0 = (event: LayoutChangeEvent) => {
    let height = event.nativeEvent.layout.height;
    if (height === 0) {
      height = 36;
    }
    snap0.set(height + 48);
  };

  const handleLayout1 = (event: LayoutChangeEvent) => {
    let height = event.nativeEvent.layout.height;
    if (height === 0) {
      height = 76;
    }
    snap1.set(height);
  };

  useAnimatedReaction(
    () => scrollTarget.value,
    (value) => {
      scrollTo(rideStepsScrollRef, value, 0, false);
    },
  );

  const copyCode = async () => {
    await Clipboard.setStringAsync(rideDetails?.shareCode ?? "");
  };

  return (
    <View className="bg-white flex-1 pt-5 flex-col">
      <View className="flex-row gap-4 px-5 items-center mt-safe mb-6">
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
      <View className="relative w-full mb-8">
        <LinearGradient
          colors={["#ffffffff", "#ffffff00"]}
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 24,
            zIndex: 100,
          }}
          start={{ x: 0.2, y: 0.5 }}
          end={{ x: 1, y: 0.5 }}
        />
        <LinearGradient
          colors={["#ffffff00", "#ffffffff"]}
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            bottom: 0,
            width: 24,
            zIndex: 100,
          }}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0.8, y: 0.5 }}
        />
        <Animated.ScrollView
          horizontal
          contentContainerStyle={{
            paddingHorizontal: 56,
          }}
          showsHorizontalScrollIndicator={false}
          ref={rideStepsScrollRef}
        >
          <View className="flex-row">
            <RideStateStep rideState="received" width={32} />
            <RideStateStepDivider rideState="assigned" width={102} />
            <RideStateStep rideState="assigned" width={32} />
            <RideStateStepDivider rideState="en route" width={102} />
            <RideStateStep rideState="en route" width={32} />
            <RideStateStepDivider rideState="arrived" width={102} />
            <RideStateStep rideState="arrived" width={32} />
            <RideStateStepDivider rideState="in progress" width={102} />
            <RideStateStep rideState="in progress" width={32} />
            <RideStateStepDivider rideState="dropped off" width={102} />
            <RideStateStep rideState="dropped off" width={32} />
          </View>
        </Animated.ScrollView>
      </View>
      <View className="relative flex-1 w-full">
        <LinearGradient
          colors={["#ffffffff", "#ffffff00"]}
          style={{
            position: "fixed",
            top: -10,
            height: 24,
            zIndex: 100,
          }}
        />
        <View className="w-full h-full mt-[-34px] items-center justify-center">
          <MapView
            ref={mapRef}
            style={{ width: "100%", flex: 1, zIndex: 0 }}
            showsUserLocation
            initialRegion={{
              latitude: 30.282962,
              longitude: -97.737224,
              latitudeDelta: 0.02,
              longitudeDelta: 0.02,
            }}
            mapPadding={{
              bottom: 72,
              top: 4,
              left: 0,
              right: 0,
            }}
            tintColor={UTBurntOrange}
          ></MapView>
        </View>
        {vehicleInfo && (
          <Animated.View
            className="absolute top-1 left-2 px-4 flex-row gap-2 items-center px-2 py-2 bg-white border border-slate-200 rounded-xl"
            entering={FadeInUp.duration(300).easing(Easing.out(Easing.cubic))}
          >
            <View className="flex-row gap-[6px] items-center">
              <FontText className="text-lg">{vehicleInfo.name}</FontText>
              {vehicleInfo.adaAccessible && (
                <View className="bg-ut-burntorange py-[2px] px-1 rounded-md">
                  <FontText className="text-xs color-white">ADA</FontText>
                </View>
              )}
            </View>
            {vehicleInfo.licensePlate && (
              <View className="bg-slate-200 px-1 rounded-md">
                <FontText className="text-lg">
                  {vehicleInfo.licensePlate}
                </FontText>
              </View>
            )}
          </Animated.View>
        )}
      </View>
      <BottomSheet
        ref={sheetRef}
        enableDynamicSizing={false}
        snapPoints={snapPoints}
        index={0}
        onChange={(index) => {
          if (index < 2) {
            scrollRef.current?.scrollTo({ y: 0, animated: true });
          }
        }}
        handleComponent={() => (
          <View className="relative w-full">
            <View className="rounded-t-[28px] flex-col items-center py-4">
              <View className="bg-slate-300 rounded w-8 h-1" />
            </View>
            <FontText
              className="text-2xl font-medium pt-1 px-5"
              onLayout={handleLayout0}
            >
              Booking details
            </FontText>
            <LinearGradient
              colors={["#ffffffff", "#ffffff00"]}
              style={{
                position: "fixed",
                top: 12,
                height: 12,
                zIndex: 100,
              }}
            />
          </View>
        )}
      >
        <BottomSheetScrollView className="px-5" ref={scrollRef}>
          {loadingState === "done" && rideDetails && (
            <>
              <View className="mt-2 pb-3" onLayout={handleLayout1}>
                {pickupLocation && dropoffLocation && (
                  <PickupDropoffLocationInfo
                    pickupLocation={pickupLocation}
                    dropoffLocation={dropoffLocation}
                  />
                )}
              </View>
              {rideDetails.groupRide.length !== 0 && (
                <>
                  <FontText className="text-xl font-medium pt-3 pb-4">
                    Share group ride
                  </FontText>
                  <View className="bg-slate-50 rounded-lg border border-slate-200 flex-row items-center justify-between px-4 py-2.5">
                    <FontText className="text-lg">
                      {rideDetails.shareCode}
                    </FontText>
                    <TouchableOpacity onPress={copyCode}>
                      <CopyIcon size={32} />
                    </TouchableOpacity>
                  </View>
                </>
              )}
              <View className="flex-row items-center justify-between w-full pt-6 pb-4">
                <FontText className="text-xl font-medium">
                  Ride members
                </FontText>
              </View>
              <View className="flex-col gap-4 pb-4">
                <RiderCard
                  member={{ firstName, lastName, userType, eid }}
                  actionComponent={
                    <CrownSimpleIcon color="#FFD600" size={24} weight="fill" />
                  }
                />
                {rideDetails.groupRide.map((member, index) => (
                  <RiderCard key={index} member={member} />
                ))}
              </View>
              <FontText className="text-xl font-medium mb-4 mt-2">
                Guidelines
              </FontText>
              <GuidelinesListShort />
              <View className="mt-6 mb-5 h-[1px] w-full bg-slate-200" />
              {!shareCode && (
                <View className="flex-row pb-6">
                  <OutlineButton
                    title="Cancel booking"
                    onPress={() => setModalVisible(true)}
                    red
                    small
                  />
                </View>
              )}
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
      <CancelRideModal
        modalVisible={modalVisible}
        setModalVisible={setModalVisible}
      />
    </View>
  );
};

export default CurrentRideInfo;
