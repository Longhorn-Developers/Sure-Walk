import { WarningIcon } from "phosphor-react-native";
import { Modal, Pressable, View } from "react-native";
import { UTBurntOrange } from "../utils/colors";
import FontText from "./font-text";
import LargeButton from "./large-button";
import OutlineButton from "./outline-button";
import { router } from "expo-router";
import { useSession } from "../utils/context/user-context";
import { useCurrentRideSession } from "../utils/context/current-ride-context";

const CancelRideModal = ({
  modalVisible,
  setModalVisible,
}: {
  modalVisible: boolean;
  setModalVisible: (state: boolean) => void;
}) => {
  const { fetchProtected } = useSession();
  const { setCurrentRide } = useCurrentRideSession();

  const cancelRide = async () => {
    try {
      setModalVisible(false);
      const res = await fetchProtected("/ride", "DELETE");
      if (res.ok) {
        setCurrentRide(null);
        const data = await res.json();
        setTimeout(() => {
          router.push(`/cancellation-reason?rideID=${data.rideIDForFeedback}`);
        }, 1000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
      className="z-1000"
    >
      <Pressable
        className="flex-1 bg-[#00000080] items-center justify-center"
        onPress={() => setModalVisible(false)}
      >
        <Pressable className="m-5 p-4 bg-white flex-col gap-6 rounded-3xl">
          <View className="flex-col gap-3">
            <View className="flex-row gap-2 items-center">
              <WarningIcon color={UTBurntOrange} size={32} />
              <FontText className="text-2xl font-medium">Cancel Ride</FontText>
            </View>
            <FontText className="text-lg">
              Are you sure you want to cancel your Sure Walk?
            </FontText>
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
