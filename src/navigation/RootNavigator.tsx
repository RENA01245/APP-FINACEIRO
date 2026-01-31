import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Session } from '@supabase/supabase-js';
import { LoginScreen } from '../view/screens/LoginScreen';
import { HomeScreen } from '../view/screens/HomeScreen';
import { AddTransactionScreen } from '../view/screens/AddTransactionScreen';
import { ObserveAuthState } from '../usecase/auth/ObserveAuthState';
import { View, ActivityIndicator } from 'react-native';

const Stack = createNativeStackNavigator();

export function RootNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const observer = new ObserveAuthState();
    const { data } = observer.execute((currentSession) => {
      setSession(currentSession);
      setLoading(false);
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator>
        {!session ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Minhas Finanças' }} />
            <Stack.Screen name="AddTransaction" component={AddTransactionScreen} options={{ title: 'Nova Transação' }} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
