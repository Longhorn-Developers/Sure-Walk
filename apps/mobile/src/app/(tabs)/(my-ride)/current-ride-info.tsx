import { API_URL } from "@/src/client/auth";
import FontText from "@/src/components/font-text";
import { slate700 } from "@/src/utils/colors";
import { useCurrentRideSession } from "@/src/utils/context/current-ride-context";
import { useSession } from "@/src/utils/context/user-context";
import LoadingState from "@/src/utils/types/loading-state";
import CurrentRideMini from "@sure-walk/utils/types/current-ride-mini";
import InProgressRideState from "@sure-walk/utils/types/in-progress-ride-state";
import RideEvent from "@sure-walk/utils/types/ride-event";
import { router } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { useEffect, useRef, useState } from "react";
import { View, TouchableOpacity, AppState } from "react-native";

const CurrentRideInfo = () => {
  const { accessToken, fetchProtected } = useSession();
  const { setCurrentRideMini, currentRideMini } = useCurrentRideSession();
  const [_loadingState, setLoadingState] = useState<LoadingState>("loading");
  const wsRef = useRef<WebSocket>(undefined);

  const connect = () => {
    const wsURL = API_URL.replace("http", "ws");
    const ws = new WebSocket(
      `${wsURL}/ride/events`,
      `Bearer ${accessToken ?? ""}`,
    );
    wsRef.current = ws;

    ws.addEventListener("message", (event) => {
      console.log(event);
      const payload = JSON.parse(event.data) as RideEvent<object>;
      switch (payload.eventType) {
        case "connected": {
          setLoadingState("done");
          const data = payload.data as CurrentRideMini;
          setCurrentRideMini(data);
          break;
        }
        case "routeUpdate": {
          const data = payload.data as { rideState: InProgressRideState };
          setCurrentRideMini({
            pickupLocationID: currentRideMini?.pickupLocationID!,
            dropoffLocationID: currentRideMini?.dropoffLocationID!,
            groupRide: currentRideMini?.groupRide ?? [],
            rideState: data.rideState,
          });
          break;
        }
      }
    });

    ws.addEventListener("error", (event) => {
      console.log("Websocket error: ", event);
    });

    const onClose = async (event: CloseEvent) => {
      console.log("Websocket closed: ", event.code, event.reason);
      if (event.code === 1000) {
        ws.removeEventListener("close", onClose);
        if (event.reason === "complete") {
          setCurrentRideMini(null);
          router.dismissTo("/home");
        }
      } else if (event.reason.includes("401")) {
        try {
          // force refresh
          await fetchProtected("/me", "GET");
        } catch (err) {
          console.error(err);
        }
      } else {
        // 404
        ws.removeEventListener("close", onClose);
        router.dismissTo("/home");
        setCurrentRideMini(null);
      }
    };

    ws.addEventListener("close", onClose);
  };

  useEffect(() => {
    connect();

    const appStateListener = AppState.addEventListener(
      "change",
      (nextAppState) => {
        if (
          nextAppState === "active" &&
          (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED)
        ) {
          console.log(
            "App returned to foreground, rebuilding socket connection.",
          );
          connect();
        }
      },
    );

    return () => {
      appStateListener.remove();
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
      }
    };
  }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View className="bg-white flex-1 p-5 flex-col gap-10">
      <View className="flex-row gap-4 items-center mt-safe">
        <TouchableOpacity
          className="w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center"
          onPress={() => {
            router.back();
          }}
        >
          <CaretLeftIcon size={24} color={slate700} />
        </TouchableOpacity>
        <FontText className="font-medium text-2xl">Your ride details</FontText>
      </View>
    </View>
  );
};

export default CurrentRideInfo;
