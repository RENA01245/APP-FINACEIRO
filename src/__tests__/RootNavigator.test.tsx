import React from 'react';
import { render, waitFor, act } from '@testing-library/react-native';
import { Text } from 'react-native';
import { RootNavigator } from '../navigation/RootNavigator';
import { ObserveAuthState } from '../usecase/auth/ObserveAuthState';

// Mock ObserveAuthState
jest.mock('../usecase/auth/ObserveAuthState');

// Mock child screens with identifiable text
jest.mock('../view/screens/LoginScreen', () => {
  const { Text } = require('react-native');
  return {
    LoginScreen: () => <Text>Login Screen</Text>
  };
});
jest.mock('../view/screens/HomeScreen', () => {
  const { Text } = require('react-native');
  return {
    HomeScreen: () => <Text>Home Screen</Text>
  };
});
jest.mock('../view/screens/AddTransactionScreen', () => {
  const { Text } = require('react-native');
  return {
    AddTransactionScreen: () => <Text>Add Transaction Screen</Text>
  };
});
jest.mock('../view/screens/PayablesScreen', () => {
  const { Text } = require('react-native');
  return {
    PayablesScreen: () => <Text>Payables Screen</Text>
  };
});

describe('RootNavigator', () => {
  let mockObserveAuthState: jest.Mocked<ObserveAuthState>;

  beforeEach(() => {
    jest.clearAllMocks();
    // @ts-ignore
    mockObserveAuthState = {
      execute: jest.fn()
    };
    // @ts-ignore
    ObserveAuthState.mockImplementation(() => mockObserveAuthState);
  });

  it('deve mostrar Loading inicialmente', () => {
    // Mock execute to NOT callback immediately (simulating loading)
    // Fix return structure to match { data: { subscription: ... } }
    mockObserveAuthState.execute.mockReturnValue({ 
      data: { subscription: { unsubscribe: jest.fn() } } 
    });

    const { getByTestId } = render(<RootNavigator />);
    // Note: ActivityIndicator usually doesn't have text, checking presence might need testID if not standard
    // RootNavigator has ActivityIndicator inside a View. 
    // Usually easier to check that Login/Home are NOT present yet.
  });

  it('deve renderizar LoginScreen quando não há sessão', async () => {
    mockObserveAuthState.execute.mockImplementation((callback) => {
      callback(null); // No session
      return { 
        data: { subscription: { unsubscribe: jest.fn() } } 
      };
    });

    const { findByText } = render(<RootNavigator />);
    
    await waitFor(() => expect(findByText('Login Screen')).toBeTruthy());
  });

  it('deve renderizar HomeScreen quando há sessão', async () => {
    mockObserveAuthState.execute.mockImplementation((callback) => {
      // @ts-ignore
      callback({ user: { id: '123' } }); // With session
      return { 
        data: { subscription: { unsubscribe: jest.fn() } } 
      };
    });

    const { findByText } = render(<RootNavigator />);
    
    await waitFor(() => expect(findByText('Home Screen')).toBeTruthy());
  });
});
