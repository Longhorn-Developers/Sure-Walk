import UserType from "./user-type";

type GroupRideMember = {
  firstName: string;
  lastName: string;
  eid?: string;
  phoneNumber?: string;
  userType: UserType;
};

export default GroupRideMember;
