import { AddTransaction } from '../usecase/transactions/AddTransaction';
import { UpdateTransaction } from '../usecase/transactions/UpdateTransaction';
import { GetSession } from '../usecase/auth/GetSession';

export class AddTransactionViewModel {
  private addTransactionUseCase = new AddTransaction();
  private updateTransactionUseCase = new UpdateTransaction();
  private getSessionUseCase = new GetSession();

  private validate(amount: string, category: string): number {
    // Replace comma with dot
    const sanitizedAmount = amount.replace(',', '.');
    let value = parseFloat(sanitizedAmount);

    if (isNaN(value)) throw new Error('Valor inválido');
    
    // Round to 2 decimal places
    value = Math.round(value * 100) / 100;

    // Validation limits
    if (value <= 0) throw new Error('O valor deve ser maior que zero.');
    if (value > 999999.99) throw new Error('O valor máximo permitido é R$ 999.999,99');
    
    // Validation category
    if (!category) throw new Error('Selecione uma categoria.');

    return value;
  }

  async add(amount: string, description: string, type: 'income' | 'expense', category: string, isRecurring: boolean, date: Date) {
    const session = await this.getSessionUseCase.execute();
    if (!session?.user) throw new Error('Usuário não autenticado');

    const value = this.validate(amount, category);

    await this.addTransactionUseCase.execute({
      user_id: session.user.id,
      amount: value,
      description,
      type,
      category,
      isRecurring,
      created_at: date.toISOString(),
    });
  }

  async update(id: string, amount: string, description: string, type: 'income' | 'expense', category: string, isRecurring: boolean, date: Date) {
    const session = await this.getSessionUseCase.execute();
    if (!session?.user) throw new Error('Usuário não autenticado');

    const value = this.validate(amount, category);

    await this.updateTransactionUseCase.execute({
      id,
      user_id: session.user.id,
      amount: value,
      description,
      type,
      category,
      isRecurring,
      created_at: date.toISOString(),
    });
  }
}
