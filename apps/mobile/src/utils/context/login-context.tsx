import { createContext, useContext, useState } from "react";
import UserType from "@sure-walk/utils/types/user-type";

interface LoginContextType {
  userType: UserType | null;
  setUserType: (userType: UserType) => void;
  firstName: string;
  setFirstName: (firstName: string) => void;
  lastName: string;
  setLastName: (lastName: string) => void;
  eid: string | undefined;
  setEid: (eid: string | undefined) => void;
  phoneNumber: string;
  setPhoneNumber: (phoneNumber: string) => void;
  verified: boolean;
  setVerified: (verified: boolean) => void;
  requiresAssistance: boolean | undefined;
  setRequiresAssistance: (requiresAssistance: boolean) => void;
}

const LoginContext = createContext<LoginContextType | undefined>(undefined);

export const useLoginSession = () => {
  const value = useContext(LoginContext);
  if (!value) {
    throw new Error("useLoginSession must be used within a LoginProvider");
  }
  return value;
};

export const LoginSessionProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [eid, setEid] = useState<string | undefined>(undefined);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verified, setVerified] = useState(false);
  const [requiresAssistance, setRequiresAssistance] = useState<
    boolean | undefined
  >(undefined);

  return (
    <LoginContext.Provider
      value={{
        userType,
        setUserType,
        firstName,
        setFirstName,
        lastName,
        setLastName,
        eid,
        setEid,
        phoneNumber,
        setPhoneNumber,
        verified,
        setVerified,
        requiresAssistance,
        setRequiresAssistance,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
