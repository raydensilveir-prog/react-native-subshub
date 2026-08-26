import {SplashScreen, Stack} from "expo-router";
import '@/global.css';
import {useFonts} from "expo-font";
import {useEffect} from "react";

SplashScreen.preventAutoHideAsync();
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
  return <Stack screenOptions={{headerShown:false}} />;
}
