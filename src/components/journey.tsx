import Colors from '@/constants/colors'
import Fonts from '@/constants/fonts'
import { Ionicons } from '@expo/vector-icons'
import React, { ReactNode, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, Text, TouchableOpacity, View, ViewStyle } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

export const Stepper: React.FC<{ step: 1 | 2 | 3 }> = ({ step }) => (
    <View style={styles.stepper}>
        {[1, 2, 3].map(index => (
            <React.Fragment key={index}>
                {index > 1 && <View style={[styles.connector, index <= step && styles.done]} />}
                <View style={[styles.dot, index <= step && styles.done]} />
            </React.Fragment>
        ))}
    </View>
)

type JourneyButtonVariant = 'cancel' | 'back' | 'next' | 'start' | 'stop'

interface JourneyButtonProps {
    variant: JourneyButtonVariant,
    text: string,
    onPress?: () => void,
    disabled?: boolean,
    loading?: boolean,
    style?: StyleProp<ViewStyle>
}

export const JourneyButton: React.FC<JourneyButtonProps> = ({ variant, text, onPress, disabled, loading, style }) => {
    const variantStyle = buttonVariants[variant]

    return (
        <TouchableOpacity
            style={[styles.button, { backgroundColor: variantStyle.background }, disabled && styles.disabled, style]}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
        >
            {loading ? <ActivityIndicator color={variantStyle.color} /> : (
                <>
                    {variant === 'back' && <Ionicons name="chevron-back" size={22} color={variantStyle.color} />}
                    <Text style={[styles.buttonText, { color: variantStyle.color, fontSize: variantStyle.fontSize }]}>{text}</Text>
                    {variant === 'next' && <Ionicons name="chevron-forward" size={22} color={variantStyle.color} />}
                </>
            )}
        </TouchableOpacity>
    )
}

const buttonVariants: Record<JourneyButtonVariant, { background: string, color: string, fontSize: number }> = {
    cancel:{ background:Colors.white, color:Colors.danger, fontSize:25 },
    back:{ background:Colors.white, color:Colors.green_dark, fontSize:25 },
    next:{ background:Colors.green_soft, color:Colors.green_dark, fontSize:25 },
    start:{ background:Colors.green_dark, color:Colors.white, fontSize:32 },
    stop:{ background:Colors.danger, color:Colors.white, fontSize:25 }
}

interface JourneyLayoutProps {
    step?: 1 | 2 | 3,
    subtitle?: string,
    children?: ReactNode,
    footer?: ReactNode,
    centered?: boolean,
    /** Corpo rolável que encolhe com o teclado; use em telas com campo de texto fora de lista. */
    keyboardAware?: boolean
}

export const JourneyLayout: React.FC<JourneyLayoutProps> = ({ step, subtitle, children, footer, centered, keyboardAware }) => {
    const header = (
        <>
            <Text style={styles.title}>Nova jornada</Text>
            {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        </>
    )

    if (keyboardAware) {
        return (
            <SafeAreaView style={styles.container}>
                {step && <Stepper step={step} />}
                <KeyboardAwareBody centered={centered} footer={footer}>
                    {header}
                    {children}
                </KeyboardAwareBody>
            </SafeAreaView>
        )
    }

    return (
        <SafeAreaView style={styles.container}>
            {step && <Stepper step={step} />}
            <View style={[styles.body, centered && styles.centered]}>
                {header}
                {children}
            </View>
            {footer && <View style={styles.footer}>{footer}</View>}
        </SafeAreaView>
    )
}

/**
 * No Android (edge-to-edge) a janela não encolhe com o teclado, então o `padding`
 * do KeyboardAvoidingView é necessário nas duas plataformas.
 */
const KeyboardAwareBody: React.FC<{ centered?: boolean, footer?: ReactNode, children: ReactNode }> = ({ centered, footer, children }) => {
    const scrollRef = useRef<ScrollView>(null)
    const [keyboardVisible, setKeyboardVisible] = useState(false)

    useEffect(() => {
        const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
        const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
        const show = Keyboard.addListener(showEvent, () => setKeyboardVisible(true))
        const hide = Keyboard.addListener(hideEvent, () => setKeyboardVisible(false))
        return () => {
            show.remove()
            hide.remove()
        }
    }, [])

    return (
        <KeyboardAvoidingView style={styles.keyboard} behavior="padding">
            <ScrollView
                ref={scrollRef}
                contentContainerStyle={[styles.scrollBody, centered && styles.centered]}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="interactive"
                onLayout={() => keyboardVisible && scrollRef.current?.scrollToEnd({ animated: true })}
            >
                {children}
            </ScrollView>
            {footer && !keyboardVisible && <View style={styles.footer}>{footer}</View>}
        </KeyboardAvoidingView>
    )
}

export const journeyText = StyleSheet.create({
    label:{
        textAlign:'center',
        fontFamily:Fonts.alegreyaRegular,
        fontSize:20,
        color:Colors.text_dark,
        opacity:0.5
    },
    value:{
        marginTop:6,
        textAlign:'center',
        fontFamily:Fonts.alegreyaMedium,
        fontSize:24,
        color:Colors.text_dark,
        opacity:0.67
    }
})

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:Colors.background
    },
    stepper:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        marginTop:20,
        gap:4
    },
    dot:{
        width:22,
        height:22,
        borderRadius:11,
        backgroundColor:Colors.step_inactive
    },
    connector:{
        width:86,
        height:4,
        borderRadius:3,
        backgroundColor:Colors.step_inactive
    },
    done:{
        backgroundColor:Colors.greeting
    },
    body:{
        flex:1,
        paddingHorizontal:35
    },
    centered:{
        justifyContent:'center'
    },
    keyboard:{
        flex:1
    },
    scrollBody:{
        flexGrow:1,
        paddingHorizontal:35,
        paddingBottom:24
    },
    title:{
        marginTop:40,
        textAlign:'center',
        fontFamily:Fonts.alegreyaSerifMedium,
        fontSize:35,
        color:Colors.text_dark
    },
    subtitle:{
        marginTop:12,
        textAlign:'center',
        fontFamily:Fonts.alegreyaRegular,
        fontSize:20,
        color:Colors.text_dark,
        opacity:0.5
    },
    footer:{
        flexDirection:'row',
        justifyContent:'space-between',
        paddingHorizontal:13,
        paddingBottom:16,
        gap:9
    },
    button:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:14,
        width:168,
        height:61,
        borderRadius:10
    },
    buttonText:{
        fontFamily:Fonts.alegreyaMedium
    },
    disabled:{
        opacity:0.5
    }
})
