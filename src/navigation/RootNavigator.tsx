
import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Session } from '@supabase/supabase-js';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { LoginScreen } from '../view/screens/LoginScreen';
import { HomeScreen } from '../view/screens/HomeScreen';
import { AddTransactionScreen } from '../view/screens/AddTransactionScreen';
import { PayablesScreen } from '../view/screens/PayablesScreen';
import { ReportsScreen } from '../view/screens/ReportsScreen';
import { BudgetsScreen } from '../view/screens/BudgetsScreen';
import { CategoriesScreen } from '../view/screens/CategoriesScreen';
import { CardsScreen } from '../view/screens/CardsScreen';
import { ObserveAuthState } from '../usecase/auth/ObserveAuthState';
import { useAppTheme } from '../design/ThemeContext';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const CustomTabBarButton = ({ children, onPress }: any) => {
  const { theme, baseTheme } = useAppTheme();
  return (
    <TouchableOpacity
      style={{
        top: -20,
        justifyContent: 'center',
        alignItems: 'center',
        ...baseTheme.shadows.soft
      }}
      onPress={(e) => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress(e);
      }}
    >
      <LinearGradient
        colors={theme.gradientSecondary}
        style={{
          width: 60,
          height: 60,
          borderRadius: 30,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        {children}
      </LinearGradient>
    </TouchableOpacity>
  );
};

import { SettingsScreen } from '../view/screens/SettingsScreen';

function AppTabs() {
  const { theme, baseTheme } = useAppTheme();
  const insets = useSafeAreaInsets();

  const bottomPadding = Math.max(insets.bottom, 15);
  const tabBarHeight = 65 + insets.bottom;
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: bottomPadding,
          left: 10,
          right: 10,
          backgroundColor: theme.surface,
          borderRadius: 22,
          height: 65,
          paddingBottom: Platform.OS === 'ios' ? 0 : 0,
          ...baseTheme.shadows.default,
          borderTopWidth: 0,
          elevation: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
          marginTop: 0
        }
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="ReportsStack"
        component={ReportsScreen}
        options={{
          tabBarLabel: 'Relatórios',
          tabBarIcon: ({ color, size }) => (
            <Feather name="pie-chart" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="AddTransactionTab"
        component={AddTransactionScreen}
        options={({ navigation }) => ({
          tabBarLabel: '',
          tabBarIcon: ({ focused }) => (
            <Feather name="plus" color="#FFF" size={30} />
          ),
          tabBarButton: (props) => (
            <CustomTabBarButton {...props} onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              navigation.navigate('AddTransaction');
            }} />
          )
        })}
      />

      <Tab.Screen
        name="Payables"
        component={PayablesScreen}
        options={{
          tabBarLabel: 'Contas',
          tabBarIcon: ({ color, size }) => (
            <Feather name="file-text" color={color} size={size} />
          ),
        }}
      />

      <Tab.Screen
        name="Budgets"
        component={BudgetsScreen}
        options={{
          tabBarLabel: 'Metas',
          tabBarIcon: ({ color, size }) => (
            <Feather name="target" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

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
            <Stack.Screen name="AppTabs" component={AppTabs} options={{ headerShown: false }} />
            {/* We keep AddTransaction as a separate stack screen to open nicely on top or as modal */}
            <Stack.Screen
              name="AddTransaction"
              component={AddTransactionScreen}
              options={{
                headerShown: false,
                presentation: 'modal',
                animation: 'slide_from_bottom'
              }}
            />
            <Stack.Screen
              name="Categories"
              component={CategoriesScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Cards"
              component={CardsScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
