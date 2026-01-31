import { Transaction } from '../model/Transaction';
import { TransactionRepositorySupabase } from '../infra/repositories/TransactionRepositorySupabase';
import { DeleteTransaction } from '../usecase/transactions/DeleteTransaction';

export class HomeViewModel {
  private repo: TransactionRepositorySupabase;
  private deleteUseCase: DeleteTransaction;

  constructor() {
    this.repo = new TransactionRepositorySupabase();
    this.deleteUseCase = new DeleteTransaction();
  }

  async getTransactions(): Promise<Transaction[]> {
    return await this.repo.getAll();
  }

  async deleteTransaction(id: string) {
    await this.deleteUseCase.execute(id);
  }

  calculateSummary(transactions: Transaction[]) {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') {
        income += t.amount;
      } else {
        expense += t.amount;
      }
    });

    return {
      income,
      expense,
      total: income - expense
    };
  }
}
