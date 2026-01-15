
import Colors from '@/app/constants/colors';
import Buttons from '@/components/button';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
/* import Icon from 'react-native-vector-icons/FontAwesome'; */

export default function Index() {

  const [formData,setformData] = useState({
      email:'',
      password:''
  })
  const [text, setText] = React.useState("");

  return (
        <ScrollView style={{flex:1,backgroundColor:'#F9F7F7',flexDirection:'column'}}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9F7F7" />
            {/* login form section */}
            <View style={{ margin: 12, flex:2,flexDirection:'column',backgroundColor:'#F9F7F7 ',paddingTop:10,paddingHorizontal:'3%'}} >
                <View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}} >
                    <Text style={{fontFamily:'OpenSans-SemiBold',fontSize:30,color:Colors.black}} >Login</Text>
                    {/* <Image source={require('../assets/images/waving_hand.png')} style={{width:30,height:30}}  /> */}
                </View>
                <Text style={{fontFamily:"OpenSans-Regular",fontSize:14,paddingTop:10,color:"#777"}} >Entre para acessar seus registros de ponto</Text>

                <View style={{flexDirection:'column',paddingTop:20}} >
                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',backgroundColor:'#ededed',width:'95%',borderRadius:10,height:60,paddingLeft:20}} >
                        {/* <Icon name="envelope-o" size={22} color="#818181" /> */}
                        <TextInput
                          label="Email"
                          value={"Email"}
                          onChangeText={text => setText(text)}
                        />
                    </View>

                    <View style={{flexDirection:'row',justifyContent:'center',alignItems:'center',backgroundColor:'#ededed',width:'95%',borderRadius:10,height:60,paddingLeft:20,marginTop:20}} >
                        {/* <Icon name="lock" size={22} color="#818181" /> */}
                        <TextInput
                          label="Senha"
                          value={"Senha"}
                          onChangeText={text => setText(text)}
                        />
                    </View>

                    <View style={{width:'95%',marginBottom:10}} >
                        <Text style={{fontSize:17,fontFamily:'OpenSans-SemiBold',
                    color:'#818181',alignSelf:'flex-end',paddingTop:10}} >Forgot Password?</Text>
                    </View>

                    <Buttons/>

                    <View style={{width:'95%',marginBottom:10}} >
                        <Text style={{fontSize:17,fontFamily:'OpenSans-SemiBold',
                    color:'#818181',alignSelf:'flex-end',paddingTop:10}} >Ainda não tem uma conta? Cadastro</Text>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    input:{
        position:'relative',
        height:'100%',
        width:'90%',
        fontFamily:'OpenSans-Medium',
        paddingLeft:20,
    },
    social_btn:{
        height:55,
        width:'100%',
        borderWidth:1,
        borderRadius:10,
        borderColor:'#ddd',
        flexDirection:'row',
        alignItems:'center',
        marginBottom:20
    },
    social_img:{
        width:25,
        height:25,
        marginLeft:15
    }
})