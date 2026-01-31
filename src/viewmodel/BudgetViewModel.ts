import { Budget } from '../model/Budget';
import { BudgetRepositorySupabase } from '../infra/repositories/BudgetRepositorySupabase';
import { TransactionRepositorySupabase } from '../infra/repositories/TransactionRepositorySupabase';
import { supabase } from '../infra/supabase/client';

export class BudgetViewModel {
    private budgetRepo = new BudgetRepositorySupabase();
    private transactionRepo = new TransactionRepositorySupabase();

    async setBudget(category: string, amount: string, month: string): Promise<void> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Usuário não autenticado');

        const numAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(numAmount) || numAmount <= 0) {
            throw new Error('Valor inválido');
        }

        const budget: Budget = {
            user_id: user.id,
            category,
            amount: numAmount,
            month
        };

        await this.budgetRepo.setBudget(budget);
    }

    async getBudgetsStatus(month: string): Promise<{ category: string; budget: number; spent: number }[]> {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        const budgets = await this.budgetRepo.getBudgets(user.id, month);
        
        const [year, monthNum] = month.split('-').map(Number);
        const dateObj = new Date(year, monthNum - 1, 1);
        const transactions = await this.transactionRepo.getByMonth(dateObj);

        // Map budgets and calculate spent
        const status = budgets.map(b => {
            const spent = transactions
                .filter(t => t.category === b.category && t.type === 'expense')
                .reduce((sum, t) => sum + t.amount, 0);
            
            return {
                category: b.category,
                budget: b.amount,
                spent
            };
        });

        return status;
    }
}
