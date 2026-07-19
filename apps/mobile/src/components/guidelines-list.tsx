import { View } from "react-native";
import {
  ClockIcon,
  UsersIcon,
  MapPinIcon,
  WarningIcon,
  TimerIcon,
  MoonIcon,
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
        "We operate from 7 PM to 2 AM, we won’t accept any requests that are not within this time frame.",
    },
    {
      icon: <UsersIcon />,
      title: "Rideshare Service",
      description:
        "This is a free service available to everyone, you may be in a vehicle with others.",
    },
    {
      icon: <MapPinIcon />,
      title: "Pick Up / Drop Off Boundaries",
      description:
        "• Pickups: Must begin from an on-campus location \n• Drop-offs: Allowed to West Campus, off-campus neighborhoods within the service area, or to another on-campus location \n• Sure Walk does not provide rides to any food establishment",
    },
    {
      icon: <WarningIcon />,
      title: "No Booking in Advance",
      description:
        "Book when you are ready to be picked up. We do not offer advance reservations.",
    },
    {
      icon: <TimerIcon />,
      title: "2-Minute Wait Period",
      description:
        "If you are not at your pickup location within 2 minutes of your scheduled pickup time, your request will be canceled.",
    },
    {
      icon: <MoonIcon />,
      title: "Disable 'Do Not Disturb'",
      description:
        "Please disable 'Do Not Disturb' mode on your phone to ensure you receive notifications from Sure Walk.",
    },
    {
      icon: <HamburgerIcon />,
      title: "No Food or Drink in the Vehicles",
      description:
        "To keep our vehicles clean, please avoid bringing any food or drinks.",
    },
    {
      icon: <XCircleIcon />,
      title: "Cancellations",
      description:
        "If you need to cancel your ride, do so through the app prior to your vehicle’s arrival.",
    },
  ];

  return (
    <IconContext.Provider
      value={{ color: UTBurntOrange, size: 20, weight: "bold" }}
    >
      <View className={"flex-1 gap-5 p-5 pt-4"}>
        <View className="flex-1 gap-3.5 justify-start">
          {guidelines.map((guideline, index) => (
            <View key={index} className="gap-2">
              <View className="flex-row gap-2 items-center">
                {guideline.icon}
                <FontText className="text-gray-900 text-xl font-semibold leading-[26px]">
                  {guideline.title}
                </FontText>
              </View>
              <View
                className={`ms-8 me-8 pb-3.5 ${includeBottomBorder || index < guidelines.length - 1 ? "border-b border-gray-300" : ""}`}
              >
                <FontText className="text-gray-900 text-base leading-normal">
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
