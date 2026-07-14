import { Samsara, SamsaraClient } from "@samsarahq/samsara";
import { User } from "../db/schema/users";
import GroupRideMember from "@sure-walk/utils/types/group-ride-member";
import { Location } from "../db/schema/locations";
import { rides } from "../db/schema/rides";
import { getDB } from "../db";

const samsaraClient = new SamsaraClient({ token: process.env.SAMSARA_API_KEY });

const getCurrentWaitTime = async () => {
  return 30;
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
  const routeName = `${members.length > 0 ? `${members.length + 1}-person ` : ``}${user.requiresAssistance ? "ADA " : ""}Sure Walk for ${user.firstName} ${user.lastName}`;
  const routeNotes = `Picking up ${user.firstName} ${user.lastName} (${user.phoneNumber}) at ${pickupLocation.name} and dropping off at ${dropoffLocation.name}.
	${members.length > 0 ? `Also picking up ${members.map((m) => `${m.firstName} ${m.lastName}`).join("\n")}\n` : ""}Submitted at ${new Date().toLocaleString()}.`;

  const res = await samsaraClient.routes.createRoute({
    name: routeName,
    notes: routeNotes,
    recomputeScheduledTimes: true,
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
          Date.now() + (waitTime + 14) * 60 * 1000,
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

export {
  samsaraClient,
  createRoute,
  getVehicleLocations,
  getRouteUpdates,
  getCurrentWaitTime,
};
