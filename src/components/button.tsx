import Colors from '@/constants/colors'
import Fonts from '@/constants/fonts'
import React from 'react'
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from 'react-native'

interface ButtonProps {
    text: string,
    onPress?: () => void,
    loading?: boolean,
    style?: StyleProp<ViewStyle>
}

const Buttons: React.FC<ButtonProps> = ({ text, onPress, loading, style }) => {
    return (
        <TouchableOpacity
            style={[styles.button, style]}
            onPress={onPress}
            disabled={loading}
            activeOpacity={0.8}
        >
            {loading
                ? <ActivityIndicator color={Colors.white} />
                : <Text style={styles.text}>{text}</Text>}
        </TouchableOpacity>
    )
}

export default Buttons

const styles = StyleSheet.create({
    button:{
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:Colors.primary,
        height:61,
        borderRadius:10
    },
    text:{
        fontFamily:Fonts.signikaMedium,
        fontSize:25,
        letterSpacing:2,
        color:Colors.white
    }
})
