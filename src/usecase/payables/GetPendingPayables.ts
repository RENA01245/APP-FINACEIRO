import { PayableRepositorySupabase } from '../../infra/repositories/PayableRepositorySupabase';
import { Payable } from '../../model/Payable';

export class GetPendingPayables {
  private repo: PayableRepositorySupabase;

  constructor() {
    this.repo = new PayableRepositorySupabase();
  }

  async execute(userId: string): Promise<Payable[]> {
    return await this.repo.getPending(userId);
  }
}
