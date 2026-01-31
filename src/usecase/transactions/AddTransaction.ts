import { TransactionRepositorySupabase } from '../../infra/repositories/TransactionRepositorySupabase';
import { Transaction } from '../../model/Transaction';

export class AddTransaction {
  private repo: TransactionRepositorySupabase;

  constructor() {
    this.repo = new TransactionRepositorySupabase();
  }

  async execute(transaction: Transaction) {
    if (!transaction.user_id) throw new Error('User ID required');
    if (!transaction.amount) throw new Error('Amount required');
    
    // Monthly limit check
    const currentCount = await this.repo.countByMonth(transaction.user_id, new Date());
    if (currentCount >= 200) {
      throw new Error('Limite mensal de 200 transações atingido.');
    }

    await this.repo.add(transaction);
  }
}
