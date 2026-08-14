import React from "react"
import {View,Text} from 'react-native'
import {Link} from 'expo-router'
const SignUp = () =>{
    return(
        <View>
            <Text>
                Signup here
            </Text>
            <Link href="/(auth)/sign-up">Sign In</Link>
        </View>
    )
}
export default SignUp