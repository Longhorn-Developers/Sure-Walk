import { FlatList, TouchableOpacity, View } from "react-native";
import FontText from "@/src/components/font-text";
import { LinearGradient } from "expo-linear-gradient";
import { slate700 } from "@/src/utils/colors";
import { router } from "expo-router";
import { CaretLeftIcon } from "phosphor-react-native";
import Accordion from "@/src/components/accordion";

const FAQs = () => {
  const faqs: { title: string; body: string }[] = [
    {
      title: "My Sure Walk hasn't arrived yet. What should I do?",
      body: "If you've already received a call from the Sure Walk team, please remain at your pickup location. If you have not received any confirmation, try submitting a new request.",
    },
    {
      title: "Once my Sure Walk arrives, how long do I have to meet them?",
      body: "Please meet your Sure Walk within 2 minutes of arrival. If you're unable to reach the pickup location in time, your ride may be canceled and you'll need to submit a new request.",
    },
    {
      title:
        "Can I ride with my friends if we're going to different destinations?",
      body: "No. Group rides require all riders to share the same pickup and drop-off location.",
    },
    {
      title: "Can someone join my ride after I've already submitted it?",
      body: "Yes. Share your ride code with friends and have them join before the ride arrives. Once the ride is in progress, new riders cannot be added.",
    },
    {
      title: "What happens if I need to cancel my ride?",
      body: "You can cancel your ride before it arrives through the app. If your plans change, please cancel as soon as possible so the Sure Walk team can assist other students.",
    },
    {
      title: "Why was my ride request canceled?",
      body: "Ride requests may be canceled if the rider does not arrive at the pickup location or if the request could not be completed.",
    },
    {
      title: "Can I request a ride for someone else?",
      body: "Yes. Share your ride code with the rider so they can view ride details and tracking information. The rider should be present at the selected pickup location when the Sure Walk arrives.",
    },
  ];

  return (
    <View className="flex-1 flex-col bg-white">
      <View className="flex-col bg-white flex-1 pt-[34px] mt-safe">
        <TouchableOpacity
          className="w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center ms-5"
          onPress={() => {
            router.back();
          }}
        >
          <CaretLeftIcon size={24} color={slate700} />
        </TouchableOpacity>
        <View className="pb-2 pt-8">
          <FontText className="text-2xl font-medium px-5 z-100">FAQs</FontText>
        </View>
        <View className="relative flex-1 p-0 z-5">
          <LinearGradient
            colors={["#ffffffff", "#ffffff00"]}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 20,
              zIndex: 10,
            }}
          />
          <LinearGradient
            colors={["#ffffff00", "#ffffffff"]}
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 20,
              zIndex: 10,
            }}
          />
          <FlatList
            className="flex-1 px-5 py-4"
            data={faqs}
            renderItem={({ item }) => (
              <Accordion title={item.title} body={item.body} />
            )}
            ItemSeparatorComponent={() => (
              <View className="my-4 mx-8 h-[1px] bg-gray-300" />
            )}
            ListFooterComponent={<View className="h-5" />}
          />
        </View>
      </View>
    </View>
  );
};

export default FAQs;
