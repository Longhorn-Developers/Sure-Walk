import InProgressRideState from "./in-progress-ride-state";

type CurrentRideMini = {
  pickupLocationID: number;
  dropoffLocationID: number;
  rideState: InProgressRideState;
  eta?: string;
};

export default CurrentRideMini;
