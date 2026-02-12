import { ScrollView, Text, View } from "react-native";
import {
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  WarningIcon,
  MoonIcon,
  HamburgerIcon,
  XCircleIcon,
  IconContext,
} from "phosphor-react-native";
import { TimerIcon } from "phosphor-react-native/src/icons/Timer";

const guidelines = () => {
  return (
    <IconContext.Provider
      value={{ color: "#BF5700", size: 21, weight: "bold" }}
    >
      <ScrollView className="bg-white flex-1 h-full">
        <View className="flex-1 gap-5 p-5 pt-8">
          <Text className="text-gray-950 text-2xl font-medium leading-none">
            Information and Guidelines
          </Text>
          <View className="flex-1 gap-3.5 justify-start">
            <View className="gap-2">
              <View className="flex-row gap-2 items-center">
                <ClockIcon />
                <Text className="text-gray-900 text-xl font-semibold leading-[26px]">
                  Hours of Operation
                </Text>
              </View>
              <View className="ms-8 me-8 pb-3.5 border-b border-gray-300">
                <Text className="text-gray-900 text-lg leading-normal">
                  We operate from 7 PM to 2 AM, we won’t accept any requests
                  that are not within this time frame.
                </Text>
              </View>
            </View>
            <View className="gap-2">
              <View className="flex-row gap-2 items-center">
                <UsersIcon />
                <Text className="text-gray-900 text-xl font-semibold leading-[26px]">
                  Rideshare Service
                </Text>
              </View>
              <View className="ms-8 me-8 pb-3.5 border-b border-gray-300">
                <Text className="text-gray-900 text-lg leading-normal">
                  This is a free service available to everyone, you may be in a
                  vehicle with others.
                </Text>
              </View>
            </View>
            <View className="gap-2">
              <View className="flex-row gap-2 items-center">
                <MapPinIcon />
                <Text className="text-gray-900 text-xl font-semibold leading-[26px]">
                  Pick Up/Drop Off Boundaries
                </Text>
              </View>
              <View className="ms-8 me-8 pb-3.5 border-b border-gray-300">
                <Text className="text-gray-900 text-lg leading-normal">
                  • Pickups: Must begin from an on-campus location {"\n"}•
                  Drop-offs: Allowed to West Campus, off-campus neighborhoods
                  within the service area, or to another on-campus location{" "}
                  {"\n"}• Sure Walk does not provide rides to any food
                  establishment
                </Text>
              </View>
            </View>
            <View className="gap-2">
              <View className="flex-row gap-2 items-center">
                <WarningIcon />
                <Text className="text-gray-900 text-xl font-semibold leading-[26px]">
                  No Booking in Advance
                </Text>
              </View>
              <View className="ms-8 me-8 pb-3.5 border-b border-gray-300">
                <Text className="text-gray-900 text-lg leading-normal">
                  Book when you are ready to be picked up. We do not offer
                  advance reservations.
                </Text>
              </View>
            </View>
            <View className="gap-2">
              <View className="flex-row gap-2 items-center">
                <TimerIcon />
                <Text className="text-gray-900 text-xl font-semibold leading-[26px]">
                  2-Minute Wait Period
                </Text>
              </View>
              <View className="ms-8 me-8 pb-3.5 border-b border-gray-300">
                <Text className="text-gray-900 text-lg leading-normal">
                  Drivers will wait 2 minutes once arriving at a pick up spot
                  before departing.
                </Text>
              </View>
            </View>
            <View className="gap-2">
              <View className="flex-row gap-2 items-center">
                <MoonIcon />
                <Text className="text-gray-900 text-xl font-semibold leading-[26px]">
                  Disable "Do Not Disturb"
                </Text>
              </View>
              <View className="ms-8 me-8 pb-3.5 border-b border-gray-300">
                <Text className="text-gray-900 text-lg leading-normal">
                  Make sure you can receive calls. One of our dispatchers will
                  call to confirm your booking or notify you of delays.
                </Text>
              </View>
            </View>
            <View className="gap-2">
              <View className="flex-row gap-2 items-center">
                <HamburgerIcon />
                <Text className="text-gray-900 text-xl font-semibold leading-[26px]">
                  No Food or Drink in the Vehicles
                </Text>
              </View>
              <View className="ms-8 me-8 pb-3.5 border-b border-gray-300">
                <Text className="text-gray-900 text-lg leading-normal">
                  To keep our vehicles clean, please avoid bringing any food or
                  drinks.
                </Text>
              </View>
            </View>
            <View className="gap-2">
              <View className="flex-row gap-2 items-center">
                <XCircleIcon />
                <Text className="text-gray-900 text-xl font-semibold leading-[26px]">
                  Cancellations
                </Text>
              </View>
              <View className="ms-8 me-8 pb-3.5">
                <Text className="text-gray-900 text-lg leading-normal">
                  If you need to cancel your ride, do so through the app prior
                  to your vehicle’s arrival.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </IconContext.Provider>
  );
};

export default guidelines;
