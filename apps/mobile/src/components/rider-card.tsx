import { View } from "react-native";
import GroupRideMember from "../utils/types/group-ride-member";
import FontText from "./font-text";
import { UserIcon } from "phosphor-react-native";

const RiderCard = ({
  member,
  actionComponent = <View />,
}: {
  member: GroupRideMember;
  actionComponent?: React.ReactNode;
}) => {
  return (
    <View className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex-row align-center gap-4">
      <View
        className={`w-12 h-12 items-center justify-center ${member.userType === "ut-affiliated" ? "bg-ut-turquoise" : "bg-ut-bluebonnet"} rounded-full`}
      >
        {member.userType === "ut-affiliated" && (
          <FontText className="font-semibold text-xl color-slate-50">
            {member.firstName.at(0)! + member.lastName.at(0)!}
          </FontText>
        )}
        {member.userType === "guest" && (
          <UserIcon size={24} color="white" weight="fill" />
        )}
      </View>
      <View className="flex-col flex-1 gap-0.5 justify-center">
        <FontText className="text-lg/5 font-medium">{`${member.firstName} ${member.lastName}`}</FontText>
        <FontText className="color-slate-700 text-lg/5 font-normal">
          {member.eid ?? "Guest"}
        </FontText>
      </View>
      <View className="align-center justify-center">{actionComponent}</View>
    </View>
  );
};

export default RiderCard;
