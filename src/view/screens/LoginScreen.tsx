import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, KeyboardAvoidingView, Platform, ScrollView, StatusBar, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { AuthViewModel } from '../../viewmodel/AuthViewModel';
import { useAppTheme } from '../../design/ThemeContext';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';

export function LoginScreen() {
  const { theme, baseTheme } = useAppTheme();
  const styles = createStyles(theme, baseTheme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const [viewModel] = useState(() => new AuthViewModel());

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha todos os campos.');
      return;
    }

    try {
      setLoading(true);
      await viewModel.login(email, password);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Atenção', 'Preencha email e senha para cadastrar.');
      return;
    }

    try {
      setLoading(true);
      await viewModel.register(email, password);
      Alert.alert('Sucesso', 'Verifique seu email!');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.gradientPrimary} style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.logoContainer}>
              <View style={[styles.logoCircle, { backgroundColor: theme.surface }]}>
                <Feather name="dollar-sign" size={40} color={theme.primary} />
              </View>
              <Text style={styles.appName}>App Financeiro</Text>
              <Text style={styles.appTagline}>Sua liberdade financeira começa aqui</Text>
            </View>

            <View style={[styles.formCard, { backgroundColor: theme.surface }]}>
              <CustomInput
                label="Email"
                placeholder="Digite seu e-mail"
                icon="mail"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />

              <CustomInput
                label="Senha"
                placeholder="Sua senha secreta"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <PrimaryButton
                title={loading ? 'Entrando...' : 'Acessar Conta'}
                onPress={handleLogin}
                loading={loading}
                style={styles.button}
              />

              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={[styles.forgotText, { color: theme.primary }]}>Esqueceu a senha?</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: theme.textSecondary }]}>Não tem uma conta?</Text>
              <TouchableOpacity onPress={handleSignUp}>
                <Text style={[styles.signUpText, { color: theme.primary }]}> Cadastre-se</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </View>
  );
}

function createStyles(theme: any, baseTheme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
    },
    keyboardView: {
      flex: 1,
    },
    scrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingHorizontal: 25,
      paddingVertical: 40,
    },
    logoContainer: {
      alignItems: 'center',
      marginBottom: 40,
    },
    logoCircle: {
      width: 100,
      height: 100,
      borderRadius: 50,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      backgroundColor: '#FFF',
      ...baseTheme.shadows.default
    },
    appName: {
      fontSize: 28,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 8,
    },
    appTagline: {
      fontSize: 16,
      color: 'rgba(255,255,255,0.8)',
      textAlign: 'center',
    },
    formCard: {
      borderRadius: 24,
      padding: 24,
      ...baseTheme.shadows.default
    },
    button: {
      marginTop: 10,
    },
    forgotPassword: {
      alignItems: 'center',
      marginTop: 15,
    },
    forgotText: {
      fontSize: 14,
      fontWeight: '600',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'center',
      marginTop: 30,
    },
    footerText: {
      fontSize: 14,
    },
    signUpText: {
      fontSize: 14,
      fontWeight: 'bold',
    }
  });
}
