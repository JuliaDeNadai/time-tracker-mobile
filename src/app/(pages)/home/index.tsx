
import Colors from '@/app/constants/colors';
import Buttons from '@/components/button';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../../context/auth-context.context';
/* import Icon from 'react-native-vector-icons/FontAwesome'; */

export default function Index() {
  const { token, signin} = useAuth()
  const Router =  require('expo-router').useRouter();

  const [formData, setformData] = useState({
      email:'',
      password:''
  })

  async function handleNewRegister() {

    if(!formData.email || !formData.password){
      alert('Por favor, preencha todos os campos.');
      return;
    }

    try{
      await signin(formData)

      alert('Login realizado com sucesso!');
      Router.replace('/(pages)/home');
    }
    catch(error: any){
      alert(`Erro ao fazer login. Por favor, tente novamente. ERROR: ${error.message}` );
    }
    console.log(formData);
  }

  return (
        <ScrollView style={{flex:1,backgroundColor:'#F9F7F7',flexDirection:'column'}}>
            <StatusBar barStyle="dark-content" backgroundColor="#F9F7F7" />
            {/* login form section */}
            <View style={{ margin: 12, flex:2,flexDirection:'column',backgroundColor:'#F9F7F7 ',paddingTop:10,paddingHorizontal:'3%'}} >
                <View style={{flexDirection:'row',justifyContent:'flex-start',alignItems:'center'}} >
                    <Text style={{fontFamily:'OpenSans-SemiBold',fontSize:30,color:Colors.black}} >Home</Text>
                </View>
                <Buttons text="Ver todos os registros de ponto" onPress={handleNewRegister}/>
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