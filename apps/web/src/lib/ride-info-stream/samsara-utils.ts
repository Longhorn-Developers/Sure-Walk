import { Samsara, SamsaraClient } from "@samsarahq/samsara";
import { User } from "../db/schema/users";
import GroupRideMember from "@sure-walk/utils/types/group-ride-member";
import { Location } from "../db/schema/locations";
import { rides, Ride } from "../db/schema/rides";
import { getDB } from "../db";
import { eq } from "drizzle-orm";

const samsaraClient = new SamsaraClient({ token: process.env.SAMSARA_API_KEY });

const getCurrentWaitTime = async () => {
  return 30;
};

const getRideName = (user: User, members: GroupRideMember[]) => {
  return `${members.length > 0 ? `${members.length + 1}-person ` : ``}${user.requiresAssistance ? "ADA " : ""}Sure Walk for ${user.firstName} ${user.lastName}`;
};

const createRoute = async ({
  user,
  members,
  pickupLocation,
  dropoffLocation,
}: {
  user: User;
  members: GroupRideMember[];
  pickupLocation: Location;
  dropoffLocation: Location;
}) => {
  const waitTime = await getCurrentWaitTime();
  const routeName = getRideName(user, members);
  const routeNotes =
    `Picking up ${user.firstName} ${user.lastName} (${user.phoneNumber}) at ${pickupLocation.name} and dropping off at ${dropoffLocation.name}. ` +
    `${members.length > 0 ? `Also picking up ${members.map((m) => `${m.firstName} ${m.lastName}${m.userType === "guest" ? " (guest)" : ` (${m.eid})`}`).join(", ")}.\n` : ""}Submitted at ${new Date().toLocaleString("en-US", { timeZone: "America/Chicago" })}.`;

  const res = await samsaraClient.routes.createRoute({
    name: routeName,
    notes: routeNotes,
    recomputeScheduledTimes: false,
    settings: {
      routeCompletionCondition: "departLastStop",
      routeStartingCondition: "arriveFirstStop",
      sequencingMethod: "manual",
    },
    tagIds: ["6343755"],
    stops: [
      {
        name: pickupLocation.name,
        scheduledArrivalTime: new Date(
          Date.now() + waitTime * 60 * 1000,
        ).toISOString(),
        scheduledDepartureTime: new Date(
          Date.now() + (waitTime + 2) * 60 * 1000,
        ).toISOString(),
        sequenceNumber: 1,
        singleUseLocation: {
          latitude: pickupLocation.lat,
          longitude: pickupLocation.lon,
          address: pickupLocation.address,
          radiusMeters: 100,
        },
      },
      {
        name: dropoffLocation.name,
        scheduledArrivalTime: new Date(
          Date.now() + (waitTime + 12) * 60 * 1000,
        ).toISOString(),
        scheduledDepartureTime: new Date(
          Date.now() + (waitTime + 13) * 60 * 1000,
        ).toISOString(),
        sequenceNumber: 2,
        singleUseLocation: {
          latitude: dropoffLocation.lat,
          longitude: dropoffLocation.lon,
          address: dropoffLocation.address,
          radiusMeters: 100,
        },
      },
    ],
  });

  const data = res.data!;
  let rideCode: string | null = null;
  if (members.length > 0) {
    rideCode = "";
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const charsLen = chars.length;
    for (let i = 0; i < 7; i++) {
      rideCode += chars.charAt(Math.floor(Math.random() * charsLen));
    }
  }

  await samsaraClient.forms.postFormSubmission({
    formTemplate: { id: "3c61e884-1533-4e09-a04c-8ff9fbe4e7f7" },
    isRequired: true,
    status: "notStarted",
    routeStopId: data.stops![0].id,
  });

  const [rideRecord] = await getDB()
    .insert(rides)
    .values({
      samsaraID: data.id,
      userID: user.id,
      members: members,
      pickupLocationID: pickupLocation.id,
      dropoffLocationID: dropoffLocation.id,
      pickupStopID: data.stops![0].id,
      dropoffStopID: data.stops![1].id,
      estPickupTime: data.stops![0].scheduledArrivalTime!,
      estDropoffTime: data.stops![1].scheduledArrivalTime!,
      shareCode: rideCode,
    })
    .returning();

  return rideRecord;
};

const getVehicleLocations = async (
  after?: string,
): Promise<Samsara.VehicleLocationsListResponse> => {
  const res = await samsaraClient.vehicleLocations.getVehicleLocationsFeed({
    after,
  });
  return res;
};

const getRouteUpdates = async (
  after?: string,
): Promise<Samsara.RoutesGetRoutesFeedResponseBody> => {
  const res = await samsaraClient.routes.getRoutesFeed({
    after,
    expand: "route",
  });
  return res;
};

const getRoute = async (
  routeID: string,
): Promise<Samsara.RoutesFetchRouteResponseBody> => {
  const res = await samsaraClient.routes.fetchRoute({ id: routeID });
  return res;
};

const getAsset = async (vehicleID: string) => {
  const res = await samsaraClient.assets.list({ ids: vehicleID });
  return res;
};

const cancelRide = async (ride: typeof Ride, user: User) => {
  const newName = "Cancelled " + getRideName(user, ride.members);
  await samsaraClient.routes.patchRoute({
    id: ride.samsaraID,
    name: newName,
    // @ts-expect-error should be null to remove vehicleId
    vehicleId: null,
    // @ts-expect-error should be null to remove driverId
    driverId: null,
    stops: [
      {
        id: ride.pickupStopID!,
        sequenceNumber: 1,
      },
      {
        id: ride.dropoffStopID!,
        sequenceNumber: 2,
      },
    ],
  });

  await getDB()
    .update(rides)
    .set({ cancelledTime: new Date().toISOString(), shareCode: null })
    .where(eq(rides.id, ride.id));
};

const getFormSubmission = async (submissionID: string) => {
  const res = await samsaraClient.forms.getFormSubmissions({
    ids: submissionID,
  });
  return res;
};

const fetchCurrentRoutes = async () => {
  const res = await samsaraClient.routes.fetchRoutes({
    startTime: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    endTime: new Date(Date.now() + 8 * 3600 * 1000).toISOString(),
  });
  return res;
};

const missRide = async (ride: typeof Ride, user: User) => {
  const newName = "Missed " + getRideName(user, ride.members);
  await samsaraClient.routes.patchRoute({
    id: ride.samsaraID,
    name: newName,
    // @ts-expect-error should be null to remove vehicleId
    vehicleId: null,
    // @ts-expect-error should be null to remove driverId
    driverId: null,
    stops: [
      {
        id: ride.pickupStopID!,
        sequenceNumber: 1,
      },
      {
        id: ride.dropoffStopID!,
        sequenceNumber: 2,
      },
    ],
  });
};

export {
  samsaraClient,
  createRoute,
  getVehicleLocations,
  getRouteUpdates,
  getCurrentWaitTime,
  getRoute,
  getAsset,
  cancelRide,
  getFormSubmission,
  fetchCurrentRoutes,
  getRideName,
  missRide,
};
