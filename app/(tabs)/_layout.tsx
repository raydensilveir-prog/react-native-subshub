import {useAuth} from "@clerk/expo";
import {Redirect, Tabs} from 'expo-router'
import {tabs} from "@/constants/data";
import {ActivityIndicator, View,Image} from "react-native";
import {clsx} from "clsx";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {colors,components} from "@/constants/theme";

const tabBar=components.tabBar;

/**
 * Tab layout component that renders the bottom tab navigator for authenticated users.
 * Redirects to sign-in if user is not authenticated, shows loading while auth state loads.
 * @returns {JSX.Element} The tab navigator with all application tabs.
 */
const TabLayout = () => {
    const {isLoaded, isSignedIn} = useAuth()
    const insets= useSafeAreaInsets()

    if (!isLoaded) {
        return (
            <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color={colors.accent}/>
            </View>
        )
    }

    if (!isSignedIn) {
        return <Redirect href="/(auth)/sign-in"/>
    }

    /**
     * Tab icon component that displays the icon with active/inactive styling.
     * @param {TabIconProps} props - The icon props including focused state and icon source.
     * @returns {JSX.Element} The styled tab icon.
     */
    const TabIcon = ({focused, icon}: TabIconProps) => {
        return (
            <View className='tabs-icon'>
                <View className={clsx('tabs-pill', focused && 'tabs-active')}>
                    <Image source={icon} resizeMode='contain' className='tabs-glyph'/>
                </View>
            </View>
        )
    }

    return (<Tabs screenOptions={{
        headerShown: false,
        tabBarShowLabel:false,
            tabBarStyle:{
                position:'absolute',
                bottom:Math.max(insets.bottom,
                    tabBar.horizontalInset),
                height:tabBar.height,
                marginHorizontal:tabBar.horizontalInset,
                borderRadius:tabBar.radius,
                backgroundColor:colors.primary,
                borderTopWidth:0,
                elevation:0,
            },
            tabBarItemStyle:{
            paddingVertical:tabBar.height/2-tabBar.iconFrame/1.6
            },
            tabBarIconStyle:{
            width:tabBar.iconFrame,
                height:tabBar.iconFrame,
                alignItems:'center'
            }

    }}>
            {tabs.map((tab) => (
                <Tabs.Screen
                    key={tab.name}
                    name={tab.name}
                    options={{
                        title: tab.title,
                        tabBarIcon: ({focused}) => (
                            <TabIcon focused={focused} icon={tab.icon}/>
                        )
                    }}/>
            ))}
        </Tabs>
    )
}

export default TabLayout
