import Colors from '@/constants/colors';
import Fonts from '@/constants/fonts';
import { showAlert } from '@/components/app-alert';
import AuthScreen from '@/components/auth-screen';
import Buttons from '@/components/button';
import UnderlineInput from '@/components/underline-input';
import { getErrorMessage } from '@/infra/api/api';
import { UsersRepository } from '@/infra/repositories/users.repository';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAuth } from '../../../context/auth-context.context';

const usersRepository = new UsersRepository();

export default function Index() {
  const { signin } = useAuth();

  const [formData, setformData] = useState({
      email:'',
      password:'',
      name:'',
      value_hour:''
  })
  const [loading, setLoading] = useState(false);

  async function handleRegister() {

    if(!formData.email || !formData.password || !formData.name || !formData.value_hour){
      showAlert('Por favor, preencha todos os campos.');
      return;
    }

    setLoading(true);

    const email = formData.email.trim();
    try{
      await usersRepository.create({ ...formData, email, name: formData.name.trim() })
      await signin({ email, password: formData.password })
    }
    catch(error){
      showAlert(getErrorMessage(error, 'Erro ao criar conta. Tente novamente.'));
      setLoading(false);
    }
  }

  return (
    <AuthScreen
      title="Registrar"
      subtitle="Crie uma conta para começar a controlar suas marcações de ponto."
    >
      <View style={styles.form}>
        <UnderlineInput
          placeholder="Nome"
          maxLength={30}
          defaultValue={formData.name}
          onChangeText={text => setformData(current => ({...current, name:text}))}
          autoComplete="name"
        />
        <UnderlineInput
          placeholder="Email"
          maxLength={30}
          defaultValue={formData.email}
          onChangeText={text => setformData(current => ({...current, email:text}))}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          style={styles.inputSpacing}
        />
        <UnderlineInput
          placeholder="Senha"
          maxLength={30}
          defaultValue={formData.password}
          onChangeText={text => setformData(current => ({...current, password:text}))}
          secureTextEntry
          autoCapitalize="none"
          autoComplete="new-password"
          style={styles.inputSpacing}
        />
        <UnderlineInput
          placeholder="Valor por hora trabalhada"
          defaultValue={formData.value_hour}
          onChangeText={text => setformData(current => ({...current, value_hour:text}))}
          keyboardType="number-pad"
          maxLength={3}
          style={styles.inputSpacing}
        />
      </View>

      <Buttons text="REGISTRAR" onPress={handleRegister} loading={loading} style={styles.button} />

      <Link href="/login" style={styles.footer}>
        Já tem uma conta?{'  '}
        <Text style={styles.footerHighlight}>Entrar</Text>
      </Link>
    </AuthScreen>
  );
}

const styles = StyleSheet.create({
    form:{
        marginTop:18
    },
    inputSpacing:{
        marginTop:32
    },
    button:{
        marginTop:30,
        marginHorizontal:-8
    },
    footer:{
        alignSelf:'center',
        marginTop:18,
        fontFamily:Fonts.alegreyaRegular,
        fontSize:20,
        color:Colors.link
    },
    footerHighlight:{
        fontFamily:Fonts.alegreyaBold
    }
})
