import { getErrorMessage } from "@/src/client";
import FontText from "@/src/components/font-text";
import { GuidelinesListShort } from "@/src/components/guidelines-list";
import LargeButton from "@/src/components/large-button";
import OutlineButton from "@/src/components/outline-button";
import PickupDropoffLocationInfo from "@/src/components/pickup-dropoff-location-info";
import RiderCard from "@/src/components/rider-card";
import { slate700 } from "@/src/utils/colors";
import { useCurrentRideSession } from "@/src/utils/context/current-ride-context";
import { useGroupRideSession } from "@/src/utils/context/group-ride-context";
import { useRideSession } from "@/src/utils/context/ride-context";
import { useTabContext } from "@/src/utils/context/tab-context";
import { useToastContext } from "@/src/utils/context/toast-context";
import { useSession } from "@/src/utils/context/user-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { CaretLeftIcon, CrownSimpleIcon } from "phosphor-react-native";
import { useState } from "react";
import {
  NativeScrollEvent,
  NativeSyntheticEvent,
  TouchableOpacity,
  View,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";

const ConfirmRide = () => {
  const { pickupLocation, dropoffLocation } = useRideSession();
  const { members, clearMembers } = useGroupRideSession();
  const { user, fetchProtected } = useSession();
  const { firstName, lastName, userType, eid } = user!;
  const { setDropoffLocation, setPickupLocation } = useRideSession();
  const { goMyRide } = useTabContext();
  const { setCurrentRide: setCurrentRideMini, setLoadingState } =
    useCurrentRideSession();
  const { setToast } = useToastContext();
  const [confirmEnabled, setConfirmEnabled] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

    if (isCloseToBottom) {
      setConfirmEnabled(true);
    }
  };

  const submitRide = async () => {
    setSubmitting(true);
    const response = await fetchProtected("/ride", "POST", {
      pickupLocation: pickupLocation!.id,
      dropoffLocation: dropoffLocation!.id,
      groupRide: members,
    });

    setSubmitting(false);
    if (!response.ok) {
      const errorMessage = await getErrorMessage(
        response,
        "Failed to submit ride.",
      );
      setToast({
        title: "Unexpected error",
        description: errorMessage,
        onDismiss: () => setToast(null),
        isError: true,
      });
    } else {
      setDropoffLocation(null);
      setPickupLocation(null);
      setCurrentRideMini({
        pickupLocationID: pickupLocation!.id,
        dropoffLocationID: dropoffLocation!.id,
        rideState: "received",
      });
      clearMembers();
      setLoadingState("done");
      goMyRide();
      setTimeout(() => router.push("/home/ride-info-wrapper"), 500);
    }
  };

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
        <FontText className="font-medium text-2xl">
          Confirm your booking
        </FontText>
      </View>
      <View className="relative mt-[-16px] z-5 flex-1 mx-[-20px]">
        <LinearGradient
          colors={["#ffffffff", "#ffffff00"]}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 16,
            zIndex: 10,
          }}
        />
        <LinearGradient
          colors={["#ffffff00", "#ffffffff"]}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 16,
            zIndex: 10,
          }}
        />
        <ScrollView
          className="flex-col py-4 pt-[-16px] px-5"
          onMomentumScrollEnd={handleScroll}
        >
          <View className="flex-col gap-6 flex-1 mt-4">
            <View className="flex-col gap-4">
              <View className="flex-row w-full justify-between items-center">
                <FontText className="text-xl font-semibold">
                  Pick-up and drop-off
                </FontText>
                <OutlineButton
                  title="Edit"
                  onPress={() => router.back()}
                  small
                />
              </View>
              <PickupDropoffLocationInfo
                pickupLocation={pickupLocation}
                dropoffLocation={dropoffLocation}
              />
            </View>
            <View className="h-[1px] bg-gray-200 w-full" />
            <View className="flex-col gap-4">
              <FontText className="text-xl font-semibold">Guidelines</FontText>
              <GuidelinesListShort />
            </View>
            <View className="h-[1px] bg-gray-200 w-full" />
            <View className="flex-col gap-4">
              <View className="flex-row w-full justify-between items-center">
                <FontText className="text-xl font-semibold">
                  Ride members ({members.length + 1})
                </FontText>
                <OutlineButton
                  title="Edit"
                  onPress={() => router.navigate("/home/group-ride")}
                  small
                />
              </View>
              <View className="flex-col gap-4 pb-4">
                <RiderCard
                  member={{ firstName, lastName, userType, eid }}
                  actionComponent={
                    <CrownSimpleIcon color="#FFD600" size={24} weight="fill" />
                  }
                />
                {members.map((member, index) => (
                  <RiderCard key={index} member={member} />
                ))}
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
      <LargeButton
        title={
          submitting
            ? "Submitting..."
            : confirmEnabled
              ? "Confirm"
              : "Scroll down to confirm"
        }
        onPress={() => submitRide()}
        disabled={!confirmEnabled || submitting}
      />
    </View>
  );
};

export default ConfirmRide;
