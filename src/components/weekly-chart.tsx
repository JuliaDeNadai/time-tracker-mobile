import Colors from '@/constants/colors'
import Fonts from '@/constants/fonts'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

const DAYS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
const PLOT_HEIGHT = 170
const STEPS = 5

interface WeeklyChartProps {
    current: number[],
    previous: number[],
    onShowAll?: () => void
}

function niceMax(value: number): number {
    if (value <= 5) return 5
    return Math.ceil(value / STEPS) * STEPS
}

const WeeklyChart: React.FC<WeeklyChartProps> = ({ current, previous, onShowAll }) => {
    const max = niceMax(Math.max(...current, ...previous))
    const labels = Array.from({ length: STEPS + 1 }, (_, i) => Math.round((max / STEPS) * (STEPS - i)))

    const barHeight = (hours: number) => hours > 0 ? Math.max(6, (hours / max) * PLOT_HEIGHT) : 0

    return (
        <View>
            <View style={styles.header}>
                <Text style={styles.title}>Registros da semana</Text>
                {onShowAll && (
                    <TouchableOpacity onPress={onShowAll} hitSlop={8}>
                        <Text style={styles.showAll}>Ver tudo</Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.body}>
                <View style={styles.yAxis}>
                    {labels.map(label => (
                        <Text key={label} style={styles.axisText}>{label}h</Text>
                    ))}
                </View>

                <View style={styles.plot}>
                    {labels.map((label, i) => (
                        <View key={label} style={[styles.guide, { top: (PLOT_HEIGHT / STEPS) * i }]} />
                    ))}
                    {DAYS.map((day, i) => (
                        <View key={day} style={styles.dayColumn}>
                            <View style={[styles.bar, styles.barCurrent, { height: barHeight(current[i]) }]} />
                            <View style={[styles.bar, styles.barPrevious, { height: barHeight(previous[i]) }]} />
                        </View>
                    ))}
                </View>
            </View>

            <View style={styles.days}>
                {DAYS.map(day => (
                    <Text key={day} style={[styles.axisText, styles.dayText]}>{day}</Text>
                ))}
            </View>

            <View style={styles.legend}>
                <View style={[styles.legendDot, styles.barCurrent]} />
                <Text style={styles.axisText}>Esta semana</Text>
                <View style={[styles.legendDot, styles.barPrevious, styles.legendSpacing]} />
                <Text style={styles.axisText}>Semana passada</Text>
            </View>
        </View>
    )
}

export default WeeklyChart

const styles = StyleSheet.create({
    header:{
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    title:{
        fontFamily:Fonts.alegreyaBold,
        fontSize:12,
        color:Colors.text_dark
    },
    showAll:{
        fontFamily:Fonts.alegreyaBold,
        fontSize:12,
        color:Colors.green_dark
    },
    body:{
        flexDirection:'row',
        marginTop:20
    },
    yAxis:{
        width:27,
        height:PLOT_HEIGHT + 11,
        marginTop:-5,
        justifyContent:'space-between'
    },
    axisText:{
        fontFamily:Fonts.signikaRegular,
        fontSize:10,
        color:Colors.chart_axis,
        opacity:0.5
    },
    plot:{
        flex:1,
        height:PLOT_HEIGHT,
        flexDirection:'row',
        alignItems:'flex-end',
        justifyContent:'space-around'
    },
    guide:{
        position:'absolute',
        left:0,
        right:0,
        height:StyleSheet.hairlineWidth,
        backgroundColor:Colors.chart_guide
    },
    dayColumn:{
        flexDirection:'row',
        alignItems:'flex-end',
        gap:4
    },
    bar:{
        width:12,
        borderRadius:35
    },
    barCurrent:{
        backgroundColor:Colors.chart_current
    },
    barPrevious:{
        backgroundColor:Colors.chart_previous,
        opacity:0.75
    },
    days:{
        flexDirection:'row',
        justifyContent:'space-around',
        marginTop:8,
        marginLeft:27
    },
    dayText:{
        width:28,
        textAlign:'center'
    },
    legend:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        gap:6,
        marginTop:10
    },
    legendDot:{
        width:8,
        height:8,
        borderRadius:4
    },
    legendSpacing:{
        marginLeft:10
    }
})
