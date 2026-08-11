import { API_URL } from "@/src/client/auth";
import FontText from "@/src/components/font-text";
import { GuidelinesListShort } from "@/src/components/guidelines-list";
import PickupDropoffLocationInfo from "@/src/components/pickup-dropoff-location-info";
import RideStateStep, {
  RideStateStepDivider,
} from "@/src/components/ride-state-step";
import RiderCard from "@/src/components/rider-card";
import { slate700, UTBluebonnet, UTBurntOrange } from "@/src/utils/colors";
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
  CarSimpleIcon,
  CircleIcon,
  CopyIcon,
  CrownSimpleIcon,
  MapPinIcon,
  WarningCircleIcon,
} from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import {
  View,
  TouchableOpacity,
  AppState,
  LayoutChangeEvent,
} from "react-native";
import MapView, { LatLng, Marker } from "react-native-maps";
import Animated, {
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
import { useToastContext } from "@/src/utils/context/toast-context";
import * as SecureStore from "expo-secure-store";
import { api } from "@/src/client/session";

const CurrentRideInfo = () => {
  const { setRideDetails, rideDetails } = useRideDetailsSession();
  const { setCurrentRide } = useCurrentRideSession();
  const params = useSearchParams();
  const shareCode = params.get("shareCode");
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [vehicleInfo, setVehicleInfo] = useState<VehicleInfoShort | null>(null);
  const [vehicleLocation, setVehicleLocation] = useState<LatLng>({
    latitude: 0,
    longitude: 0,
  });
  const wsRef = useRef<WebSocket>(undefined);
  const mapRef = useRef<MapView | null>(null);
  const sheetRef = useRef<BottomSheet | null>(null);
  const scrollRef = useRef<BottomSheetScrollViewMethods | null>(null);
  const rideStepsScrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollTarget = useSharedValue(0);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const { setMissedRide, setShowModal } = useMissedRideSession();
  const { setToast } = useToastContext();

  const snap0 = useSharedValue<number>(72);
  const snap1 = useSharedValue<number>(156);
  const snapPoints = useDerivedValue<(string | number)[]>(
    () => [snap0.value, snap1.value, "70%"],
    [snap0, snap1],
  ) as SharedValue<(string | number)[]>;

  const [pickupLocation, setPickupLocation] = useState<Location | undefined>(
    undefined,
  );
  const [dropoffLocation, setDropoffLocation] = useState<Location | undefined>(
    undefined,
  );

  const animateToStep = (rideState: InProgressRideState) => {
    if (rideState === "en route") {
      scrollTarget.value = withTiming(262, {
        duration: 1400,
        easing: Easing.inOut(Easing.cubic),
      });
    }
    if (
      rideState === "arrived" ||
      rideState === "in progress" ||
      rideState === "dropped off"
    ) {
      scrollTarget.value = withTiming(392, {
        duration: 1700,
        easing: Easing.inOut(Easing.cubic),
      });
    }
  };

  const connect = (onConnect = () => {}) => {
    const wsURL = API_URL.replace("http", "ws");
    const accessToken = SecureStore.getItem("accessToken");
    const ws = new WebSocket(
      `${wsURL}/ride/events${shareCode ? `?shareCode=${shareCode}` : ""}`,
      `Bearer ${accessToken ?? ""}`,
    );
    wsRef.current = ws;

    ws.addEventListener("message", (event) => {
      const payload = JSON.parse(event.data) as RideEvent<object>;
      switch (payload.eventType) {
        case "connected": {
          const data = payload.data as CurrentRideSmall;
          setRideDetails(data);
          if (!shareCode) {
            setCurrentRide(data);
          }
          setMissedRide(data);
          animateToStep(data.rideState);
          setLoadingState("done");
          setPickupLocation(
            CAMPUS_LOCATIONS.find((loc) => loc.id === data.pickupLocationID),
          );
          setDropoffLocation(
            WEST_CAMPUS_LOCATIONS.find(
              (loc) => loc.id === data.dropoffLocationID,
            ),
          );
          onConnect();
          break;
        }
        case "routeUpdate": {
          const data = payload.data as { rideState: InProgressRideState };
          setRideDetails((prevDetails) => ({
            ...prevDetails!,
            rideState: data.rideState,
          }));
          if (!shareCode) {
            setCurrentRide((prevRide) => ({
              ...prevRide!,
              rideState: data.rideState,
            }));
          }
          setMissedRide((prevRide) => ({
            ...prevRide!,
            rideState: data.rideState,
          }));
          animateToStep(data.rideState);
          break;
        }
        case "vehicleInfo": {
          const data = payload.data as VehicleInfoShort;
          setVehicleInfo(data);
          break;
        }
        case "vehicleLocation": {
          const data = payload.data as LatLng;
          setVehicleLocation({
            latitude: data.latitude,
            longitude: data.longitude,
          });
          break;
        }
      }
    });

    ws.addEventListener("error", (event) => {
      console.log("Websocket error: ", event);
    });

    const onClose = async (event: CloseEvent) => {
      console.log("Websocket closed: ", event.code, event.reason);
      const reason = event.reason ?? "";
      if (event.code === 1000) {
        setRideDetails(null);
        ws.removeEventListener("close", onClose);
        if (
          reason.startsWith("Complete: ") ||
          reason === "Ride cancelled." ||
          reason === "Missed pickup."
        ) {
          if (!shareCode) {
            // not viewing a group ride
            setCurrentRide(null);
          }
          if (reason === "Missed pickup.") {
            setShowModal(true);
          }
          if (shareCode && rideDetails?.shareCode) {
            // viewing a group ride and leader cancelled the ride
            setToast({
              title: "Ride Canceled",
              description: "Your ride has been canceled by the leader.",
              onDismiss: () => setToast(null),
            });
          }
          if (reason.startsWith("Complete: ")) {
            const rideID = reason.split(" ")[1];
            setTimeout(() => router.push(`/feedback?rideID=${rideID}`), 100);
          }
          router.dismissTo("/home");
        }
      } else if (reason.includes("401")) {
        try {
          // force refresh
          await api.get("/me");
          setTimeout(() =>
            connect(() =>
              setTimeout(() => {
                sheetRef.current?.snapToIndex(1);
              }, 200),
            ),
          );
        } catch (err) {
          console.error(err);
        }
      } else if (reason.includes("404")) {
        // 404
        ws.removeEventListener("close", onClose);
        router.dismissTo("/home");
        setRideDetails(null);
        if (!shareCode) {
          setToast({
            title: "Ride Not Found",
            description: "There is no active ride.",
            onDismiss: () => setToast(null),
            isError: true,
          });
          setCurrentRide(null);
        } else {
          setToast({
            title: "Ride Not Found",
            description: "There is no ride with that ride code.",
            onDismiss: () => setToast(null),
            isError: true,
          });
        }
      } else {
        // unknown error, reconnect?
        setToast({
          title: "Disconnected",
          description: "Attempting to reconnect...",
          onDismiss: () => setToast(null),
          isError: true,
        });
        setTimeout(
          () =>
            wsRef.current?.onclose !== null &&
            connect(() => {
              setToast({
                title: "Connected",
                description: "Connected to ride updates.",
                onDismiss: () => setToast(null),
              });
            }),
          2000,
        );
      }
    };

    ws.addEventListener("close", (event) => {
      onClose(event).catch((err) => console.error(err));
    });
  };

  useEffect(() => {
    setRideDetails(null);
    connect(() =>
      setTimeout(() => {
        sheetRef.current?.snapToIndex(1);
      }, 200),
    );

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
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
    snap1.set(height + 48);
  };

  useAnimatedReaction(
    () => scrollTarget.value,
    (value) => {
      scrollTo(rideStepsScrollRef, value, 0, false);
    },
  );

  const copyCode = async () => {
    await Clipboard.setStringAsync(rideDetails?.shareCode ?? "");
    setToast({
      title: "Copied!",
      description: "Copied to clipboard.",
      onDismiss: () => setToast(null),
    });
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
          >
            <Marker
              coordinate={{
                latitude: pickupLocation?.lat ?? 0,
                longitude: pickupLocation?.lon ?? 0,
              }}
              tracksViewChanges={false}
            >
              <View className="bg-[#EDD9CA] rounded-full items-center justify-center w-[32px] h-[32px]">
                <CircleIcon color={UTBurntOrange} weight="fill" size="20" />
              </View>
            </Marker>
            <Marker
              coordinate={{
                latitude: dropoffLocation?.lat ?? 0,
                longitude: dropoffLocation?.lon ?? 0,
              }}
              tracksViewChanges={false}
            >
              <View className="bg-[#C6DBE4] rounded-full items-center justify-center w-[32px] h-[32px]">
                <MapPinIcon color={UTBluebonnet} size="20" weight="fill" />
              </View>
            </Marker>
            {/* <Polyline
              coordinates={[
                {
                  latitude: pickupLocation?.lat ?? 0,
                  longitude: pickupLocation?.lon ?? 0,
                },
                {
                  latitude: dropoffLocation?.lat ?? 0,
                  longitude: dropoffLocation?.lon ?? 0,
                },
              ]}
              strokeColor="#fff"
              strokeWidth={4}
            /> */}
            <Marker
              coordinate={{
                latitude: vehicleLocation.latitude,
                longitude: vehicleLocation.longitude,
              }}
            >
              <View
                className="bg-white rounded-full items-center justify-center w-[44px] h-[44px]"
                style={{ boxShadow: "0px 4px 10px rgba(100, 100, 100, 0.2)" }}
              >
                <CarSimpleIcon color={"#000"} size={32} weight="fill" />
              </View>
            </Marker>
          </MapView>
        </View>
      </View>
      <BottomSheet
        ref={sheetRef}
        enableDynamicSizing={false}
        snapPoints={snapPoints}
        index={-1}
        handleComponent={null}
      >
        <View className="relative w-full">
          <View className="rounded-t-[28px] flex-col items-center pt-4">
            <View className="bg-slate-300 rounded w-8 h-1" />
          </View>
          <LinearGradient
            colors={["#ffffffff", "#ffffff00"]}
            style={{
              position: "fixed",
              top: 16,
              height: 16,
              zIndex: 100,
            }}
          />
        </View>
        <BottomSheetScrollView className="px-5" ref={scrollRef}>
          {loadingState === "done" && rideDetails && (
            <>
              {vehicleInfo && (
                <View
                  className="flex-col gap-4 mt-2 pb-4"
                  onLayout={handleLayout1}
                >
                  {rideDetails.rideState === "arrived" && (
                    <View className="pb-2" onLayout={handleLayout0}>
                      <View className="flex-row items-center gap-4 px-4 py-2.5 border border-ut-burntorange rounded-xl mt-1 mb-2">
                        <WarningCircleIcon color={UTBurntOrange} size={24} />
                        <View className="flex-col">
                          <FontText className="color-ut-burntorange text-lg">
                            2 minute warning
                          </FontText>
                          <FontText className="text-md color-ut-burntorange">
                            Please get to your Sure Walk ride on time!
                          </FontText>
                        </View>
                      </View>
                    </View>
                  )}
                  <FontText
                    className="text-2xl font-medium"
                    onLayout={
                      rideDetails.rideState === "in progress" ||
                      rideDetails.rideState === "dropped off"
                        ? handleLayout0
                        : undefined
                    }
                  >
                    Vehicle details
                  </FontText>
                  <View className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex-row gap-8 items-center">
                    <View className="flex-col gap-2 flex-1">
                      <FontText className="text-xl font-semibold mb-1">
                        {vehicleInfo.name}
                      </FontText>
                      <View className="flex-row gap-2 items-center">
                        {vehicleInfo.licensePlate && (
                          <View className="bg-slate-200 px-1 rounded-md">
                            <FontText className="text-lg">
                              {vehicleInfo.licensePlate}
                            </FontText>
                          </View>
                        )}
                        {vehicleInfo.adaAccessible && (
                          <View className="bg-ut-burntorange py-[2px] px-1 rounded-md">
                            <FontText className="text-md color-white">
                              ADA
                            </FontText>
                          </View>
                        )}
                      </View>
                    </View>
                    <View className="bg-blue-200 rounded-xl flex-1 h-full"></View>
                  </View>
                </View>
              )}
              <View onLayout={vehicleInfo ? undefined : handleLayout1}>
                <FontText
                  className="text-2xl font-medium mt-2 mb-2"
                  onLayout={
                    rideDetails.rideState !== "arrived" &&
                    rideDetails.rideState !== "in progress" &&
                    rideDetails.rideState !== "dropped off"
                      ? handleLayout0
                      : undefined
                  }
                >
                  Booking details
                </FontText>
                <View className="mt-2">
                  {pickupLocation && dropoffLocation && (
                    <PickupDropoffLocationInfo
                      pickupLocation={pickupLocation}
                      dropoffLocation={dropoffLocation}
                    />
                  )}
                </View>
              </View>
              {rideDetails.groupRide.length !== 0 && (
                <>
                  <FontText className="text-xl font-medium pt-6 pb-4">
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
                  member={{
                    firstName: rideDetails.leader.firstName,
                    lastName: rideDetails.leader.lastName,
                    userType: rideDetails.leader.userType,
                    eid: rideDetails.leader.eid,
                    phoneNumber: rideDetails.leader.phoneNumber,
                  }}
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
              {!shareCode &&
                rideDetails.rideState !== "in progress" &&
                rideDetails.rideState !== "dropped off" && (
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
        isGroupRide={rideDetails?.shareCode ? true : false}
      />
    </View>
  );
};

export default CurrentRideInfo;
