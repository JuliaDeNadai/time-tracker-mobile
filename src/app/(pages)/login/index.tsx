
import Colors from '@/app/constants/colors';
import Buttons from '@/components/button';
import { api } from '@/infra/api/api';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { TextInput } from 'react-native-paper';
/* import Icon from 'react-native-vector-icons/FontAwesome'; */

export default function Index() {
  const Router =  require('expo-router').useRouter();

  const [formData, setformData] = useState({
      email:'',
      password:''
  })
  const [loading, setLoading] = React.useState(false);

  async function handleLogin() {

    setLoading(true);

    if(!formData.email || !formData.password){
      alert('Por favor, preencha todos os campos.');
      setLoading(false);
      return;
    }

    try{
      const result = await api.post('/auth', formData)

      console.log(result.data);
      alert('Login realizado com sucesso!');
      // adicionar o token recuperado em algum lugar seguro (context, storage, etc)
      // criar a tela home e redirecionar para ela
      Router.replace('/(pages)/home');
    }
    catch(error: any){
      alert(`Erro ao fazer login. Por favor, tente novamente. ERROR: ${error.message}` );
    }
    finally{
      setLoading(false);
    }
    console.log(formData);
  }

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
                    <View  style={{
                      justifyContent:'center',
                      backgroundColor:'#ededed',
                      width:'95%',
                      borderRadius:10,
                      height:60,
                      marginTop:20
                    }} >
                        <TextInput
                          label="Email"
                          onChangeText={ text => setformData({...formData, email:text})}
                        />
                    </View>

                    <View style={{
                      justifyContent:'center',
                      backgroundColor:'#ededed',
                      width:'95%',
                      borderRadius:10,
                      height:60,
                      marginTop:20
                    }} >
                        <TextInput
                          label="Senha"
                          onChangeText={ text => setformData({...formData, password:text})}
                        />
                    </View>

                    <View style={{width:'95%',marginBottom:10}} >
                        <Text style={{fontSize:17,fontFamily:'OpenSans-SemiBold',
                    color:'#818181',alignSelf:'flex-end',paddingTop:10}} >Forgot Password?</Text>
                    </View>

                    <Buttons text="Entrar" onPress={handleLogin}/>

                    <View style={{width:'95%',marginBottom:10}} >
                        <Link
                          style={{
                            fontSize:17,
                            fontFamily:'OpenSans-SemiBold',
                            color:'#818181',
                            alignSelf:'flex-end',
                            paddingTop:10
                          }}
                          href={{ pathname: "/(pages)/register" }}>Ainda não tem uma conta? Cadastro</Link>  
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