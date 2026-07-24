import { View } from "react-native";
import {
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  WarningIcon,
  TimerIcon,
  HamburgerIcon,
  XCircleIcon,
  IconContext,
  PhoneCallIcon,
} from "phosphor-react-native";
import FontText from "./font-text";
import { UTBurntOrange } from "../utils/colors";

const GuidelinesList = ({ includeBottomBorder = false }) => {
  const guidelines = [
    {
      icon: <ClockIcon />,
      title: "Hours of Operation",
      description:
        "8pm - 2am, 7 days/week\n*Excludes holidays and when the campus is closed\n**7pm - 2am during standard (winter) time",
    },
    {
      icon: <PhoneCallIcon />,
      title: "Enable Phone Calls",
      description:
        "Turn off “Do Not Disturb” so dispatch can reach you about your ride",
    },
    {
      icon: <MapPinIcon />,
      title: "Pick Up & Drop-off",
      description:
        "Pickups: Must begin on-campus\nDrop-offs are available:\n    • On campus\n    • West Campus\n    • Eligible off-campus neighborhoods",
    },
    {
      icon: <XCircleIcon />,
      title: "Cancellations",
      description: "Cancel your ride in the app before your driver arrives",
    },
    {
      icon: <WarningIcon />,
      title: "No Booking in Advance",
      description: "Request a ride only when you're ready for pickup",
    },
    {
      icon: <TimerIcon />,
      title: "2-Minute Wait Period",
      description:
        "Drivers wait 2 minutes after arriving at the pickup location before leaving",
    },
    {
      icon: <UsersIcon />,
      title: "Shared Rides",
      description:
        "Sure Walk is a free ride-share service, you may be in a vehicle with others",
    },
    {
      icon: <HamburgerIcon />,
      title: "No Food or Drink in the Vehicles",
      description:
        "To keep our vehicles clean, please avoid bringing any food or drinks",
    },
  ];

  return (
    <IconContext.Provider
      value={{ color: UTBurntOrange, size: 20, weight: "bold" }}
    >
      <View className={"flex-1 gap-5 p-5 pt-4"}>
        <View className="flex-1 gap-3.5 justify-start w-full">
          {guidelines.map((guideline, index) => (
            <View key={index} className="gap-2 flex-col">
              <View className="flex-row gap-2 items-center">
                {guideline.icon}
                <FontText className="text-gray-900 text-xl font-semibold leading-[26px]">
                  {guideline.title}
                </FontText>
              </View>
              <View
                className={`ms-8 me-8 pb-3.5 ${includeBottomBorder || index < guidelines.length - 1 ? "border-b border-gray-300" : ""}`}
              >
                <FontText className="text-gray-900 text-lg">
                  {guideline.description}
                </FontText>
              </View>
            </View>
          ))}
        </View>
      </View>
    </IconContext.Provider>
  );
};

export const GuidelinesListShort = () => {
  const guidelines = [
    {
      icon: <TimerIcon size={24} />,
      text: "Board within 2 minutes of arrival",
    },
    {
      icon: <PhoneCallIcon size={24} />,
      text: 'Turn off "Do Not Disturb"',
    },
    {
      icon: <HamburgerIcon size={24} />,
      text: "No food or drinks in the vehicle",
    },
  ];

  return (
    <View className="flex-col gap-3">
      {guidelines.map(({ icon, text }, index) => (
        <View
          className="flex-row gap-2 px-4 bg-gray-50 border border-gray-200 rounded-lg align-center"
          key={index}
        >
          <View className="flex-col justify-center">{icon}</View>
          <FontText className="py-4 font-medium text-lg">{text}</FontText>
        </View>
      ))}
    </View>
  );
};

export default GuidelinesList;
