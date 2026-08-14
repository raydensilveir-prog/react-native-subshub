import React from "react"
import {View,Text} from 'react-native'
import {Link} from 'expo-router'
const SignIn = () =>{
    return(
        <View>
            <Text>
                Hello
            </Text>
            <Link href="/(auth)/sign-in">Create Account</Link>
            <Link href='./'>go home</Link>
        </View>
    )
}
export default SignIn