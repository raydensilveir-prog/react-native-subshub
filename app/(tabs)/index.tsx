import "@/global.css"
import {useUser} from "@clerk/expo";
import {FlatList, Image, Text, View} from "react-native";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {styled} from "nativewind";
import images from "@/constants/images";
import {HOME_BALANCE, HOME_SUBSCRIPTIONS, UPCOMING_SUBSCRIPTIONS} from "@/constants/data";
import {icons} from "@/constants/icons";
import {formatCurrency} from "@/lib/utils";
import dayjs from "dayjs";
import ListHeading from "@/components/ListHeading";
import UpcomingSubscriptionCard from "@/components/UpcomingSubscriptionCard";
import SubscriptionCard from "@/components/SubscriptionCard";
import React,{useState} from "react";


const SafeAreaView=styled(RNSafeAreaView)

/**
 * Home screen component that displays user profile, balance, and subscription lists.
 * Shows upcoming subscriptions horizontally and all subscriptions in an expandable vertical list.
 * @returns {JSX.Element} The home screen UI with subscription management.
 */
export default function App() {
const [expandedSubscriptionId,setExpandedSubscriptionID] = useState<string | null>(null)
const {user} = useUser()
const displayName = user?.fullName || user?.firstName || user?.primaryEmailAddress?.emailAddress || "Your account"
const profileImage = user?.imageUrl ? {uri: user.imageUrl} : images.avatar
  return (
    <SafeAreaView className='flex-1 bg-background p-5'>

            <FlatList
                ListHeaderComponent={() =>(
                    <>
                        <View className="home-header">
                            <View className="home-user">
                                <Image source={profileImage} className="home-avatar"/>
                                <Text className="home-user-name" numberOfLines={1}>{displayName}</Text>
                            </View>
                            <Image source={icons.add} className="home-add-icon"/>
                        </View>
                        <View className="home-balance-card">
                            <Text className="home-balance-label">Balance</Text>
                                <View className="home-balance-row">
                                    <Text className="home-balance-amount">{formatCurrency(HOME_BALANCE.amount)}</Text>
                                        <Text className="home-balance-date">
                                            {dayjs(HOME_BALANCE.nextRenewalDate).format('MM/DD')}
                                        </Text>
                                </View>
                        </View>
                        <View className="mb-5">

                            <ListHeading title="Upcoming"/>
                            <FlatList
                                data={UPCOMING_SUBSCRIPTIONS}
                                renderItem={({item})=>(<UpcomingSubscriptionCard {...item}/>)}
                                keyExtractor={(item)=>item.id}
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                ListEmptyComponent={<Text className="home-empty-state">No upcoming subscription</Text>}
                            />
                        </View>
                        <ListHeading title="All Subscriptions"/>
                    </>
                ) }
                data={HOME_SUBSCRIPTIONS}
                keyExtractor={(item)=> item.id}
                renderItem={({item})=>(
                    <SubscriptionCard {...item}
                                      expanded={(expandedSubscriptionId === item.id)}
                                      onPress={() => setExpandedSubscriptionID((currentId)=>
                                          (currentId === item.id ? null : item.id)) }
                    />
                )}
                extraData={expandedSubscriptionId}
                ItemSeparatorComponent={()=> <View className="h-4"/> }
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={<Text className="home-empty-state">No subscriptions yet.</Text> }
                contentContainerClassName="pb-20"
            />
    </SafeAreaView>
  );
}
