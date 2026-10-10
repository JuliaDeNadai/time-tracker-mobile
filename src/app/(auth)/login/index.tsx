import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { showAlert } from '@/components/app-alert';
import AuthScreen from '@/components/auth-screen';
import Buttons from '@/components/button';
import UnderlineInput from '@/components/underline-input';
import { getErrorMessage } from '@/infra/api/api';
import { isAxiosError } from 'axios';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../../context/auth-context.context';

export default function Index() {
  const { signin } = useAuth()

  const [formData, setformData] = useState({
      email:'',
      password:''
  })
  const [loading, setLoading] = useState(false);

  async function handleLogin() {

    if(!formData.email || !formData.password){
      showAlert('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);
    try{
      await signin({ email: formData.email.trim(), password: formData.password })
    }
    catch(error){
      const invalid = isAxiosError(error) && error.response?.status === 401
      showAlert(invalid ? 'Email ou senha incorretos.' : getErrorMessage(error, 'Erro ao fazer login. Tente novamente.'));
      setLoading(false);
    }
  }

  return (
    <AuthScreen title="Login" subtitle="Entre para acessar seus registros de ponto">
      <View style={styles.form}>
        <UnderlineInput
          placeholder="Email"
          defaultValue={formData.email}
          onChangeText={text => setformData(current => ({...current, email:text}))}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
        />
        <UnderlineInput
          placeholder="Senha"
          defaultValue={formData.password}
          onChangeText={text => setformData(current => ({...current, password:text}))}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="password"
          style={styles.inputSpacing}
        />
      </View>

      <Text style={styles.forgot}>Esqueceu a senha?</Text>

      <Buttons text="ENTRAR" onPress={handleLogin} loading={loading} style={styles.button} />

      <Link href="/register" style={styles.footer}>
        Ainda não tem uma conta?{'  '}
        <Text style={styles.footerHighlight}>Cadastro</Text>
      </Link>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
    form:{
        marginTop:45
    },
    inputSpacing:{
        marginTop:32
    },
    forgot:{
        alignSelf:'flex-end',
        marginTop:9,
        fontFamily:Fonts.alegreyaRegular,
        fontSize:14,
        color:Colors.hint
    },
    button:{
        marginTop:29,
        marginHorizontal:-8
    },
    footer:{
        alignSelf:'center',
        marginTop:19,
        fontFamily:Fonts.alegreyaRegular,
        fontSize:20,
        color:Colors.link
    },
    footerHighlight:{
        fontFamily:Fonts.alegreyaBold
    }
})
