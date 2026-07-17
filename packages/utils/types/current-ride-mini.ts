import GroupRideMember from "./group-ride-member";
import InProgressRideState from "./in-progress-ride-state";

type CurrentRideMini = {
  pickupLocationID: number;
  dropoffLocationID: number;
  rideState: InProgressRideState;
  groupRide: GroupRideMember[];
  eta?: string;
};

export default CurrentRideMini;
