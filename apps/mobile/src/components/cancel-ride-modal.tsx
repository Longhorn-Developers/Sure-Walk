import { WarningIcon } from "phosphor-react-native";
import { Modal, Pressable, View } from "react-native";
import { UTBurntOrange } from "../utils/colors";
import FontText from "./font-text";
import LargeButton from "./large-button";
import OutlineButton from "./outline-button";
import { router } from "expo-router";
import { useCurrentRideSession } from "../utils/context/current-ride-context";
import PickupDropoffLocationInfo from "./pickup-dropoff-location-info";
import { useEffect, useState } from "react";
import { WEST_CAMPUS_LOCATIONS } from "../utils/locations/dropoff-locations";
import { CAMPUS_LOCATIONS } from "../utils/locations/pickup-locations";
import Location from "../utils/types/location";
import { getErrorMessage, handleNetworkFailure } from "../client";
import { useToastContext } from "../utils/context/toast-context";
import { api, ok } from "../client/session";

const CancelRideModal = ({
  modalVisible,
  setModalVisible,
  isGroupRide,
}: {
  modalVisible: boolean;
  setModalVisible: (state: boolean) => void;
  isGroupRide: boolean;
}) => {
  const { currentRide, setCurrentRide } = useCurrentRideSession();
  const { setToast } = useToastContext();
  const [pickupLocation, setPickupLocation] = useState<Location | undefined>(
    undefined,
  );
  const [dropoffLocation, setDropoffLocation] = useState<Location | undefined>(
    undefined,
  );

  const cancelRide = async () => {
    try {
      setModalVisible(false);
      setToast({
        title: "Cancelling...",
        description: "Your ride is being cancelled, hold on...",
        onDismiss: () => setToast(null),
      });
      const res = await api.delete("/ride");
      if (ok(res)) {
        setCurrentRide(null);
        const data = res.data;
        setTimeout(() => {
          setToast(null);
          router.push(`/cancellation-reason?rideID=${data.rideIDForFeedback}`);
        }, 100);
      } else {
        const error = getErrorMessage(res, "Failed to cancel ride.");
        setToast({
          title: "Unexpected Error",
          description: error,
          onDismiss: () => setToast(null),
          isError: true,
        });
      }
    } catch (err) {
      handleNetworkFailure(err, setToast);
    }
  };

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

  return (
    <Modal
      animationType="fade"
      transparent
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
      className="z-1000"
    >
      <Pressable
        className="flex-1 bg-[#00000080] items-center justify-center p-5"
        onPress={() => setModalVisible(false)}
      >
        <Pressable className="p-4 bg-white flex-col gap-6 rounded-3xl w-full">
          <View className="flex-col gap-3">
            <View className="flex-row gap-2 items-center">
              <WarningIcon color={UTBurntOrange} size={32} />
              <FontText className="text-2xl font-medium">Cancel Ride</FontText>
            </View>
            <FontText className="text-lg">
              {isGroupRide ? (
                <>
                  This will cancel the following booking for{" "}
                  <FontText className="font-semibold text-lg">
                    everyone
                  </FontText>{" "}
                  in the ride. Are you sure?
                </>
              ) : (
                <>
                  You will have to make a new request if you still need a ride.
                  Are you sure?
                </>
              )}
            </FontText>
          </View>
          <View className="my-[-4px]">
            <PickupDropoffLocationInfo
              pickupLocation={pickupLocation ?? null}
              dropoffLocation={dropoffLocation ?? null}
            />
          </View>
          <View className="flex-col gap-3">
            <OutlineButton title="Yes, cancel" red onPress={cancelRide} />
            <LargeButton
              title="No, never mind"
              onPress={() => setModalVisible(false)}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CancelRideModal;
