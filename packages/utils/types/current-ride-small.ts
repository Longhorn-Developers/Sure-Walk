import GroupRideMember from "./group-ride-member";
import InProgressRideState from "./in-progress-ride-state";

type CurrentRideSmall = {
  pickupLocationID: number;
  dropoffLocationID: number;
  rideState: InProgressRideState;
  groupRide: GroupRideMember[];
  shareCode?: string;
  eta?: string;
};

export default CurrentRideSmall;
