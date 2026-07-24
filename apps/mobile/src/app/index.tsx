import * as SplashScreen from "expo-splash-screen";
import { Redirect } from "expo-router";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
  duration: 300,
  fade: true,
});
export default function Index() {
  return <Redirect href="/home" />;
}
