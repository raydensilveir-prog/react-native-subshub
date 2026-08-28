import {useAuth} from "@clerk/expo";
import {Redirect, Stack} from "expo-router";
import '@/global.css';

/**
 * Authentication layout component that manages routing based on authentication state.
 * Redirects to tabs if user is signed in, otherwise shows authentication stack.
 * @returns {JSX.Element | null} The authentication layout or null while loading.
 */
export default function RootLayout() {
  const {isLoaded, isSignedIn} = useAuth();

  if (!isLoaded) {
    return null;
  }

  if (isSignedIn) {
    return <Redirect href="/(tabs)" />;
  }

  return <Stack screenOptions={{headerShown:false}} />;
}
