import BottomSheet from "@gorhom/bottom-sheet";
import { router, useNavigation, useSegments } from "expo-router";
import { createContext, createRef, useContext, useState } from "react";

interface TabContextType {
  homeSheetRef: React.RefObject<BottomSheet>;
  setHomeSheetRef: (ref: React.RefObject<BottomSheet>) => void;
  myRideSheetRef: React.RefObject<BottomSheet>;
  setMyRideSheetRef: (ref: React.RefObject<BottomSheet>) => void;
  activeTab: "home" | "my-ride";
  setActiveTab: (string: "home" | "my-ride") => void;
  goHome: (instant?: boolean) => void;
  goMyRide: (instant?: boolean) => void;
}

const TabContext = createContext<TabContextType | undefined>(undefined);

export const useTabContext = () => {
  const value = useContext(TabContext);
  if (!value) {
    throw new Error("useSheetContext must be used within a <SheetProvider />");
  }
  return value;
};

export const TabProvider = ({ children }: { children: React.ReactNode }) => {
  const [homeSheetRef, setHomeSheetRef] =
    useState<React.RefObject<BottomSheet>>(createRef());
  const [myRideSheetRef, setMyRideSheetRef] =
    useState<React.RefObject<BottomSheet>>(createRef());
  const [activeTab, setActiveTab] = useState<"home" | "my-ride">("home");
  const segments = useSegments();
  const navigation = useNavigation();

  const goHome = (instant?: boolean) => {
    const anim = instant ? { duration: 0 } : undefined;

    myRideSheetRef.current?.close(anim);
    // @ts-ignore
    if (activeTab === "my-ride") {
      homeSheetRef.current?.snapToIndex(1, anim);
    }
    // @ts-ignore minimize the home sheet if user presses the home tab while already on the home tab
    else if (!segments.includes("profile") && segments.length <= 2) {
      homeSheetRef.current?.snapToIndex(1, anim);
    }
    setActiveTab("home");
  };

  const goMyRide = (instant?: boolean) => {
    const anim = instant ? { duration: 0 } : undefined;
    setActiveTab("my-ride");
    // @ts-ignore
    navigation.navigate("(tabs)", { screen: "home" });
    router.dismissTo("/home");
    homeSheetRef.current?.close(anim);
    myRideSheetRef.current?.snapToIndex(1, anim);
    // @ts-ignore
    if (segments.includes("profile")) {
      setTimeout(() => router.dismissTo("/home"), 500);
    }
  };

  return (
    <TabContext.Provider
      value={{
        homeSheetRef,
        setHomeSheetRef,
        myRideSheetRef,
        setMyRideSheetRef,
        activeTab,
        setActiveTab,
        goHome,
        goMyRide,
      }}
    >
      {children}
    </TabContext.Provider>
  );
};
