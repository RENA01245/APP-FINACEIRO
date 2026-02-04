import { Transaction } from '../model/Transaction';
import { GetTransactionsByMonth } from '../usecase/transactions/GetTransactionsByMonth';

export class ReportsViewModel {
  private getByMonthUseCase: GetTransactionsByMonth;
  public currentDate: Date;

  constructor() {
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

  getExpensesByCategory(transactions: Transaction[]) {
    const expenses = transactions.filter(t => t.type === 'expense');
    const byCategory: { [key: string]: number } = {};

    expenses.forEach(t => {
      const cat = t.category || 'Outros';
      byCategory[cat] = (byCategory[cat] || 0) + t.amount;
    });

    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40',
      '#E7E9ED', '#71B37C', '#E67E22', '#F1C40F'
    ];

    return Object.keys(byCategory).map((key, index) => ({
      name: key,
      amount: byCategory[key],
      color: colors[index % colors.length],
      legendFontColor: '#7F7F7F',
      legendFontSize: 12
    })).sort((a, b) => b.amount - a.amount);
  }

  getBalanceData(transactions: Transaction[]) {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });

    return {
      labels: ["Receitas", "Despesas"],
      datasets: [
        {
          data: [income, expense]
        }
      ]
    };
  }
}
