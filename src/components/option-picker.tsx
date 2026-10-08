import Colors from '@/constants/colors'
import Fonts from '@/constants/fonts'
import { getErrorMessage } from '@/infra/api/api'
import { NamedResource } from '@/infra/models'
import UnderlineInput from '@/components/underline-input'
import { Ionicons } from '@expo/vector-icons'
import React, { useMemo, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface OptionPickerProps {
    options: NamedResource[],
    loading: boolean,
    selectedId?: string,
    placeholder: string,
    emptyText: string,
    onSelect: (option: NamedResource) => void,
    onCreate: (name: string) => Promise<NamedResource>
}

const OptionPicker: React.FC<OptionPickerProps> = ({ options, loading, selectedId, placeholder, emptyText, onSelect, onCreate }) => {
    const [search, setSearch] = useState('')
    const [creating, setCreating] = useState(false)

    const term = search.trim()
    const filtered = useMemo(
        () => options.filter(option => option.name.toLowerCase().includes(term.toLowerCase())),
        [options, term]
    )
    const canCreate = term.length > 0 && !options.some(option => option.name.toLowerCase() === term.toLowerCase())

    async function handleCreate() {
        setCreating(true)
        try {
            const created = await onCreate(term)
            setSearch('')
            onSelect(created)
        } catch (error) {
            alert(getErrorMessage(error))
        } finally {
            setCreating(false)
        }
    }

    return (
        <View style={styles.container}>
            <UnderlineInput placeholder={placeholder} value={search} onChangeText={setSearch} />

            {loading ? <ActivityIndicator style={styles.loading} color={Colors.primary} /> : (
                <FlatList
                    data={filtered}
                    keyExtractor={item => item._id}
                    style={styles.list}
                    keyboardShouldPersistTaps="handled"
                    ListHeaderComponent={canCreate ? (
                        <TouchableOpacity style={styles.option} onPress={handleCreate} disabled={creating}>
                            {creating
                                ? <ActivityIndicator color={Colors.green_dark} />
                                : <Ionicons name="add-circle-outline" size={20} color={Colors.green_dark} />}
                            <Text style={[styles.optionText, styles.createText]}>Cadastrar “{term}”</Text>
                        </TouchableOpacity>
                    ) : null}
                    ListEmptyComponent={!canCreate ? <Text style={styles.empty}>{emptyText}</Text> : null}
                    renderItem={({ item }) => {
                        const selected = item._id === selectedId
                        return (
                            <TouchableOpacity style={styles.option} onPress={() => onSelect(item)}>
                                <Text style={[styles.optionText, selected && styles.selectedText]}>{item.name}</Text>
                                {selected && <Ionicons name="checkmark" size={20} color={Colors.green_dark} />}
                            </TouchableOpacity>
                        )
                    }}
                />
            )}
        </View>
    )
}

export default OptionPicker

const styles = StyleSheet.create({
    container:{
        flex:1,
        marginTop:20
    },
    loading:{
        marginTop:40
    },
    list:{
        marginTop:30
    },
    option:{
        flexDirection:'row',
        alignItems:'center',
        gap:8,
        paddingVertical:12
    },
    optionText:{
        flex:1,
        fontFamily:Fonts.alegreyaRegular,
        fontSize:18,
        color:Colors.input_placeholder
    },
    selectedText:{
        fontFamily:Fonts.alegreyaBold,
        color:Colors.green_dark
    },
    createText:{
        color:Colors.green_dark
    },
    empty:{
        fontFamily:Fonts.alegreyaRegular,
        fontSize:16,
        color:Colors.hint
    }
})
