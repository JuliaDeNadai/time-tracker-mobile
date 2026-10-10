import Colors from '@/constants/colors'
import Fonts from '@/constants/fonts'
import { Image } from 'expo-image'
import React, { ReactNode } from 'react'
import { ActivityIndicator, StyleProp, StyleSheet, Text, TextStyle, TouchableOpacity, View, ViewStyle } from 'react-native'

interface ActionCardProps {
    text: string,
    onPress?: () => void,
    size?: 'large' | 'small',
    right?: ReactNode,
    loading?: boolean,
    style?: StyleProp<ViewStyle>,
    textStyle?: StyleProp<TextStyle>
}

const ActionCard: React.FC<ActionCardProps> = ({ text, onPress, size = 'small', right, loading, style, textStyle }) => {
    const large = size === 'large'

    return (
        <TouchableOpacity
            style={[styles.card, { height: large ? 88 : 60 }, style]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.85}
        >
            <Image
                source={large ? require('../../assets/images/card-home.svg') : require('../../assets/images/card-report.svg')}
                style={styles.decoration}
                contentFit="fill"
            />
            <View style={styles.content}>
                <Text style={[styles.text, large && styles.textLarge, textStyle]}>{text}</Text>
                {loading ? <ActivityIndicator color={Colors.white} /> : right}
            </View>
        </TouchableOpacity>
    )
}

export default ActionCard

const styles = StyleSheet.create({
    card:{
        borderRadius:24,
        overflow:'hidden',
        backgroundColor:Colors.action_card
    },
    decoration:{
        position:'absolute',
        left:0,
        top:0,
        bottom:0,
        width:'72.5%'
    },
    content:{
        flex:1,
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'space-between',
        paddingLeft:34,
        paddingRight:20
    },
    text:{
        flexShrink:1,
        fontFamily:Fonts.signikaSemiBold,
        fontSize:18,
        lineHeight:25,
        color:Colors.white
    },
    textLarge:{
        maxWidth:151
    }
})
