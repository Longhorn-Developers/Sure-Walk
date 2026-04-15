import FontText from "@/src/components/font-text";
import {
  CircleIcon,
  FadersHorizontalIcon,
  MapPinIcon,
  NavigationArrowIcon,
  StarIcon,
  UserCirclePlusIcon,
} from "phosphor-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Platform,
  Pressable,
  StyleProp,
  TextInput,
  TextStyle,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import BottomSheet, {
  BottomSheetFlatList,
  TouchableOpacity as TO,
} from "@gorhom/bottom-sheet";
import Animated, { Easing, FadeInUp, FadeOutUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import CheckButton from "@/src/components/check-button";
import MapView, { Polygon } from "react-native-maps";
import * as Location from "expo-location";
import {
  dropoffBoundaryPolygons,
  pickupBoundaryPolygons,
} from "@/src/utils/boundary-info";
import {
  gray900,
  slate700,
  slate900,
  UTBluebonnet,
  UTBurntOrange,
  UTTangerine,
  UTTurquoise,
} from "@/src/utils/colors";
import { useGroupRideSession } from "@/src/utils/context/group-ride-context";
import { router } from "expo-router";
import { Location as LocationType } from "@/src/utils/types/location";
import { getMatchingPickupLocations } from "@/src/utils/locations/pickup-locations";
import { getMatchingDropoffLocations } from "@/src/utils/locations/dropoff-locations";

const Home = () => {
  let _style: StyleProp<TextStyle> = {};
  if (Platform.OS === "ios") {
    _style.lineHeight = 0;
  }

  const { members } = useGroupRideSession();

  const sheetRef = useRef<BottomSheet>(null);
  const mapRef = useRef<MapView>(null);
  const startLocationRef = useRef<TextInput>(null);
  const destinationRef = useRef<TextInput>(null);
  const { height } = useWindowDimensions();
  const androidOffset = Platform.OS === "android" ? -16 : 0; // weird offset hack on android
  // maybe due to bottom bar safe area inset?
  // snap bar at roughly 11%, 40%, and 90%
  const snapPoints = useMemo(
    () => [
      `${((100 + androidOffset) / height) * 100}%`,
      `${((290 + androidOffset * 1.5) / height) * 100}%`,
      "80.5%",
    ],
    [height, androidOffset],
  );
  const [snapIndex, setSnapIndex] = useState<number>(1);
  const [legendOpen, setLegendOpen] = useState<boolean>(false);
  const [showPickupBoundary, setPickupBoundary] = useState<boolean>(true);
  const [showDropoffBoundary, setDropoffBoundary] = useState<boolean>(true);

  const [, setLocation] = useState<Location.LocationObject | null>(null);

  const [startLocationText, setStartLocationText] = useState<string>("");
  const [destinationText, setDestinationText] = useState<string>("");
  const [focusedInput, setFocusedInput] = useState<"pickup" | "dropoff">(
    "pickup",
  );
  const [pickupList, setPickupList] = useState<LocationType[]>([]);
  const [dropoffList, setDropoffList] = useState<LocationType[]>([]);
  const [startLocationAddress, setStartAddress] = useState<string>(
    "Select your pickup location",
  );
  const [destinationAddress, setDestinationAddress] = useState<string>(
    "Select your destination",
  );

  const centerMapOnLocation = (location: Location.LocationObject) => {
    setTimeout(() => {
      mapRef.current?.animateToRegion({
        latitude: location.coords.latitude - 0.0038,
        longitude: location.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    }, 1000);
  };

  useEffect(() => {
    async function requestLocationPermissions() {
      let { status: currentStatus } =
        await Location.getForegroundPermissionsAsync();
      let finalStatus = currentStatus;
      if (currentStatus !== "granted") {
        let { status } = await Location.requestForegroundPermissionsAsync();
        finalStatus = status;
      }

      mapRef.current?.animateToRegion(
        {
          latitude: 30.282962,
          longitude: -97.737224,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        },
        0,
      );

      if (finalStatus !== "granted") {
        console.error("location denied");
        return;
      } else {
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.BestForNavigation,
        });
        setLocation(location);
        centerMapOnLocation(location);
      }
    }

    requestLocationPermissions();
  }, []);

  useEffect(() => {
    setPickupList(getMatchingPickupLocations(startLocationText));
  }, [startLocationText]);

  useEffect(() => {
    setDropoffList(getMatchingDropoffLocations(destinationText));
  }, [destinationText]);

  // const resetMapView = (location: LocationType) => {
  //   setPickupList([]);
  //   setDropoffList([]);
  //   mapRef.current?.animateToRegion(
  //     {
  //       latitude: location.lat,
  //       longitude: location.lon,
  //       latitudeDelta: 0.02,
  //       longitudeDelta: 0.02,
  //     },
  //     500,
  //   );
  // };

  const clickedPickupLocation = (location: LocationType) => () => {
    setStartLocationText(location.name);
    setStartAddress(location.address);
    setFocusedInput("dropoff");
    if (startLocationRef.current?.isFocused()) {
      destinationRef.current?.focus();
    }
  };

  const clickedDropoffLocation = (location: LocationType) => () => {
    setDestinationText(location.name);
    setDestinationAddress(location.address);
  };

  return (
    <View className="bg-white flex-1 flex-col items-center pt-safe">
      <View className="relative flex-col items-center justify-center pt-3 pb-8 px-5 w-full">
        <View className="flex-col items-center justify-center gap-1">
          <View className="flex-row justify-center items-center gap-1">
            <NavigationArrowIcon
              color={UTBurntOrange}
              size="16"
              weight="fill"
              mirrored
            />
            <FontText className="font-medium text-3.5 text-slate-700">
              Your Location
            </FontText>
          </View>
          <FontText className="font-medium text-4 text-center">
            Perry-Castañeda Library
          </FontText>
        </View>
        <TouchableOpacity
          className="absolute right-5 top-3 p-3 items-center justify-center rounded-2xl bg-slate-100"
          onPress={() => {
            if (snapIndex === 2) sheetRef.current?.snapToIndex(1);
            setLegendOpen(!legendOpen);
          }}
        >
          <FadersHorizontalIcon color={slate700} size="24" />
        </TouchableOpacity>
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
              bottom: 92,
              top: legendOpen ? 128 : 20,
              left: 0,
              right: 0,
            }}
            tintColor={UTBurntOrange}
          >
            {pickupBoundaryPolygons.map((coords, index) => (
              <Polygon
                coordinates={coords}
                key={index}
                fillColor={
                  showPickupBoundary ? `${UTTangerine}30` : "#00000000"
                }
                strokeColor={
                  showPickupBoundary ? UTTangerine : "rgba(0, 0, 0, 0)"
                }
              />
            ))}
            {dropoffBoundaryPolygons.map((coords, index) => (
              <Polygon
                coordinates={coords}
                holes={
                  index === 0
                    ? [
                        [
                          {
                            latitude: 30.289121 + 0.00001,
                            longitude: -97.7429238 - 0.00001,
                          },
                          {
                            latitude: 30.2883058 - 0.00001,
                            longitude: -97.7430042 - 0.00001,
                          },
                          {
                            latitude: 30.2882641 - 0.00001,
                            longitude: -97.7423873 + 0.00001,
                          },
                          {
                            latitude: 30.2890701 + 0.00001,
                            longitude: -97.7423283 + 0.00001,
                          },
                          {
                            latitude: 30.289121 + 0.00001,
                            longitude: -97.7429238 - 0.00001,
                          },
                        ],
                        [
                          {
                            latitude: 30.2888591 + 0.00001,
                            longitude: -97.7437415 - 0.00001,
                          },
                          {
                            latitude: 30.287935 - 0.00001,
                            longitude: -97.743838 - 0.00001,
                          },
                          {
                            latitude: 30.2878887 - 0.00001,
                            longitude: -97.7431889 + 0.00001,
                          },
                          {
                            latitude: 30.288822 + 0.00001,
                            longitude: -97.7430897 + 0.00001,
                          },
                          {
                            latitude: 30.2888591 + 0.00001,
                            longitude: -97.7437415 - 0.00001,
                          },
                        ],
                      ]
                    : undefined
                }
                key={index}
                fillColor={
                  showDropoffBoundary ? `${UTTurquoise}30` : "#00000000"
                }
                strokeColor={
                  showDropoffBoundary ? UTTurquoise : "rgba(0, 0, 0, 0)"
                }
              />
            ))}
          </MapView>
        </View>
        {legendOpen && (
          <>
            <Animated.View
              className="absolute top-[28px] right-5 px-4 py-2 bg-white rounded-full border border-slate-200 flex-row justify-end"
              entering={FadeInUp.duration(150).easing(Easing.out(Easing.cubic))}
              exiting={FadeOutUp.duration(150).easing(Easing.in(Easing.cubic))}
            >
              <CheckButton
                label="Pickup & Drop-Off Boundary"
                onPress={() => setPickupBoundary(!showPickupBoundary)}
                isChecked={showPickupBoundary}
                color={UTTangerine}
              />
            </Animated.View>
            <Animated.View
              className="absolute top-[70px] right-5 mt-2.5 px-4 py-2 bg-white rounded-full border border-slate-200 flex-row"
              entering={FadeInUp.duration(150)
                .delay(50)
                .easing(Easing.out(Easing.cubic))}
              exiting={FadeOutUp.duration(150)
                .delay(50)
                .easing(Easing.in(Easing.cubic))}
            >
              <CheckButton
                label="Drop-Off Boundary"
                onPress={() => setDropoffBoundary(!showDropoffBoundary)}
                isChecked={showDropoffBoundary}
                color={UTTurquoise}
              />
            </Animated.View>
          </>
        )}
      </View>
      <BottomSheet
        ref={sheetRef}
        snapPoints={snapPoints}
        enableDynamicSizing={false}
        index={1}
        style={{
          borderRadius: 28,
          backgroundColor: "transparent",
          zIndex: 150,
        }}
        onChange={(index) => {
          if (index !== 2) {
            destinationRef.current?.blur();
          }
          setSnapIndex(index);
        }}
        handleComponent={() => (
          <View className="relative flex-col rounded-t-[28px]">
            <View className="rounded-t-[28px] flex-col items-center py-4">
              <View className="bg-slate-300 rounded w-8 h-1" />
            </View>
            <View className="flex-col gap-5 px-5 pb-1">
              <View className="flex-row w-full justify-between items-center">
                <FontText className="text-2xl font-medium">
                  Book a ride
                </FontText>
                <TO onPress={() => router.navigate("/home/group-ride")}>
                  <View className="flex-row gap-1 p-3 items-center bg-slate-50 rounded-[32px] border border-slate-200">
                    <UserCirclePlusIcon color={slate700} size="24" />
                    <FontText className="font-medium">{`${members.length === 0 ? "Add" : members.length + 1} Riders`}</FontText>
                  </View>
                </TO>
              </View>
            </View>
          </View>
        )}
      >
        <BottomSheetFlatList
          stickyHeaderIndices={[0]}
          overScrollMode={"always"}
          scrollEnabled={
            Platform.OS === "android" ? snapIndex === 2 : undefined
          }
          data={focusedInput === "pickup" ? pickupList : dropoffList}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={
            <View className="flex-col mb-[-16px]">
              <View className="flex-col bg-white pt-4">
                <View className="flex-col rounded-lg">
                  <Pressable
                    className="bg-slate-50 flex-row p-4 gap-4 items-center rounded-t-2xl border border-slate-200"
                    onPress={() => startLocationRef.current?.focus()}
                  >
                    <View className="bg-[#BF570033] rounded-full items-center justify-center w-[32px] h-[32px]">
                      <CircleIcon
                        color={UTBurntOrange}
                        weight="fill"
                        size="20"
                      />
                    </View>
                    <View className="flex-1 flex-col gap-1">
                      <TextInput
                        ref={startLocationRef}
                        onFocus={() => {
                          setFocusedInput("pickup");
                          snapIndex !== 2 && sheetRef.current?.expand();
                        }}
                        className="font-medium text-lg flex-1"
                        placeholder="Where from?"
                        placeholderTextColor={gray900}
                        onChangeText={(text) => {
                          setStartLocationText(text);
                          if (!startLocationAddress.startsWith("Select")) {
                            setStartAddress("Select your pickup location");
                          }
                        }}
                        value={startLocationText}
                        style={_style}
                      />
                      <FontText className="text-lg color-[#333F48]">
                        {startLocationAddress}
                      </FontText>
                    </View>
                  </Pressable>
                  <Pressable
                    className="bg-slate-50 flex-row p-4 gap-4 items-center rounded-b-2xl border border-slate-200 mt-[-1px] mb-6"
                    onPress={() => destinationRef.current?.focus()}
                  >
                    <View className="bg-[#005F8633] rounded-full items-center justify-center w-[32px] h-[32px]">
                      <MapPinIcon
                        color={UTBluebonnet}
                        size="20"
                        weight="fill"
                      />
                    </View>
                    <View className="flex-1 flex-col gap-1">
                      <TextInput
                        ref={destinationRef}
                        onFocus={() => {
                          setFocusedInput("dropoff");
                          snapIndex !== 2 && sheetRef.current?.expand();
                        }}
                        className="font-medium text-lg flex-1"
                        placeholder="Where to?"
                        placeholderTextColor={gray900}
                        onChangeText={(text) => {
                          setDestinationText(text);
                          if (!destinationAddress.startsWith("Select")) {
                            setDestinationAddress("Select your destination");
                          }
                        }}
                        value={destinationText}
                        style={_style}
                      />
                      <FontText className="text-lg color-[#333F48]">
                        {destinationAddress}
                      </FontText>
                    </View>
                  </Pressable>
                </View>
              </View>
              <LinearGradient
                colors={["#ffffffff", "#ffffff00"]}
                style={{
                  marginTop: -1,
                  height: 24,
                  zIndex: 50,
                }}
              />
            </View>
          }
          renderItem={({ index, item }) => (
            <TouchableOpacity
              key={index}
              onPress={
                focusedInput === "pickup"
                  ? clickedPickupLocation(item)
                  : clickedDropoffLocation(item)
              }
            >
              <View
                key={index}
                className={`flex-col ${index === (focusedInput === "pickup" ? pickupList : dropoffList).length - 1 ? "" : "border-b"} border-gray-200 pb-4 pt-2`}
              >
                <View className="flex-row gap-2 items-center">
                  <MapPinIcon color={slate900} size="24" />
                  <View className="flex-1 flex-col gap-2 justify-around">
                    <FontText className="font-medium text-lg/1">
                      {item.name}
                    </FontText>
                    <FontText className="font-regular text-[14px]/1 text-gray-500">
                      {item.address}
                    </FontText>
                  </View>
                  <StarIcon color={slate900} size="24" />
                </View>
              </View>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            (((focusedInput === "pickup" && startLocationText !== "") ||
              (focusedInput === "dropoff" && destinationText !== "")) && (
              <TouchableOpacity
                onPress={() =>
                  focusedInput === "pickup"
                    ? (setStartLocationText(""),
                      setStartAddress("Select your pickup location"))
                    : (setDestinationText(""),
                      setDestinationAddress("Select your destination"))
                }
              >
                <FontText className="mt-4">
                  Clear {focusedInput} selection
                </FontText>
              </TouchableOpacity>
            )) || <View />
          }
          contentContainerStyle={{
            position: "relative",
            paddingHorizontal: 20,
            flexDirection: "column",
            gap: 4,
            justifyContent: "flex-start",
          }}
        ></BottomSheetFlatList>
      </BottomSheet>
    </View>
  );
};

export default Home;
