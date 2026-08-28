import {useClerk, useUser} from "@clerk/expo";
import {router} from "expo-router";
import React from 'react';
import {ActivityIndicator, Image, Pressable, Text, View} from "react-native";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import {colors} from "@/constants/theme";
import images from "@/constants/images";


const SafeAreaView=styled(RNSafeAreaView)
const Settings = () => {
  const {signOut} = useClerk();
  const {user, isLoaded} = useUser();
  const [isSigningOut, setIsSigningOut] = React.useState(false);
  const [signOutError, setSignOutError] = React.useState("");
  const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Your account";
  const profileImage = user?.imageUrl ? {uri: user.imageUrl} : images.avatar;

  const handleSignOut = async () => {
      if (isSigningOut) {
          return;
      }

      setIsSigningOut(true);
      setSignOutError("");

      try {
          await signOut();
          router.replace("/(auth)/sign-in");
      } catch {
          setSignOutError("We could not sign you out. Please try again.");
      } finally {
          setIsSigningOut(false);
      }
  };

  return(
      <SafeAreaView className='flex-1 bg-background p-5'>
          <View className="mt-4 gap-5">
              <View>
                  <Text className="text-3xl font-sans-bold text-primary">Settings</Text>
                  <Text className="mt-2 text-base font-sans-medium text-muted-foreground">
                      Manage your account and app access.
                  </Text>
              </View>

              <View className="rounded-2xl border border-border bg-card p-5">
                  {!isLoaded ? (
                      <ActivityIndicator color={colors.accent}/>
                  ) : (
                      <View className="flex-row items-center gap-4">
                          <Image source={profileImage} className="home-avatar"/>
                          <View className="min-w-0 flex-1">
                              <Text className="text-lg font-sans-bold text-primary" numberOfLines={1}>
                                  {displayName}
                              </Text>
                              <Text className="mt-1 text-sm font-sans-medium text-muted-foreground" numberOfLines={1}>
                                  {user?.primaryEmailAddress?.emailAddress}
                              </Text>
                          </View>
                      </View>
                  )}
              </View>

              <Pressable className="auth-secondary-button" disabled={isSigningOut} onPress={handleSignOut}>
                  {isSigningOut ? (
                      <ActivityIndicator color={colors.accent}/>
                  ) : (
                      <Text className="auth-secondary-button-text">Sign out</Text>
                  )}
              </Pressable>
              {signOutError ? <Text className="auth-error">{signOutError}</Text> : null}
          </View>
      </SafeAreaView>
  )
}
export default Settings
