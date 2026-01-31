import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../view/screens/HomeScreen';
import { HomeViewModel } from '../viewmodel/HomeViewModel';
import { BudgetViewModel } from '../viewmodel/BudgetViewModel';
import { PayablesViewModel } from '../viewmodel/PayablesViewModel';
import { Alert } from 'react-native';

import { useFocusEffect } from '@react-navigation/native';

// Mock expo-notifications to prevent import errors
jest.mock('expo-notifications', () => ({
  setNotificationHandler: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  cancelScheduledNotificationAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
}));

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: jest.fn() }),
  useFocusEffect: jest.fn(),
}));

// Mock Dependencies
jest.mock('../viewmodel/HomeViewModel');
jest.mock('../viewmodel/AuthViewModel');
jest.mock('../viewmodel/BudgetViewModel');
jest.mock('../viewmodel/PayablesViewModel');

describe('DeleteConfirm (HomeScreen)', () => {
  let mockHomeViewModel: any;
  let mockBudgetViewModel: any;
  let mockPayablesViewModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Make useFocusEffect run immediately
    (useFocusEffect as jest.Mock).mockImplementation((callback) => callback());

    // Setup Mock Instances
    mockHomeViewModel = {
      currentDate: new Date(),
      checkRecurring: jest.fn(),
      getTransactions: jest.fn().mockResolvedValue([
        { id: '1', description: 'Transação Teste', amount: 100, type: 'expense', category: 'Lazer' }
      ]),
      calculateSummary: jest.fn().mockReturnValue({ income: 0, expense: 100, total: -100 }),
      getCurrentMonthLabel: jest.fn().mockReturnValue('Janeiro 2026'),
      deleteTransaction: jest.fn().mockResolvedValue(true),
      nextMonth: jest.fn(),
      prevMonth: jest.fn(),
    };

    mockBudgetViewModel = {
      getBudgetsStatus: jest.fn().mockResolvedValue([]),
      setBudget: jest.fn(),
    };

    mockPayablesViewModel = {
      getPending: jest.fn().mockResolvedValue([]),
    };

    // @ts-ignore
    HomeViewModel.mockImplementation(() => mockHomeViewModel);
    // @ts-ignore
    BudgetViewModel.mockImplementation(() => mockBudgetViewModel);
    // @ts-ignore
    PayablesViewModel.mockImplementation(() => mockPayablesViewModel);
  });

  it('deve abrir Alert.alert ao clicar no botão de excluir', async () => {
    const { getByText } = render(<HomeScreen />);

    // Wait for list to load
    await waitFor(() => expect(getByText('Transação Teste')).toBeTruthy());

    // Click delete button (X)
    const deleteBtn = getByText('X');
    fireEvent.press(deleteBtn);

    // Assert Alert was called
    expect(Alert.alert).toHaveBeenCalledWith(
      'Excluir Transação',
      'Tem certeza que deseja excluir esta transação?',
      expect.any(Array)
    );
  });

  it('deve chamar deleteTransaction ao confirmar exclusão', async () => {
    const { getByText } = render(<HomeScreen />);
    await waitFor(() => expect(getByText('Transação Teste')).toBeTruthy());

    // Click delete button (X)
    const deleteBtn = getByText('X'); 
    fireEvent.press(deleteBtn);
    
    // Simulate Alert Confirmation
    // Alert.alert calls the 3rd argument (buttons array), we find the "Excluir" button and press it
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const buttons = alertCalls[0][2];
    const confirmButton = buttons.find((b: any) => b.text === 'Excluir');
    await confirmButton.onPress();

    await waitFor(() => {
        expect(mockHomeViewModel.deleteTransaction).toHaveBeenCalledWith('1');
    });
  });
});
