import { createContext, useContext, useState } from "react";
import GroupRideMember from "../types/group-ride-member";

interface GroupRideContextType {
  // the group ride leader is the currently signed in user, use user-context to get that value
  members: GroupRideMember[];
  removeMember: (memberIndex: number) => void;
  addMember: (member: GroupRideMember) => void;
}

const GroupRideContext = createContext<GroupRideContextType | undefined>(
  undefined,
);

export const useGroupRideSession = () => {
  const value = useContext(GroupRideContext);
  if (!value) {
    throw new Error(
      "useGroupRideSession must be used within a GroupRideProvider",
    );
  }
  return value;
};

export const GroupRideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [members, setMembers] = useState<GroupRideMember[]>([]);

  const removeMember = (memberIndex: number) => {
    setMembers(members.filter((_, index) => index !== memberIndex));
  };

  const addMember = (member: GroupRideMember) => {
    setMembers([...members, member]);
  };

  return (
    <GroupRideContext.Provider
      value={{
        members,
        removeMember,
        addMember,
      }}
    >
      {children}
    </GroupRideContext.Provider>
  );
};
