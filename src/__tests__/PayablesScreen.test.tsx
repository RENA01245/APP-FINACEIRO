import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { PayablesScreen } from '../view/screens/PayablesScreen';
import { PayablesViewModel } from '../viewmodel/PayablesViewModel';
import { Alert } from 'react-native';

// Mock Dependencies
jest.mock('../viewmodel/PayablesViewModel');
jest.mock('../infra/services/NotificationService', () => ({
  NotificationService: {
    requestPermissions: jest.fn(),
    scheduleNotification: jest.fn(),
    cancelNotification: jest.fn(),
  }
}));

describe('PayablesScreen UX', () => {
  let mockViewModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup Mock Instance
    mockViewModel = {
      getPending: jest.fn().mockResolvedValue([
        { 
          id: '1', 
          description: 'Conta de Luz', 
          amount: 150.00, 
          due_date: new Date().toISOString(),
          user_id: 'user123',
          status: 'pending'
        }
      ]),
      add: jest.fn(),
      pay: jest.fn().mockResolvedValue(true),
    };

    // @ts-ignore
    PayablesViewModel.mockImplementation(() => mockViewModel);
  });

  it('deve abrir o modal de pagamento ao clicar em Pagar', async () => {
    const { getByText } = render(<PayablesScreen />);

    // Wait for list to load
    await waitFor(() => expect(getByText('Conta de Luz')).toBeTruthy());

    // Click "Pagar" button
    const payButton = getByText('Pagar');
    fireEvent.press(payButton);

    // Check if Modal Title appears
    expect(getByText('Confirmar Pagamento')).toBeTruthy();
    expect(getByText('Pagar Conta de Luz no valor de R$ 150.00?')).toBeTruthy();
  });

  it('deve chamar viewModel.pay com a data selecionada ao confirmar', async () => {
    const { getByText } = render(<PayablesScreen />);

    await waitFor(() => expect(getByText('Conta de Luz')).toBeTruthy());

    // Open Modal
    fireEvent.press(getByText('Pagar'));

    // Confirm Payment (assuming default date is today)
    // Note: We are not changing the date in this test, just confirming default
    fireEvent.press(getByText('Confirmar'));

    // Assert Pay was called
    await waitFor(() => {
      expect(mockViewModel.pay).toHaveBeenCalledWith(
        expect.objectContaining({ id: '1' }),
        expect.any(Date)
      );
    });
  });
});
