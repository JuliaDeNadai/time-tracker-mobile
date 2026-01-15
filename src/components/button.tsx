import Colors from '@/app/constants/colors'
import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

const Buttons = () => {
    return (
        <TouchableOpacity style={{justifyContent:'center',width:'95%',backgroundColor:Colors.primary,height:50,marginBottom:30,borderRadius:10}} 
        onPress={() => {}}
        >
            <Text style={{fontSize:15,letterSpacing:1.5,textAlign:'center',position:'relative',fontFamily:'OpenSans-SemiBold',color:Colors.white}} >TEXTO</Text>


        </TouchableOpacity>
    )
}

export default Buttons

const styles = StyleSheet.create({})