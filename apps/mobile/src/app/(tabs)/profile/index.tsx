import FontText from "@/src/components/font-text";
import LargeButton from "@/src/components/large-button";
import { useSession } from "@/src/utils/context/user-context";
import { useEffect, useState } from "react";
import { Linking, ScrollView, TouchableOpacity, View } from "react-native";
import OutlineButton from "@/src/components/outline-button";
import EditProfileTextInput from "@/src/components/edit-profile-text-input";
import DropdownSelect from "@/src/components/dropdown-select";
import {
  ArrowUpRightIcon,
  ArrowUUpLeftIcon,
  CaretRightIcon,
  SignOutIcon,
} from "phosphor-react-native";
import { UTBluebonnet } from "@/src/utils/colors";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";

const Profile = () => {
  const { user, loadingState, logOut, fetchProtected, updateUser } =
    useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [eid, setEid] = useState("");
  const [phoneNumber] = useState(user?.phoneNumber);
  const [requiresAssistance, setRequiresAssistance] = useState<boolean | null>(
    null,
  );

  useEffect(() => {
    if (!user) {
      return;
    }

    setFirstName(user?.firstName);
    setLastName(user?.lastName);
    setEid(user?.eid ?? "");
    setRequiresAssistance(user?.requiresAssistance);
  }, [user]);

  const resetForm = () => {
    if (!user) {
      return;
    }

    setFirstName(user.firstName);
    setLastName(user.lastName);
    setEid(user.eid ?? "");
    setRequiresAssistance(user.requiresAssistance);
    setErrorMessage(null);
  };

  const saveProfile = async () => {
    if (!user || requiresAssistance === null) {
      return;
    }

    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEid = eid.trim();

    if (!trimmedFirstName || !trimmedLastName) {
      setErrorMessage("First and last name are required.");
      return;
    }

    if (trimmedEid && trimmedEid.length < 4) {
      setErrorMessage("UT EID must be at least 4 characters.");
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const response = await fetchProtected("/me", "PATCH", {
        firstName: trimmedFirstName,
        lastName: trimmedLastName,
        requiresAssistance,
        eid: trimmedEid || undefined,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        setErrorMessage(
          data?.message ??
            "Unable to update your profile, but received response from api.",
        );
        return;
      }

      const updatedUser = await response.json();
      updateUser(updatedUser);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      setErrorMessage("Unable to update your profile right now.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <View className="bg-white flex-1">
      {loadingState === "loading" && (
        <FontText className="mt-4">Loading...</FontText>
      )}
      {loadingState === "error" && (
        <FontText className="mt-4">Error loading user info</FontText>
      )}
      {loadingState === "done" && user && (
        <View className="flex-1">
          <View className="w-full bg-[#EFF6FF] pt-safe-offset-[54px]" />
          <View className="text-center w-20 h-20 rounded-full bg-ut-burntorange items-center justify-center self-center -mt-10">
            <FontText className="text-center text-white text-[24px] font-medium">
              {user.firstName[0]}
              {user.lastName[0]}
            </FontText>
          </View>
          <FontText className="text-[24px] tracking-[-0.24px] text-center mt-4">
            {user.firstName} {user.lastName}
          </FontText>
          <View className="flex-1 px-5 pt-2">
            {!isEditing && (
              <View className="gap-[12px] pb-4">
                <TouchableOpacity
                  className="text-center px-6 py-2 rounded-full border border-[#E5E7EB] bg-[#F9FAFB] self-center"
                  onPress={() => {
                    resetForm();
                    setIsEditing(true);
                  }}
                >
                  <FontText className="text-center text-[16px] tracking-[-0.16px]">
                    Edit Profile
                  </FontText>
                </TouchableOpacity>
              </View>
            )}
            <View className="relative flex-1 flex-col justify-start mx-[-20px]">
              <LinearGradient
                colors={["#ffffffff", "#ffffff00"]}
                style={{
                  position: "absolute",
                  top: 0,
                  left: -20,
                  right: 20,
                  height: 16,
                  zIndex: 10,
                }}
              />
              <LinearGradient
                colors={["#ffffff00", "#ffffffff"]}
                style={{
                  position: "absolute",
                  bottom: -1,
                  left: -20,
                  right: 20,
                  height: 32,
                  zIndex: 10,
                }}
              />
              <ScrollView>
                {!isEditing && (
                  <View className="flex-1 flex-col items-start gap-10 mt-4 px-5">
                    <View className="flex flex-col items-start self-stretch h-[55px]">
                      <FontText className="font-medium text-md">
                        First Name
                      </FontText>
                      <FontText className="mt-4 mb-1 text-md">
                        {user.firstName}
                      </FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch h-[55px]">
                      <FontText className="font-medium text-md">
                        Last Name
                      </FontText>
                      <FontText className="mt-4 mb-1 text-md">
                        {user.lastName}
                      </FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch h-[55px]">
                      <FontText className="font-medium text-md">
                        UT EID
                      </FontText>
                      <FontText className="mt-4 mb-1 text-md">
                        {user.eid || "Not provided"}
                      </FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch h-[55px]">
                      <FontText className="font-medium text-md">
                        Phone Number
                      </FontText>
                      <FontText className="mt-4 mb-1 text-md">
                        {user.phoneNumber}
                      </FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch h-[55px] mb-5">
                      <FontText className="font-medium text-md">
                        Americans with Disabilities Act (ADA)
                      </FontText>
                      <FontText className="mt-4 mb-1 text-md">
                        {user.requiresAssistance ? "Yes" : "No"}
                      </FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch h-[55px]">
                      <FontText className="font-medium text-md">
                        Guidelines
                      </FontText>
                      <TouchableOpacity
                        className="flex-row mt-4 mb-1 items-center justify-between w-full"
                        onPress={() => router.push("/profile/guidelines")}
                      >
                        <FontText className="text-md">
                          View all guidelines
                        </FontText>
                        <CaretRightIcon size={24} />
                      </TouchableOpacity>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch h-[55px]">
                      <FontText className="font-medium text-md">FAQs</FontText>
                      <TouchableOpacity
                        className="flex-row mt-4 mb-1 items-center justify-between w-full"
                        onPress={() => router.push("/profile/faqs")}
                      >
                        <FontText className="text-md">
                          View frequently asked questions
                        </FontText>
                        <CaretRightIcon size={24} />
                      </TouchableOpacity>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch h-[55px]">
                      <FontText className="font-medium text-md">
                        UT Night Rides
                      </FontText>
                      <TouchableOpacity
                        className="flex-row mt-4 mb-1 items-center justify-between w-full"
                        onPress={() =>
                          Linking.openURL(
                            "https://parking.utexas.edu/transportation/ut-night-rides",
                          )
                        }
                      >
                        <FontText className="text-md">Redeem credit</FontText>
                        <ArrowUpRightIcon size={24} />
                      </TouchableOpacity>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="pb-2 w-full mb-6">
                      <OutlineButton
                        title="Log Out"
                        onPress={logOut}
                        icon={<SignOutIcon color={UTBluebonnet} size={32} />}
                      />
                    </View>
                  </View>
                )}
                {isEditing && (
                  <View className="flex-1 flex-col mt-[49px] pt-4 px-5">
                    <View className="flex flex-col items-start gap-10 mb-5">
                      <EditProfileTextInput
                        fieldName="First Name"
                        value={firstName}
                        onChangeText={setFirstName}
                        autoCapitalize="words"
                        autoComplete="given-name"
                        maxLength={30}
                        placeholder="Longhorn"
                      />
                      <EditProfileTextInput
                        fieldName="Last Name"
                        value={lastName}
                        onChangeText={setLastName}
                        autoCapitalize="words"
                        autoComplete="family-name"
                        maxLength={30}
                        placeholder="Bevo"
                      />
                      <EditProfileTextInput
                        fieldName="UT EID"
                        value={eid}
                        onChangeText={setEid}
                        autoCapitalize="none"
                        maxLength={20}
                        placeholder="abc1234"
                      />
                      <EditProfileTextInput
                        fieldName="Phone Number"
                        value={phoneNumber}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        maxLength={20}
                        placeholder="1234567890"
                        editable={false}
                        className="color-slate-500 text-md mb-1 mt-4 font-regular"
                      />
                      <DropdownSelect
                        label="Americans with Disabilities Act (ADA)"
                        value={requiresAssistance}
                        onSelect={setRequiresAssistance}
                        options={[
                          { label: "Yes", value: true },
                          { label: "No", value: false },
                        ]}
                      />
                    </View>
                    {errorMessage && <FontText>{errorMessage}</FontText>}
                  </View>
                )}
              </ScrollView>
            </View>
            {isEditing && (
              <View className="flex-row gap-2 mt-4">
                <View className="pb-2 flex-1">
                  <OutlineButton
                    title="Cancel"
                    onPress={() => {
                      resetForm();
                      setIsEditing(false);
                    }}
                    icon={<ArrowUUpLeftIcon color={UTBluebonnet} size={24} />}
                  />
                </View>
                <View className="pb-2 flex-1">
                  <LargeButton
                    title={isSaving ? "Saving..." : "Save"}
                    onPress={saveProfile}
                    disabled={isSaving || requiresAssistance === null}
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default Profile;
