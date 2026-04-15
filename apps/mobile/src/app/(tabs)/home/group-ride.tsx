import FontText from "@/src/components/font-text";
import LargeButton from "@/src/components/large-button";
import OutlineButton from "@/src/components/outline-button";
import RiderCard from "@/src/components/rider-card";
import TextInputField from "@/src/components/text-input-field";
import { red500, slate500, slate700, UTBluebonnet } from "@/src/utils/colors";
import { useGroupRideSession } from "@/src/utils/context/group-ride-context";
import { useSession } from "@/src/utils/context/user-context";
import GroupRideMember from "@/src/utils/types/group-ride-member";
import UserType from "@sure-walk/utils/types/user-type";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import {
  CaretLeftIcon,
  CrownSimpleIcon,
  MinusCircleIcon,
  UserPlusIcon,
} from "phosphor-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { Keyboard, ScrollView, TouchableOpacity, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const GroupRide = () => {
  const { user } = useSession();
  const { members, addMember, removeMember } = useGroupRideSession();

  const [isAdding, setAdding] = useState<boolean>(false);
  const [addingUserType, setAddingUserType] =
    useState<UserType>("ut-affiliated");
  const [utEID, setUTEID] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [isValid, setIsValid] = useState<boolean>(false);
  const [isFull, setIsFull] = useState<boolean>(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const keyboardPaddingHeight = useSharedValue(20);

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(keyboardPaddingHeight.value, {
      easing: Easing.out(Easing.quad),
    }),
  }));

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      keyboardPaddingHeight.set(190);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd();
      }, 250);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      keyboardPaddingHeight.set(20);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const leaderGroupRideMember: GroupRideMember = useMemo(
    () => ({
      firstName: user?.firstName!.trim()!,
      lastName: user?.lastName!.trim()!,
      eid: user?.eid?.trim(),
      userType: user?.userType!,
    }),
    [user],
  );

  useEffect(() => {
    if (addingUserType === "ut-affiliated" && utEID.trim().length < 4) {
      setIsValid(false);
      return;
    }
    setIsValid(firstName.trim().length > 0 && lastName.trim().length > 0);
  }, [addingUserType, utEID, firstName, lastName]);

  useEffect(() => {
    setIsFull(members.length >= 4);
  }, [members]);

  const clearFields = () => {
    setFirstName("");
    setLastName("");
    setUTEID("");
  };

  const addRider = () => {
    if (!isValid) return;
    addMember({
      firstName,
      lastName,
      userType: addingUserType,
      eid: addingUserType === "ut-affiliated" ? utEID : undefined,
    });
    setAdding(false);
    clearFields();
  };

  const removeRider = (index: number) => {
    removeMember(index);
  };

  return (
    <View className={"bg-white flex-1 p-5 flex-col gap-5"}>
      <View className="flex-row gap-4 items-center mt-safe">
        <TouchableOpacity
          className="w-12 h-12 rounded-2xl bg-slate-100 items-center justify-center"
          onPress={() => {
            router.back();
          }}
        >
          <CaretLeftIcon size={24} color={slate700} />
        </TouchableOpacity>
        <FontText className="font-medium text-2xl">Your group ride</FontText>
      </View>
      <View className="relative flex-1">
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
        <ScrollView
          className="flex-col"
          showsVerticalScrollIndicator={false}
          ref={scrollViewRef}
          keyboardShouldPersistTaps="handled"
        >
          <FontText className="text-xl font-semibold mt-5 transition-all mb-4">
            Group Leader
          </FontText>
          <RiderCard
            member={leaderGroupRideMember}
            actionComponent={
              <CrownSimpleIcon color="#FFD600" size={24} weight="fill" />
            }
          />
          <View className="flex-row gap-4 mt-6 justify-between mb-6">
            <FontText className="text-xl font-semibold">Group Members</FontText>
            <FontText className="text-xl font-semibold color-ut-bluebonnet">
              {`Riders (${members.length}/4)`}
            </FontText>
          </View>
          {members.length > 0 && (
            <View className="flex-col gap-4 mb-6">
              {members.map((rideMember, index) => (
                <View key={index}>
                  <RiderCard
                    member={rideMember}
                    actionComponent={
                      <TouchableOpacity onPress={() => removeRider(index)}>
                        <MinusCircleIcon color={red500} size={24} />
                      </TouchableOpacity>
                    }
                  />
                </View>
              ))}
            </View>
          )}
          {isAdding && (
            <View className="flex-col gap-4">
              {addingUserType === "ut-affiliated" && (
                <TextInputField
                  fieldName="UT EID"
                  optionalPressableText="No UT EID?"
                  optionalPressableCallback={() => setAddingUserType("guest")}
                  value={utEID}
                  onChangeText={setUTEID}
                  maxLength={10}
                  placeholder="abc123"
                />
              )}
              <TextInputField
                fieldName="First Name"
                optionalPressableText={
                  addingUserType === "guest" ? "UT EID?" : undefined
                }
                optionalPressableCallback={
                  addingUserType === "guest"
                    ? () => setAddingUserType("ut-affiliated")
                    : undefined
                }
                value={firstName}
                onChangeText={setFirstName}
                maxLength={40}
                autoCapitalize="words"
                placeholder="Bevo"
              />
              <TextInputField
                fieldName="Last Name"
                value={lastName}
                onChangeText={setLastName}
                maxLength={40}
                autoCapitalize="words"
                placeholder="Longhorn"
                styleProps={{ marginBottom: 8 }}
              />
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <OutlineButton
                    title="Cancel"
                    onPress={() => {
                      setAdding(false);
                      clearFields();
                    }}
                  />
                </View>
                <View className="flex-1">
                  <OutlineButton
                    title="Add"
                    onPress={() => addRider()}
                    icon={
                      <UserPlusIcon
                        size={32}
                        color={isValid ? UTBluebonnet : slate500}
                      />
                    }
                    disabled={!isValid}
                  />
                </View>
              </View>
            </View>
          )}
          {!isAdding && !isFull && (
            <OutlineButton
              title="Add Riders"
              onPress={() => setAdding(true)}
              icon={<UserPlusIcon size={32} color={UTBluebonnet} />}
            />
          )}
          <Animated.View style={[animatedStyle]} />
        </ScrollView>
      </View>
      <LargeButton
        onPress={() => {
          router.back();
        }}
        title="Continue"
        disabled={members.length === 0 || isAdding}
      />
    </View>
  );
};

export default GroupRide;
