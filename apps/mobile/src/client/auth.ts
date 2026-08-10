import UserType from "@sure-walk/utils/types/user-type";
import axios from "axios";
import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";

const useProdAPI = false;
let API_URL: string;
if (__DEV__ && !useProdAPI) {
  API_URL = `http://${Constants.expoConfig?.hostUri?.split(":").shift()}:3000/api`;
} else {
  API_URL = "https://lifts-web.longhorn-developers.workers.dev/api";
}

export const registerGeneric = async ({
  firstName,
  lastName,
  eid = undefined,
  phoneNumber,
  requiresAssistance,
  userType,
}: {
  firstName: string;
  lastName: string;
  eid?: string;
  phoneNumber: string;
  requiresAssistance: boolean;
  userType: UserType;
}) => {
  const response = await axios.post(
    `${API_URL}/auth/register-generic`,
    {
      firstName,
      lastName,
      eid,
      phoneNumber,
      requiresAssistance,
      userType,
    },
    { validateStatus: () => true },
  );
  return response;
};

export const confirmGeneric = async (code: string) => {
  const response = await axios.post(
    `${API_URL}/auth/confirm-generic`,
    {
      code,
    },
    { validateStatus: () => true },
  );
  return response;
};

export const logout = async () => {
  const refreshToken = await SecureStore.getItemAsync("refreshToken");

  const response = await axios.post(
    `${API_URL}/auth/logout`,
    { refreshToken },
    { validateStatus: () => true },
  );
  return response;
};

export { API_URL };
