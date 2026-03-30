import User from "@sure-walk/utils/types/user";
import { PropsWithChildren, useContext, useEffect, useState } from "react";
import { createContext } from "react";
import * as SecureStore from "expo-secure-store";
import loadingState from "../types/loading-state";
import { API_URL, logout } from "../../client/auth";
import { router } from "expo-router";

interface UserContextType {
  user: User | null;
  setUser: (
    user: User,
    {
      accessToken,
      refreshToken,
    }: { accessToken: string; refreshToken: string },
  ) => void;
  logOut: () => void;
  loadingState: loadingState;
  guidelinesAccepted: boolean;
  acceptGuidelines: () => Promise<void>;
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
  const [, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [guidelinesAccepted, setGuidelinesAccepted] = useState<boolean>(false);

  const fetchProtected = async (
    endpoint: string,
    method: string,
    body?: any,
    accessToken?: string,
    refreshToken?: string,
  ) => {
    if (!accessToken || !refreshToken) {
      throw new Error("No access or refresh token available");
    }

    let response = await fetch(`${API_URL}${endpoint}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (response.status === 401) {
      if (response.headers.get("Content-Type")?.includes("application/json")) {
        const data = await response.json();
        if (data.message === "Token expired.") {
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ refreshToken }),
          });
          if (!refreshResponse.ok) {
            throw new Error("Failed to refresh token");
          }
          const { accessToken: newAccessToken, refreshToken: newRefreshToken } =
            await refreshResponse.json();
          setAccessToken(newAccessToken);
          setRefreshToken(newRefreshToken);
          await SecureStore.setItemAsync("accessToken", newAccessToken);
          await SecureStore.setItemAsync("refreshToken", newRefreshToken);

          response = await fetch(`${API_URL}${endpoint}`, {
            method,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${newAccessToken}`,
            },
            body: body ? JSON.stringify(body) : undefined,
          });
          return response;
        }
      }
      setAccessToken(null);
      setRefreshToken(null);
      await SecureStore.deleteItemAsync("accessToken");
      await SecureStore.deleteItemAsync("refreshToken");
      await SecureStore.deleteItemAsync("guidelinesAccepted");
      router.dismissAll();
      router.replace("/login");
      throw new Error("Unauthorized.");
    }

    return response;
  };

  useEffect(() => {
    const fetchUserInfo = async () => {
      const token = await SecureStore.getItemAsync("accessToken");
      const refresh = await SecureStore.getItemAsync("refreshToken");
      const guidelinesAcceptedValue =
        await SecureStore.getItemAsync("guidelinesAccepted");
      setGuidelinesAccepted(guidelinesAcceptedValue === "true");
      setAccessToken(token);
      setRefreshToken(refresh);

      if (!token || !refresh) {
        setLoadingState("done");
        return;
      }

      try {
        const userInfoReponse = await fetchProtected(
          "/me",
          "GET",
          undefined,
          token,
          refresh,
        );
        if (!userInfoReponse.ok) {
          throw new Error("Failed to fetch user info");
        }
        const parsedUserData: User = await userInfoReponse.json();
        setUserInfo(parsedUserData);
        setLoadingState("done");
      } catch (error) {
        // assume user is logged out
        console.error("Error parsing user data, logging out:", error);
        setLoadingState("done");
        return;
      } finally {
        setLoadingState("done");
        return;
      }
    };

    fetchUserInfo();
  }, []);

  return (
    <UserContext.Provider
      value={{
        user: userInfo,
        setUser: async (
          user: User,
          {
            accessToken,
            refreshToken,
          }: { accessToken: string; refreshToken: string },
        ) => {
          setUserInfo(user);
          setAccessToken(accessToken);
          setRefreshToken(refreshToken);
          await SecureStore.setItemAsync("accessToken", accessToken);
          await SecureStore.setItemAsync("refreshToken", refreshToken);
        },
        logOut: async () => {
          try {
            await logout(refreshToken!);
          } catch (error) {
            console.error("Error occurred while logging out, ignoring:", error);
          }
          setUserInfo(null);
          setAccessToken(null);
          setRefreshToken(null);
          await SecureStore.deleteItemAsync("accessToken");
          await SecureStore.deleteItemAsync("refreshToken");
          await SecureStore.deleteItemAsync("guidelinesAccepted");
        },
        loadingState: loadingState,
        guidelinesAccepted,
        acceptGuidelines: async () => {
          setGuidelinesAccepted(true);
          await SecureStore.setItemAsync("guidelinesAccepted", "true");
        },
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
