import Colors from '@/constants/colors'
import Fonts from '@/constants/fonts'
import { showAlert, showConfirm } from '@/components/app-alert'
import Buttons from '@/components/button'
import UnderlineInput from '@/components/underline-input'
import { getErrorMessage } from '@/infra/api/api'
import { NamedResource } from '@/infra/models'
import { Ionicons } from '@expo/vector-icons'
import { useFocusEffect, useRouter } from 'expo-router'
import React, { useCallback, useState } from 'react'
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

interface ResourceListScreenProps {
    title: string,
    subtitle: string,
    placeholder: string,
    emptyText: string,
    background: string,
    load: () => Promise<NamedResource[]>,
    create: (name: string) => Promise<unknown>,
    remove?: (id: string) => Promise<void>
}

const ResourceListScreen: React.FC<ResourceListScreenProps> = ({ title, subtitle, placeholder, emptyText, background, load, create, remove }) => {
    const router = useRouter()
    const [items, setItems] = useState<NamedResource[]>([])
    const [loading, setLoading] = useState(true)
    const [name, setName] = useState('')
    const [saving, setSaving] = useState(false)

    const refresh = useCallback(async () => {
        try {
            setItems(await load())
        } catch (error) {
            showAlert(getErrorMessage(error))
        } finally {
            setLoading(false)
        }
    }, [load])

    useFocusEffect(useCallback(() => { refresh() }, [refresh]))

    async function handleCreate() {
        if (!name.trim()) return
        setSaving(true)
        try {
            await create(name.trim())
            setName('')
            await refresh()
        } catch (error) {
            showAlert(getErrorMessage(error))
        } finally {
            setSaving(false)
        }
    }

    async function handleRemove(item: NamedResource) {
        if (!remove) return
        const confirmed = await showConfirm({
            title: 'Confirmar',
            message: `Excluir “${item.name}”?`,
            confirmText: 'Excluir',
            destructive: true
        })
        if (!confirmed) return
        try {
            await remove(item._id)
            setItems(current => current.filter(i => i._id !== item._id))
        } catch (error) {
            showAlert(getErrorMessage(error))
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} hitSlop={10} accessibilityLabel="Voltar">
                    <Ionicons name="chevron-back" size={26} color={Colors.text_dark} />
                </TouchableOpacity>
                <Text style={styles.title}>{title}</Text>
            </View>

            <View style={[styles.form, { backgroundColor: background }]}>
                <Text style={styles.subtitle}>{subtitle}</Text>
                <UnderlineInput placeholder={placeholder} value={name} onChangeText={setName} onSubmitEditing={handleCreate} />
                <Buttons text="ADICIONAR" onPress={handleCreate} loading={saving} style={styles.button} />
            </View>

            {loading ? <ActivityIndicator style={styles.loading} color={Colors.primary} /> : (
                <FlatList
                    data={items}
                    keyExtractor={item => item._id}
                    contentContainerStyle={styles.list}
                    ListEmptyComponent={<Text style={styles.empty}>{emptyText}</Text>}
                    renderItem={({ item }) => (
                        <View style={styles.item}>
                            <Text style={styles.itemText}>{item.name}</Text>
                            {remove && (
                                <TouchableOpacity onPress={() => handleRemove(item)} hitSlop={10} accessibilityLabel={`Excluir ${item.name}`}>
                                    <Ionicons name="trash-outline" size={20} color={Colors.danger} />
                                </TouchableOpacity>
                            )}
                        </View>
                    )}
                />
            )}
        </SafeAreaView>
    )
}

export default ResourceListScreen

const styles = StyleSheet.create({
    container:{
        flex:1,
        backgroundColor:Colors.background
    },
    header:{
        flexDirection:'row',
        alignItems:'center',
        gap:8,
        paddingHorizontal:16,
        paddingTop:16
    },
    title:{
        fontFamily:Fonts.signikaSemiBold,
        fontSize:22,
        color:Colors.title
    },
    form:{
        margin:16,
        padding:20,
        borderRadius:32
    },
    subtitle:{
        marginBottom:8,
        fontFamily:Fonts.signikaRegular,
        fontSize:16,
        color:Colors.text_muted
    },
    button:{
        marginTop:20,
        height:50
    },
    loading:{
        marginTop:40
    },
    list:{
        paddingHorizontal:16,
        paddingBottom:40,
        gap:8
    },
    item:{
        flexDirection:'row',
        alignItems:'center',
        paddingVertical:16,
        paddingHorizontal:18,
        borderRadius:12,
        backgroundColor:Colors.background,
        shadowColor:'#000',
        shadowOpacity:0.06,
        shadowRadius:6,
        shadowOffset:{ width:0, height:2 },
        elevation:2
    },
    itemText:{
        flex:1,
        fontFamily:Fonts.signikaSemiBold,
        fontSize:16,
        color:Colors.text_card
    },
    empty:{
        marginTop:20,
        textAlign:'center',
        fontFamily:Fonts.alegreyaRegular,
        fontSize:16,
        color:Colors.hint
    }
})
