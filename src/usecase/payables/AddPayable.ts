import { PayableRepositorySupabase } from '../../infra/repositories/PayableRepositorySupabase';
import { Payable } from '../../model/Payable';

export class AddPayable {
  private repo: PayableRepositorySupabase;

  constructor() {
    this.repo = new PayableRepositorySupabase();
  }

  async execute(payable: Payable) {
    if (!payable.user_id) throw new Error('User ID required');
    if (!payable.amount) throw new Error('Amount required');
    if (!payable.due_date) throw new Error('Due date required');

    const createdPayable = await this.repo.add(payable);
    return createdPayable;
  }
}
