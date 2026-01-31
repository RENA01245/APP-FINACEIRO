import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { HomeScreen } from '../view/screens/HomeScreen';
import { HomeViewModel } from '../viewmodel/HomeViewModel';
import { Alert } from 'react-native';

// Mock Dependencies
jest.mock('../viewmodel/HomeViewModel');
jest.mock('../viewmodel/AuthViewModel');
jest.mock('../viewmodel/BudgetViewModel');

describe('DeleteConfirm (HomeScreen)', () => {
  let mockHomeViewModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Mock Instance
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

    // @ts-ignore
    HomeViewModel.mockImplementation(() => mockHomeViewModel);
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

    const deleteBtn = getByText('X');
    fireEvent.press(deleteBtn);

    // Simulate clicking "Excluir" in Alert
    // Alert.alert is mocked, so we need to manually invoke the callback
    const alertCalls = (Alert.alert as jest.Mock).mock.calls;
    const buttons = alertCalls[0][2]; // 3rd argument is buttons array
    const confirmBtn = buttons.find((b: any) => b.text === 'Excluir');
    
    // Invoke handler
    await confirmBtn.onPress();

    // Assert ViewModel delete was called
    expect(mockHomeViewModel.deleteTransaction).toHaveBeenCalledWith('1');
  });
});
