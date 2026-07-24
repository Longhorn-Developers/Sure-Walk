import CurrentRideMini from "@sure-walk/utils/types/current-ride-mini";
import { createContext, useContext, useEffect, useState } from "react";
import LoadingState from "../types/loading-state";
import { useSession } from "./user-context";

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
  const { loadingState: userLoadingState, user, fetchProtected } = useSession();
  const [firstLoad, setFirstLoad] = useState<boolean>(true);

  useEffect(() => {
    const fetchCurrentRide = async () => {
      try {
        const res = await fetchProtected("/ride", "GET");
        if (res.status === 204) {
          setCurrentRide(null);
        } else if (res.status === 200) {
          setCurrentRide(await res.json());
        } else {
          throw new Error("Could not fetch current ride details.");
        }
        setLoadingState("done");
      } catch (err) {
        console.log(err);
        setLoadingState("error");
      }
    };

    if (userLoadingState === "done" && user && firstLoad) {
      // safe to pull /ride, no race condition with refreshing simultaneously
      fetchCurrentRide();
      setFirstLoad(false);
    }
    if (userLoadingState !== "loading" && !user && firstLoad) {
      setLoadingState("done");
      setFirstLoad(false);
    }
  }, [userLoadingState]); // eslint-disable-line react-hooks/exhaustive-deps

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
