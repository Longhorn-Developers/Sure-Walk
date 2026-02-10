import User from "@sure-walk/utils/types/user";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { createContext } from "react";
import * as SecureStore from "expo-secure-store";
import loadingState from "../types/loading-state";

interface UserContextType {
  user: User | null;
  setUser: (user: User) => void;
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
    const userData = await SecureStore.getItemAsync("userData");
    if (!userData) {
      setLoadingState("done");
      return;
    }

    try {
      const parsedUserData: User = JSON.parse(userData);
      setUserInfo(parsedUserData);
    } catch (error) {
      // delete corrupted data, assume user is logged out
      console.error("Error parsing user data, logging out:", error);
      await SecureStore.deleteItemAsync("userData");
      setLoadingState("done");
      return;
    }

    setLoadingState("done");
  };

  useEffect(() => {
    fetchUserInfo();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user: userInfo,
        setUser: (user: User) => {
          setUserInfo(user);
          SecureStore.setItemAsync("userData", JSON.stringify(user));
        },
        logOut: () => {
          setUserInfo(null);
          SecureStore.deleteItemAsync("userData");
        },
        loadingState: loadingState,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
