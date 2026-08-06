import Toast, { ToastProps } from "@/src/components/toast";
import React, { createContext, useContext, useState } from "react";
import { View } from "react-native";

interface ToastContextType {
  setToast: (toast: ToastProps | null) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToastContext = () => {
  const value = useContext(ToastContext);
  if (!value) {
    throw new Error(
      "useToastContext must be used within a ToastContextProvider",
    );
  }
  return value;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toastProps, setToast] = useState<ToastProps | null>(null);

  return (
    <ToastContext.Provider
      value={{
        setToast,
      }}
    >
      {children}
      <View className="absolute left-5 right-5 bottom-safe pb-[64px] z-9999">
        {toastProps && <Toast {...toastProps} />}
      </View>
    </ToastContext.Provider>
  );
};
