import { supabase } from '../supabase/client';
import { Budget } from '../../model/Budget';

export class BudgetRepositorySupabase {
    async setBudget(budget: Budget): Promise<void> {
        // Upsert logic (insert or update on conflict)
        const { error } = await supabase
            .from('budgets')
            .upsert({
                user_id: budget.user_id,
                category: budget.category,
                month: budget.month,
                amount: budget.amount
            }, { onConflict: 'user_id, category, month' });

        if (error) {
            throw new Error(error.message);
        }
    }

    async getBudgets(userId: string, month: string): Promise<Budget[]> {
        const { data, error } = await supabase
            .from('budgets')
            .select('*')
            .eq('user_id', userId)
            .eq('month', month);

        if (error) {
            throw new Error(error.message);
        }
        return data as Budget[];
    }
}
