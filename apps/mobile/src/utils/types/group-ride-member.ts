import UserType from "@sure-walk/utils/types/user-type";

type GroupRideMember = {
  firstName: string;
  lastName: string;
  eid?: string;
  userType: UserType;
};

export default GroupRideMember;
