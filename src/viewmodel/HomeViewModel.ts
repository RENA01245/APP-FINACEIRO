import { Transaction } from '../model/Transaction';
import { TransactionRepositorySupabase } from '../infra/repositories/TransactionRepositorySupabase';
import { DeleteTransaction } from '../usecase/transactions/DeleteTransaction';
import { GetTransactionsByMonth } from '../usecase/transactions/GetTransactionsByMonth';
import { ProcessRecurringTransactions } from '../usecase/transactions/ProcessRecurringTransactions';
import { GetSession } from '../usecase/auth/GetSession';
import { CardViewModel } from './CardViewModel';
import { CreditCard } from '../model/CreditCard';

export class HomeViewModel {
  private repo: TransactionRepositorySupabase;
  private deleteUseCase: DeleteTransaction;
  private getByMonthUseCase: GetTransactionsByMonth;
  private processRecurringUseCase: ProcessRecurringTransactions;
  private getSessionUseCase: GetSession;
  private cardViewModel: CardViewModel;

  public currentDate: Date;

  constructor() {
    this.repo = new TransactionRepositorySupabase();
    this.deleteUseCase = new DeleteTransaction();
    this.getByMonthUseCase = new GetTransactionsByMonth();
    this.processRecurringUseCase = new ProcessRecurringTransactions();
    this.getSessionUseCase = new GetSession();
    this.cardViewModel = new CardViewModel();
    this.currentDate = new Date();
  }

  async checkRecurring() {
    try {
      const session = await this.getSessionUseCase.execute();
      if (session?.user) {
        await this.processRecurringUseCase.execute(session.user.id);
      }
    } catch (e) {
      console.error('Error processing recurring transactions:', e);
    }
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

  async getCardSummaries(): Promise<{ card: CreditCard, invoice: number }[]> {
    const cards = await this.cardViewModel.getCards();
    const summaries = await Promise.all(cards.map(async (card) => {
      const invoice = await this.cardViewModel.getCardInvoice(card.id!, this.currentDate);
      return { card, invoice };
    }));
    return summaries;
  }
}
