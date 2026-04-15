import FontText from "@/src/components/font-text";
import LargeButton from "@/src/components/large-button";
import { useSession } from "@/src/utils/context/user-context";
import { useEffect, useState } from "react";
import { ScrollView, TouchableOpacity, View } from "react-native";
import SignOutButton from "@/src/components/sign-out-button";
import EditProfileTextInput from "@/src/components/edit-profile-text-input";
import DropdownSelect from "@/src/components/dropdown-select";

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
    <ScrollView className="bg-white" contentContainerStyle={{ flexGrow: 1 }}>
      {loadingState === "loading" && (
        <FontText className="mt-4">Loading...</FontText>
      )}
      {loadingState === "error" && (
        <FontText className="mt-4">Error loading user info</FontText>
      )}
      {loadingState === "done" && user && (
        <View className="flex-1">
          <View className="w-full h-[139px] bg-[#EFF6FF]" />
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
            <View className="flex-1 flex-col justify-start">
              {!isEditing && (
                <>
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

                  <View className="flex flex-col items-start gap-10 self-stretch pb-4">
                    <View className="flex flex-col items-start self-stretch">
                      <FontText className="font-medium tracking-[0.48px]">
                        First Name
                      </FontText>
                      <FontText className="mt-4 mb-1">
                        {user.firstName}
                      </FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch">
                      <FontText className="font-medium tracking-[0.48px]">
                        Last Name
                      </FontText>
                      <FontText className="mt-4 mb-1">{user.lastName}</FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch">
                      <FontText className="font-medium">UT EID</FontText>
                      <FontText className="mt-4 mb-1">
                        {user.eid || "Not provided"}
                      </FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch">
                      <FontText className="font-medium">Phone Number</FontText>
                      <FontText className="mt-4 mb-1">
                        {user.phoneNumber}
                      </FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                    <View className="flex flex-col items-start self-stretch">
                      <FontText className="font-medium">
                        Americans with Disabilities Act (ADA)
                      </FontText>
                      <FontText className="mt-4 mb-1">
                        {user.requiresAssistance ? "Yes" : "No"}
                      </FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                  </View>
                </>
              )}

              {isEditing && (
                <View className="flex-1 flex-col justify-start mt-[34px] pt-4">
                  <View className="flex flex-col items-start gap-10 self-stretch pb-4">
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
                      className="color-slate-500"
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
            </View>
            <View className="pb-2">
              <SignOutButton title="Log Out" onPress={logOut} blue={true} />
            </View>

            {isEditing && (
              <View className="pb-2">
                <LargeButton
                  title={isSaving ? "Saving..." : "Save"}
                  onPress={saveProfile}
                  disabled={isSaving || requiresAssistance === null}
                />
              </View>
            )}
          </View>
        </View>
      )}
    </ScrollView>
  );
};

export default Profile;
