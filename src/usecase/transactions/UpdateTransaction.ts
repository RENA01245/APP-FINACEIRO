import { Transaction } from '../../model/Transaction';
import { TransactionRepositorySupabase } from '../../infra/repositories/TransactionRepositorySupabase';

export class UpdateTransaction {
  private repo: TransactionRepositorySupabase;

  constructor() {
    this.repo = new TransactionRepositorySupabase();
  }

  async execute(transaction: Transaction) {
    if (!transaction.id) throw new Error('Transaction ID required');
    if (!transaction.user_id) throw new Error('User ID required');
    if (!transaction.amount) throw new Error('Amount required');
    
    await this.repo.update(transaction);
  }
}
