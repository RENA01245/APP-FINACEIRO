import { TransactionRepositorySupabase } from '../../infra/repositories/TransactionRepositorySupabase';
import { Transaction } from '../../model/Transaction';

export class ProcessRecurringTransactions {
  private repo: TransactionRepositorySupabase;

  constructor() {
    this.repo = new TransactionRepositorySupabase();
  }

  async execute(userId: string): Promise<void> {
    // 1. Get all recurring transactions
    const recurring = await this.repo.getRecurring(userId);
    if (recurring.length === 0) return;

    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 2. Group by signature to identify unique recurring items
    // Signature: description + amount + type + category
    const groups: { [key: string]: Transaction[] } = {};

    recurring.forEach(t => {
      const signature = `${t.description}|${t.amount}|${t.type}|${t.category || ''}`;
      if (!groups[signature]) {
        groups[signature] = [];
      }
      groups[signature].push(t);
    });

    // 3. Process each group
    for (const signature in groups) {
      const transactions = groups[signature];
      // Sort by date desc (newest first)
      transactions.sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
      });

      const latest = transactions[0];
      if (!latest.created_at) continue;

      const latestDate = new Date(latest.created_at);
      
      // Check if the latest transaction is from a previous month
      // We compare the Year and Month
      const isPreviousMonth = 
        latestDate.getFullYear() < now.getFullYear() || 
        (latestDate.getFullYear() === now.getFullYear() && latestDate.getMonth() < now.getMonth());

      if (isPreviousMonth) {
        // It's from a previous month, so we need to generate one for this month
        // Double check if we haven't already generated one today/this month 
        // (Logic above covers it, because if we generated one, it would be the 'latest' and would be in current month)
        
        // Create new transaction
        const newTransaction: Transaction = {
          user_id: userId,
          amount: latest.amount,
          description: latest.description,
          type: latest.type,
          category: latest.category,
          isRecurring: true, // Keep it recurring
          // created_at will be set by Supabase to NOW
        };

        try {
            await this.repo.add(newTransaction);
            console.log(`Generated recurring transaction: ${latest.description}`);
        } catch (e) {
            console.error(`Error generating recurring transaction: ${e}`);
        }
      }
    }
  }
}
