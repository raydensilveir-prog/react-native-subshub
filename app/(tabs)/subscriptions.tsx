import React from 'react';
import {View,Text} from "react-native";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";


const SafeAreaView=styled(RNSafeAreaView)
const Subscriptions = () => {
  return(
      <SafeAreaView className='bg-background flex-1 p-5'>
          <Text>
              Hello
          </Text>
      </SafeAreaView>
  )
}
export default Subscriptions