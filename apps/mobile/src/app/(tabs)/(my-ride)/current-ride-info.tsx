import { API_URL } from "@/src/client/auth";
import FontText from "@/src/components/font-text";
import { GuidelinesListShort } from "@/src/components/guidelines-list";
import PickupDropoffLocationInfo from "@/src/components/pickup-dropoff-location-info";
import RideStateStep, {
  RideStateStepDivider,
} from "@/src/components/ride-state-step";
import RiderCard from "@/src/components/rider-card";
import { slate700, UTBurntOrange } from "@/src/utils/colors";
import { useCurrentRideSession } from "@/src/utils/context/current-ride-context";
import { useSession } from "@/src/utils/context/user-context";
import { WEST_CAMPUS_LOCATIONS } from "@/src/utils/locations/dropoff-locations";
import { CAMPUS_LOCATIONS } from "@/src/utils/locations/pickup-locations";
import LoadingState from "@/src/utils/types/loading-state";
import Location from "@/src/utils/types/location";
import BottomSheet, {
  BottomSheetScrollView,
  BottomSheetScrollViewMethods,
} from "@gorhom/bottom-sheet";
import CurrentRideMini from "@sure-walk/utils/types/current-ride-mini";
import InProgressRideState from "@sure-walk/utils/types/in-progress-ride-state";
import VehicleInfoShort from "@sure-walk/utils/types/vehicle-info-short";
import RideEvent from "@sure-walk/utils/types/ride-event";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { CaretLeftIcon, CrownSimpleIcon } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  AppState,
  ScrollView,
  LayoutChangeEvent,
} from "react-native";
import MapView from "react-native-maps";
import Animated, {
  FadeInUp,
  SharedValue,
  useDerivedValue,
  useSharedValue,
  Easing,
} from "react-native-reanimated";

const CurrentRideInfo = () => {
  const { accessToken, fetchProtected, user } = useSession();
  const { firstName, lastName, userType, eid } = user!;
  const { setCurrentRideMini, currentRideMini } = useCurrentRideSession();
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfoShort | null>(null);
  const wsRef = useRef<WebSocket>(undefined);
  const mapRef = useRef<MapView | null>(null);
  const sheetRef = useRef<BottomSheet | null>(null);
  const scrollRef = useRef<BottomSheetScrollViewMethods | null>(null);

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

  const connect = () => {
    const wsURL = API_URL.replace("http", "ws");
    const ws = new WebSocket(
      `${wsURL}/ride/events`,
      `Bearer ${accessToken ?? ""}`,
    );
    wsRef.current = ws;

    ws.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data) as RideEvent<object>;
      switch (payload.eventType) {
        case "connected": {
          console.log("websocket connected");
          setLoadingState("done");
          const data = payload.data as CurrentRideMini;
          setCurrentRideMini(data);
          break;
        }
        case "routeUpdate": {
          const data = payload.data as { rideState: InProgressRideState };
          setCurrentRideMini({
            pickupLocationID: currentRideMini?.pickupLocationID!,
            dropoffLocationID: currentRideMini?.dropoffLocationID!,
            groupRide: currentRideMini?.groupRide ?? [],
            rideState: data.rideState,
          });
          break;
        }
        case "vehicleInfo": {
          const data = payload.data as VehicleInfoShort;
          setVehicleInfo(data);
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
        if (event.reason === "complete") {
          setCurrentRideMini(null);
          router.dismissTo("/home");
        }
      } else if (event.reason.includes("401")) {
        try {
          // force refresh
          await fetchProtected("/me", "GET");
        } catch (err) {
          console.error(err);
        }
      } else {
        // 404
        ws.removeEventListener("close", onClose);
        router.dismissTo("/home");
        setCurrentRideMini(null);
      }
    };

    ws.addEventListener("close", onClose);
  };

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
        <ScrollView
          horizontal
          contentContainerStyle={{
            paddingHorizontal: 56,
          }}
          showsHorizontalScrollIndicator={false}
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
        </ScrollView>
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
          if (index <= 2) {
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
          <View className="mt-2 pb-2" onLayout={handleLayout1}>
            {pickupLocation && dropoffLocation && (
              <PickupDropoffLocationInfo
                pickupLocation={pickupLocation}
                dropoffLocation={dropoffLocation}
              />
            )}
          </View>
          {loadingState === "done" && currentRideMini && (
            <>
              {currentRideMini.groupRide.length !== 0 && (
                <>
                  <FontText className="text-xl font-medium py-4">
                    Share group ride
                  </FontText>
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
                {currentRideMini.groupRide.map((member, index) => (
                  <RiderCard key={index} member={member} />
                ))}
              </View>
              <FontText className="text-xl font-medium mb-4 mt-2">
                Guidelines
              </FontText>
              <GuidelinesListShort />
              <View className="h-6" />
            </>
          )}
        </BottomSheetScrollView>
      </BottomSheet>
    </View>
  );
};

export default CurrentRideInfo;
