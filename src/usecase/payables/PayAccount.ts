import { PayableRepositorySupabase } from '../../infra/repositories/PayableRepositorySupabase';

export class PayAccount {
  private repo: PayableRepositorySupabase;

  constructor() {
    this.repo = new PayableRepositorySupabase();
  }

  async execute(payableId: string, userId: string, amount: number, description: string, category: string) {
    await this.repo.markAsPaid(payableId, {
      user_id: userId,
      amount,
      description,
      type: 'expense',
      category
    });
  }
}
