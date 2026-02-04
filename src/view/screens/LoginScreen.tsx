import React, { useState } from 'react';
import { View, StyleSheet, Alert, Text, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { AuthViewModel } from '../../viewmodel/AuthViewModel';
import { useAppTheme } from '../../design/ThemeContext';
import { CustomInput } from '../components/CustomInput';
import { PrimaryButton } from '../components/PrimaryButton';

export function LoginScreen() {
  const { theme, baseTheme, isDarkMode } = useAppTheme();
  const styles = createStyles(theme, baseTheme);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      <LinearGradient
        colors={theme.gradientPrimary}
        style={styles.header}
      >
        <SafeAreaView edges={['top']} style={styles.safeArea}>
          <View style={[styles.logoCircle, { backgroundColor: theme.surface }]}>
            <Feather name="dollar-sign" size={40} color={theme.primary} />
          </View>
          <Text style={styles.welcomeText}>Bem-vindo</Text>
          <Text style={styles.subText}>Controle suas finanças com simplicidade.</Text>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.content}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={[styles.formCard, { backgroundColor: theme.surface }]}>
            <CustomInput
              label="Email"
              placeholder="seu@email.com"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              icon="mail"
            />

            <CustomInput
              label="Senha"
              placeholder="Sua senha secreta"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              icon="lock"
              rightAction={{
                icon: showPassword ? 'eye-off' : 'eye',
                onPress: () => setShowPassword(!showPassword)
              }}
            />

            <View style={styles.actions}>
              <PrimaryButton
                title="Entrar"
                onPress={handleLogin}
                loading={loading}
              />

              <View style={styles.spacer} />

              <PrimaryButton
                title="Criar conta"
                onPress={handleSignUp}
                variant="outline"
                loading={loading}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function createStyles(theme: any, baseTheme: any) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    header: {
      height: 300,
      paddingHorizontal: 20,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    safeArea: {
      alignItems: 'center',
      width: '100%',
    },
    logoCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      ...baseTheme.shadows.default
    },
    welcomeText: {
      fontSize: 32,
      fontWeight: 'bold',
      color: '#FFF',
      marginBottom: 5
    },
    subText: {
      color: 'rgba(255,255,255,0.8)',
      fontSize: 16
    },
    content: {
      flex: 1,
      marginTop: -40,
    },
    scrollContent: {
      paddingHorizontal: 20,
      paddingBottom: 20
    },
    formCard: {
      borderRadius: 20,
      padding: 24,
      ...baseTheme.shadows.default
    },
    actions: {
      marginTop: 20,
    },
    spacer: {
      height: 15
    }
  });
}
