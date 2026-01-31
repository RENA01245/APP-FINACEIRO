import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { AddTransactionScreen } from '../view/screens/AddTransactionScreen';
import { AddTransactionViewModel } from '../viewmodel/AddTransactionViewModel';

// Mock Navigation
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ goBack: mockGoBack }),
  useRoute: () => ({
    params: {
      transaction: {
        id: '123',
        description: 'Antigo',
        amount: 100.00,
        type: 'expense',
        category: 'Alimentação',
        created_at: '2023-01-01T10:00:00.000Z',
        isRecurring: false
      }
    }
  }),
}));

// Mock ViewModel
jest.mock('../viewmodel/AddTransactionViewModel');

describe('Edit Transaction Flow', () => {
  let mockUpdate: jest.Mock;

  beforeEach(() => {
    mockUpdate = jest.fn().mockResolvedValue(undefined);
    // @ts-ignore
    AddTransactionViewModel.mockImplementation(() => ({
      update: mockUpdate,
      add: jest.fn(),
    }));
  });

  it('deve preencher os campos com os dados da transação existente', () => {
    const { getByDisplayValue } = render(<AddTransactionScreen />);
    
    expect(getByDisplayValue('Antigo')).toBeTruthy();
    expect(getByDisplayValue('100')).toBeTruthy();
  });

  it('deve chamar viewModel.update com os novos valores ao salvar', async () => {
    const { getByDisplayValue, getByText } = render(<AddTransactionScreen />);

    // Change description
    fireEvent.changeText(getByDisplayValue('Antigo'), 'Novo');

    // Click Save
    fireEvent.press(getByText('Salvar'));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(
        '123',
        '100', // Amount hasn't changed
        'Novo',
        'expense',
        'Alimentação',
        false,
        expect.any(Date) // Date might be re-initialized
      );
    });
  });
});
