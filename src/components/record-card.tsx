import Colors from '@/constants/colors'
import Fonts from '@/constants/fonts'
import { TimeEntry } from '@/infra/models'
import { formatDate, formatTime, parseApiDate, refName } from '@/utils/time'
import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const RecordCard: React.FC<{ entry: TimeEntry }> = ({ entry }) => {
    const clockIn = parseApiDate(entry.clock_in)
    const clockOut = parseApiDate(entry.clock_out)
    const description = [refName(entry.service), entry.details].filter(Boolean).join(' · ')

    return (
        <View style={styles.card}>
            <View style={styles.row}>
                <Text style={styles.company} numberOfLines={1}>{refName(entry.company)}</Text>
                <Text style={styles.date}>
                    {clockIn ? formatDate(clockIn) : '--'} - {entry.total_hours ?? '--:--'}
                </Text>
            </View>
            <View style={[styles.row, styles.secondRow]}>
                <Text style={styles.description} numberOfLines={2}>{description}</Text>
                <View>
                    <Text style={styles.time}>Entrada: {clockIn ? formatTime(clockIn) : '--:--'}</Text>
                    <Text style={styles.time}>Saída: {clockOut ? formatTime(clockOut) : '--:--'}</Text>
                </View>
            </View>
        </View>
    )
}

export default RecordCard

const styles = StyleSheet.create({
    card:{
        marginHorizontal:4,
        paddingVertical:12,
        paddingLeft:15,
        paddingRight:16,
        borderRadius:12,
        backgroundColor:Colors.background,
        shadowColor:'#000',
        shadowOpacity:0.06,
        shadowRadius:6,
        shadowOffset:{ width:0, height:2 },
        elevation:2
    },
    row:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'flex-start',
        gap:12
    },
    secondRow:{
        marginTop:2
    },
    company:{
        flex:1,
        fontFamily:Fonts.signikaSemiBold,
        fontSize:16,
        lineHeight:25,
        color:Colors.text_card
    },
    date:{
        fontFamily:Fonts.signikaSemiBold,
        fontSize:16,
        lineHeight:25,
        color:Colors.text_card
    },
    description:{
        flex:1,
        marginTop:4,
        fontFamily:Fonts.signikaLight,
        fontSize:12,
        lineHeight:18,
        color:Colors.text_card
    },
    time:{
        textAlign:'right',
        fontFamily:Fonts.signikaSemiBold,
        fontSize:13,
        lineHeight:17,
        color:Colors.text_card
    }
})
