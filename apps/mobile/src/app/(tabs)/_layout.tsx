import { GroupRideProvider } from "@/src/utils/context/group-ride-context";
import { MissedRideProvider } from "@/src/utils/context/missed-ride-context";
import { RideProvider } from "@/src/utils/context/ride-context";
import { RideDetailsProvider } from "@/src/utils/context/ride-details-context";
import TabScreens from "@/src/components/tab-screens";
import { CurrentRideProvider } from "@/src/utils/context/current-ride-context";
import { TabProvider } from "@/src/utils/context/tab-context";

const _layout = () => {
  return (
    <TabProvider>
      <CurrentRideProvider>
        <RideDetailsProvider>
          <MissedRideProvider>
            <RideProvider>
              <GroupRideProvider>
                <TabScreens />
              </GroupRideProvider>
            </RideProvider>
          </MissedRideProvider>
        </RideDetailsProvider>
      </CurrentRideProvider>
    </TabProvider>
  );
};

export default _layout;
