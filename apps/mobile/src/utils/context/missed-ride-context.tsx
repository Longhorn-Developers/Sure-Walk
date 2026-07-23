import CurrentRideMini from "@sure-walk/utils/types/current-ride-mini";
import React, { createContext, useContext, useState } from "react";

interface MissedRideContextType {
  missedRide: CurrentRideMini | null;
  setMissedRide: (missedRide: CurrentRideMini | null) => void;
  showModal: boolean;
  setShowModal: (show: boolean) => void;
}

const MissedRideContext = createContext<MissedRideContextType | undefined>(
  undefined,
);

export const useMissedRideSession = () => {
  const value = useContext(MissedRideContext);
  if (!value) {
    throw new Error(
      "useMissedRideSession must be used within a MissedRideProvider",
    );
  }
  return value;
};

export const MissedRideProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [missedRide, setMissedRide] = useState<CurrentRideMini | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  return (
    <MissedRideContext.Provider
      value={{ missedRide, setMissedRide, showModal, setShowModal }}
    >
      {children}
    </MissedRideContext.Provider>
  );
};
