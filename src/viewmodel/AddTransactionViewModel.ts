import { AddTransaction } from '../usecase/transactions/AddTransaction';
import { GetSession } from '../usecase/auth/GetSession';

export class AddTransactionViewModel {
  private addTransactionUseCase = new AddTransaction();
  private getSessionUseCase = new GetSession();

  async add(amount: string, description: string, type: 'income' | 'expense') {
    const session = await this.getSessionUseCase.execute();
    if (!session?.user) throw new Error('Usuário não autenticado');

    const value = parseFloat(amount);
    if (isNaN(value)) throw new Error('Valor inválido');

    await this.addTransactionUseCase.execute({
      user_id: session.user.id,
      amount: value,
      description,
      type,
    });
  }
}
