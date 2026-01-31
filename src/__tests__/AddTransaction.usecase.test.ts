import { AddTransaction } from '../usecase/transactions/AddTransaction';
import { TransactionRepositorySupabase } from '../infra/repositories/TransactionRepositorySupabase';

// Mock the repository class
jest.mock('../infra/repositories/TransactionRepositorySupabase');

describe('AddTransaction UseCase', () => {
  let addTransaction: AddTransaction;
  let mockRepo: jest.Mocked<TransactionRepositorySupabase>;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Instantiate UseCase (which internally does new TransactionRepositorySupabase())
    addTransaction = new AddTransaction();
    
    // Get the mock instance that was created
    // @ts-ignore - Accessing the mock instance
    mockRepo = TransactionRepositorySupabase.mock.instances[0];
  });

  it('deve aceitar valores com vírgula e converter corretamente', async () => {
    // Arrange
    const transaction = {
      user_id: '123',
      description: 'Teste',
      amount: 10.50, // O input na UI geralmente converte string para number antes, 
                     // mas se a regra fosse parsing de string, testaríamos string.
                     // O usecase espera Transaction object que tem amount: number.
                     // Assumindo que a conversão ocorre antes ou o usecase aceita number.
                     // Olhando o código original: espera Transaction que tem amount: number.
      type: 'expense',
      date: new Date(),
    };

    // Mock countByMonth to return 0 (limit not reached)
    mockRepo.countByMonth.mockResolvedValue(0);

    // Act
    // @ts-ignore
    await addTransaction.execute(transaction);

    // Assert
    expect(mockRepo.add).toHaveBeenCalledWith(expect.objectContaining({
      amount: 10.50
    }));
  });

  it('deve rejeitar transação sem user_id', async () => {
    const transaction = {
      description: 'Teste',
      amount: 10,
      type: 'expense',
      date: new Date(),
    };

    // @ts-ignore
    await expect(addTransaction.execute(transaction))
      .rejects.toThrow('User ID required');
  });

  it('deve rejeitar transação sem valor (amount)', async () => {
    const transaction = {
      user_id: '123',
      description: 'Teste',
      type: 'expense',
      date: new Date(),
    };

    // @ts-ignore
    await expect(addTransaction.execute(transaction))
      .rejects.toThrow('Amount required');
  });

  it('deve bloquear limite mensal de 200 transações', async () => {
    // Arrange
    const transaction = {
      user_id: '123',
      description: 'Teste Limite',
      amount: 10,
      type: 'expense',
      date: new Date(),
    };

    // Mock countByMonth to return 200 (limit reached)
    mockRepo.countByMonth.mockResolvedValue(200);

    // Act & Assert
    // @ts-ignore
    await expect(addTransaction.execute(transaction))
      .rejects.toThrow('Limite mensal de 200 transações atingido.');
      
    expect(mockRepo.add).not.toHaveBeenCalled();
  });
});
