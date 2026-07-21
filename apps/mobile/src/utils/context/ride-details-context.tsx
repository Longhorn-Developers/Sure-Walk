import CurrentRideSmall from "@sure-walk/utils/types/current-ride-small";
import { createContext, useContext, useState } from "react";
import LoadingState from "../types/loading-state";

interface RideDetailsContextType {
  currentRideSmall: CurrentRideSmall | null;
  setCurrentRideSmall: (newRide: CurrentRideSmall | null) => void;
  loadingState: LoadingState;
  setLoadingState: (loadingState: LoadingState) => void;
}

const RideDetailsContext = createContext<RideDetailsContextType | undefined>(
  undefined,
);

export const useRideDetailsSession = () => {
  const value = useContext(RideDetailsContext);
  if (!value) {
    throw new Error(
      "useRideDetailsSession must be used within a RideDetailsProvider",
    );
  }
  return value;
};

export const RideDetailsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentRideSmall, setCurrentRideSmall] =
    useState<CurrentRideSmall | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");

  return (
    <RideDetailsContext.Provider
      value={{
        currentRideSmall,
        setCurrentRideSmall,
        loadingState,
        setLoadingState,
      }}
    >
      {children}
    </RideDetailsContext.Provider>
  );
};
