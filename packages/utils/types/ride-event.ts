type RideEvent<Data> = {
  eventType: "connected" | "routeUpdate" | "vehicleInfo" | "vehicleLocation";
  data: Data;
};

export default RideEvent;
