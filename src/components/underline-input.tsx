import Colors from '@/constants/colors'
import Fonts from '@/constants/fonts'
import React from 'react'
import { TextInput as NativeTextInput, StyleSheet } from 'react-native'
import { TextInput, TextInputProps } from 'react-native-paper'

type UnderlineInputProps = Omit<TextInputProps, 'mode' | 'label'>

/**
 * Sem `value`, o campo nativo não recebe o texto de volta a cada tecla: no Android,
 * esse vai-e-volta pode sobrescrever o que acabou de ser digitado (a última letra some).
 */
function renderUncontrolled({ value, ...inputProps }: React.ComponentProps<typeof NativeTextInput>) {
    return <NativeTextInput {...inputProps} />
}

const UnderlineInput: React.FC<UnderlineInputProps> = ({ style, contentStyle, ...props }) => {
    return (
        <TextInput
            mode="flat"
            dense
            placeholderTextColor={Colors.input_placeholder}
            textColor={Colors.black}
            underlineColor={Colors.input_line}
            activeUnderlineColor={Colors.primary}
            selectionColor={Colors.primary}
            underlineStyle={styles.underline}
            style={[styles.input, style]}
            contentStyle={[styles.content, contentStyle]}
            render={props.value === undefined ? renderUncontrolled : undefined}
            {...props}
        />
    )
}

export default UnderlineInput

const styles = StyleSheet.create({
    input:{
        height:40,
        backgroundColor:'transparent',
        paddingHorizontal:0
    },
    content:{
        fontFamily:Fonts.alegreyaRegular,
        fontSize:18,
        paddingHorizontal:10
    },
    underline:{
        height:0.5
    }
})
