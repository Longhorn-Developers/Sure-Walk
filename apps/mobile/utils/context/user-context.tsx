import User from "@sure-walk/utils/types/user";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { createContext } from "react";
import loadingState from "../types/loading-state";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logOut: () => void;
  loadingState: loadingState;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useSession = () => {
  const value = useContext(UserContext);
  if (!value) {
    throw new Error("useSession must be used within a <UserProvider />");
  }
  return value;
};

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [loadingState, setLoadingState] = useState<loadingState>("loading");
  const [userInfo, setUserInfo] = useState<User | null>(null);

  const fetchUserInfo = async () => {
    setUserInfo({
      id: "123",
      firstName: "John",
      lastName: "Doe",
      phoneNumber: "123-456-7890",
      requiresAssistance: true,
      eid: "jd4321",
    });

    setLoadingState("done");
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user: userInfo,
        setUser: (user: User | null) => {
          setUserInfo(user);
        },
        logOut: () => setUserInfo(null),
        loadingState: loadingState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
