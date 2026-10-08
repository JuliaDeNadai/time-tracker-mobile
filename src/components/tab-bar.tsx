import Colors from '@/constants/colors'
import { ActiveEntryStorage } from '@/infra/storage/active-entry'
import { Ionicons } from '@expo/vector-icons'
import { Tabs, useRouter } from 'expo-router'
import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0]

const TabBar: React.FC<BottomTabBarProps> = ({ state, navigation }) => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const currentRoute = state.routes[state.index]?.name
    const isProfile = currentRoute === 'profile'

    async function handleNewEntry() {
        const active = await ActiveEntryStorage.get()
        router.push(active ? '/tracking' : '/new-entry')
    }

    return (
        <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            <TouchableOpacity style={styles.side} onPress={() => navigation.navigate('home')} accessibilityLabel="Início">
                <Ionicons
                    name={isProfile ? 'home-outline' : 'home'}
                    size={30}
                    color={isProfile ? Colors.tab_inactive : Colors.greeting}
                />
            </TouchableOpacity>

            <TouchableOpacity style={styles.plus} onPress={handleNewEntry} accessibilityLabel="Nova jornada">
                <Ionicons name="add" size={36} color={Colors.white} />
            </TouchableOpacity>

            <TouchableOpacity style={styles.side} onPress={() => navigation.navigate('profile')} accessibilityLabel="Perfil">
                <Ionicons
                    name={isProfile ? 'person' : 'person-outline'}
                    size={28}
                    color={isProfile ? Colors.greeting : Colors.tab_inactive}
                />
            </TouchableOpacity>
        </View>
    )
}

export default TabBar

const styles = StyleSheet.create({
    bar:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-around',
        paddingTop:12,
        paddingHorizontal:20,
        backgroundColor:Colors.background
    },
    side:{
        width:64,
        height:48,
        alignItems:'center',
        justifyContent:'center'
    },
    plus:{
        width:48,
        height:48,
        borderRadius:24,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:Colors.primary
    }
})
