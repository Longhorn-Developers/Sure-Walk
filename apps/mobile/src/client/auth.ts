import UserType from "@sure-walk/utils/types/user-type";
import Constants from "expo-constants";

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
  phoneNumber,
  requiresAssistance,
  userType,
}: {
  firstName: string;
  lastName: string;
  phoneNumber: string;
  requiresAssistance: boolean;
  userType: UserType;
}) => {
  const response = await fetch(`${API_URL}/auth/register-generic`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      firstName,
      lastName,
      phoneNumber,
      requiresAssistance,
      userType,
    }),
  });
  return response;
};

export const confirmGeneric = async (code: string) => {
  const response = await fetch(`${API_URL}/auth/confirm-generic`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ code }),
  });
  return response;
};

export const logout = async (refreshToken: string) => {
  const response = await fetch(`${API_URL}/auth/logout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken }),
  });
  return response;
};

export { API_URL };
