import FontText from "@/src/components/font-text";
import LargeButton from "@/src/components/large-button";
import { useSession } from "@/src/utils/context/user-context";
import { useEffect, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import OutlineButton from "@/src/components/outline-button";
import EditProfileTextInput from "@/src/components/edit-profile-text-input";
import DropdownSelect from "@/src/components/dropdown-select";
import { ArrowUUpLeftIcon, SignOutIcon } from "phosphor-react-native";
import { UTBluebonnet } from "@/src/utils/colors";

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

                  <View className="flex-1 flex-col items-start gap-10">
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
                    <View className="flex flex-col items-start self-stretch h-[55px]">
                      <FontText className="font-medium text-md">
                        Americans with Disabilities Act (ADA)
                      </FontText>
                      <FontText className="mt-4 mb-1 text-md">
                        {user.requiresAssistance ? "Yes" : "No"}
                      </FontText>
                      <View className="border-b border-b-[#e5e7eb] w-full" />
                    </View>
                  </View>
                </>
              )}

              {isEditing && (
                <View className="flex-1 flex-col mt-[35px] pt-4">
                  <View className="flex flex-col items-start gap-10">
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
            </View>
            {!isEditing && (
              <View className="pb-2">
                <OutlineButton
                  title="Log Out"
                  onPress={logOut}
                  icon={<SignOutIcon color={UTBluebonnet} size={32} />}
                />
              </View>
            )}
            {isEditing && (
              <View className="flex-row gap-2">
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
