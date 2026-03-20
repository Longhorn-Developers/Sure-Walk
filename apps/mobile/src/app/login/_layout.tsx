import { gray900 } from "@/src/utils/colors";
import { LoginSessionProvider } from "@/src/utils/context/login-context";
import { router, Stack, usePathname } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import { TouchableOpacity, View } from "react-native";

const _layout = () => {
  const pathname = usePathname();

  return (
    <View className="h-full w-full bg-white pb-safe">
      <View className="flex-1 bg-white pb-6 pt-[34px]">
        <View className="h-6 w-6 mb-4 ml-5">
          {pathname !== "/login" && (
            <TouchableOpacity onPress={() => router.back()}>
              <CaretLeftIcon size={24} color={gray900} />
            </TouchableOpacity>
          )}
        </View>
        <View className="h-1 flex-row gap-2 mb-2 px-5">
          <View
            className={`flex-1 h-1 rounded-full transition-colors ${pathname === "/login" ? "bg-ut-burntorange" : "bg-gray-200"}`}
          />
          <View
            className={`flex-1 h-1 rounded-full transition-colors ${pathname === "/login/name" ? "bg-ut-burntorange" : "bg-gray-200"}`}
          />
          <View
            className={`flex-1 h-1 rounded-full transition-colors ${pathname === "/login/phone" ? "bg-ut-burntorange" : "bg-gray-200"}`}
          />
          <View
            className={`flex-1 h-1 rounded-full transition-colors ${pathname === "/login/confirm" ? "bg-ut-burntorange" : "bg-gray-200"}`}
          />
          <View
            className={`flex-1 h-1 rounded-full transition-colors ${pathname === "/login/assistance" ? "bg-ut-burntorange" : "bg-gray-200"}`}
          />
          <View
            className={`flex-1 h-1 rounded-full transition-colors ${pathname === "/login/guidelines" ? "bg-ut-burntorange" : "bg-gray-200"}`}
          />
        </View>
        <LoginSessionProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </LoginSessionProvider>
      </View>
    </View>
  );
};

export default _layout;
