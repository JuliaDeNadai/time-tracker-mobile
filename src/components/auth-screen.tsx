import Colors from '@/constants/colors'
import Fonts from '@/constants/fonts'
import { Image } from 'expo-image'
import React, { ReactNode } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native'

interface AuthScreenProps {
    title: string,
    subtitle: string,
    children: ReactNode
}

const AuthScreen: React.FC<AuthScreenProps> = ({ title, subtitle, children }) => {
    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
            <Image
                source={require('../../assets/images/leaves.svg')}
                style={styles.leaves}
                contentFit="contain"
                pointerEvents="none"
            />
            <KeyboardAvoidingView
                style={styles.keyboard}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <ScrollView
                    contentContainerStyle={styles.content}
                    keyboardShouldPersistTaps="handled"
                >
                    <Image
                        source={require('../../assets/images/logo.svg')}
                        style={styles.logo}
                        contentFit="contain"
                    />
                    <Text style={styles.title}>{title}</Text>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                    {children}
                </ScrollView>
            </KeyboardAvoidingView>
        </View>
    )
}

export default AuthScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:Colors.background
    },
    keyboard:{
        flex:1
    },
    leaves:{
        position:'absolute',
        left:0,
        right:0,
        bottom:0,
        aspectRatio:375 / 224
    },
    content:{
        paddingTop:101,
        paddingBottom:40,
        paddingHorizontal:35
    },
    logo:{
        width:43.41,
        height:49
    },
    title:{
        marginTop:31,
        fontFamily:Fonts.signikaMedium,
        fontSize:30,
        color:Colors.title
    },
    subtitle:{
        marginTop:8,
        maxWidth:306,
        fontFamily:Fonts.signikaRegular,
        fontSize:22,
        color:Colors.subtitle
    }
})
