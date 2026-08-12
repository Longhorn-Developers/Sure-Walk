import { Redirect } from "expo-router";
import * as SplashScreen from "expo-splash-screen";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});
export default function Index() {
  return <Redirect href="/home" />;
}
