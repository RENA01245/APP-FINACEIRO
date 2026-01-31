import { Transaction } from '../model/Transaction';
import { TransactionRepositorySupabase } from '../infra/repositories/TransactionRepositorySupabase';
import { DeleteTransaction } from '../usecase/transactions/DeleteTransaction';
import { GetTransactionsByMonth } from '../usecase/transactions/GetTransactionsByMonth';

export class HomeViewModel {
  private repo: TransactionRepositorySupabase;
  private deleteUseCase: DeleteTransaction;
  private getByMonthUseCase: GetTransactionsByMonth;
  
  public currentDate: Date;

  constructor() {
    this.repo = new TransactionRepositorySupabase();
    this.deleteUseCase = new DeleteTransaction();
    this.getByMonthUseCase = new GetTransactionsByMonth();
    this.currentDate = new Date();
  }

  async getTransactions(): Promise<Transaction[]> {
    return await this.getByMonthUseCase.execute(this.currentDate);
  }

  async nextMonth(): Promise<Transaction[]> {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + 1, 1);
    return await this.getTransactions();
  }

  async prevMonth(): Promise<Transaction[]> {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() - 1, 1);
    return await this.getTransactions();
  }

  getCurrentMonthLabel(): string {
    const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    return `${months[this.currentDate.getMonth()]} ${this.currentDate.getFullYear()}`;
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
