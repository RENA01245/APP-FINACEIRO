import { TransactionRepositorySupabase } from '../../infra/repositories/TransactionRepositorySupabase';

export class DeleteTransaction {
  private repo: TransactionRepositorySupabase;

  constructor() {
    this.repo = new TransactionRepositorySupabase();
  }

  async execute(id: string) {
    if (!id) throw new Error('Transaction ID required');
    await this.repo.delete(id);
  }
}
