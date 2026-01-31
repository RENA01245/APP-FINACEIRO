import { Transaction } from '../../model/Transaction';
import { TransactionRepositorySupabase } from '../../infra/repositories/TransactionRepositorySupabase';

export class GetTransactionsByMonth {
  private repo: TransactionRepositorySupabase;

  constructor() {
    this.repo = new TransactionRepositorySupabase();
  }

  async execute(date: Date): Promise<Transaction[]> {
    return await this.repo.getByMonth(date);
  }
}
