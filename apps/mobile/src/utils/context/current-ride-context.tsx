import CurrentRideMini from "@sure-walk/utils/types/current-ride-mini";
import { createContext, useContext, useState } from "react";
import LoadingState from "../types/loading-state";

interface CurrentRideContextType {
  currentRide: CurrentRideMini | null;
  setCurrentRide: (newRide: CurrentRideMini | null) => void;
  loadingState: LoadingState;
  setLoadingState: (loadingState: LoadingState) => void;
}

const CurrentRideContext = createContext<CurrentRideContextType | undefined>(
  undefined,
);

export const useCurrentRideSession = () => {
  const value = useContext(CurrentRideContext);
  if (!value) {
    throw new Error(
      "useCurrentRideSession must be used within a CurrentRideProvider",
    );
  }
  return value;
};

export const CurrentRideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentRide, setCurrentRide] = useState<CurrentRideMini | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");

  return (
    <CurrentRideContext.Provider
      value={{
        currentRide,
        setCurrentRide,
        loadingState,
        setLoadingState,
      }}
    >
      {children}
    </CurrentRideContext.Provider>
  );
};
