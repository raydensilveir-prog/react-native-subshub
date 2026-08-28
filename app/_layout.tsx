import {ClerkProvider} from "@clerk/expo";
import {tokenCache} from "@clerk/expo/token-cache";
import {SplashScreen, Stack} from "expo-router";
import '@/global.css';
import {useFonts} from "expo-font";
import {useEffect} from "react";

SplashScreen.preventAutoHideAsync();

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

if (!publishableKey) {
  throw new Error("Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in .env");
}

/**
 * Root layout component that sets up Clerk authentication provider and loads custom fonts.
 * Prevents splash screen auto-hide until fonts are loaded.
 * @returns {JSX.Element | null} The root layout with authentication provider or null while loading.
 */
export default function RootLayout() {
  const [fontsLoaded, fontError] =useFonts({
    'sans-regular':require('../assets/assets/fonts/PlusJakartaSans-Regular.ttf'),
    'sans-bold':require('../assets/assets/fonts/PlusJakartaSans-Bold.ttf'),
    'sans-medium':require('../assets/assets/fonts/PlusJakartaSans-Medium.ttf'),
    'sans-semibold':require('../assets/assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'sans-extrabold':require('../assets/assets/fonts/PlusJakartaSans-ExtraBold.ttf'),
    'sans-light':require('../assets/assets/fonts/PlusJakartaSans-Light.ttf'),
  })

  useEffect(()=>{
   if(fontsLoaded || fontError){
     void SplashScreen.hideAsync()
   }
  },[fontsLoaded, fontError])
  if(!fontsLoaded && !fontError) return null;
  return (
      <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
        <Stack screenOptions={{headerShown:false}} />
      </ClerkProvider>
  );
}
