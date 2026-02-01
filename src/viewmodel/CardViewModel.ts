
import { supabase } from '../infra/supabase/client';
import { GetSession } from '../usecase/auth/GetSession';
import { CreditCard } from '../model/CreditCard';
import { Transaction } from '../model/Transaction';

export class CardViewModel {
    private getSessionUseCase: GetSession;

    constructor() {
        this.getSessionUseCase = new GetSession();
    }

    async getCards(): Promise<CreditCard[]> {
        const { data, error } = await supabase
            .from('credit_cards')
            .select('*')
            .order('name');

        if (error) {
            console.error('Error fetching cards:', error);
            return [];
        }

        return data || [];
    }

    async addCard(name: string, limit: number, closingDay: number, dueDay: number, color: string): Promise<CreditCard | null> {
        const session = await this.getSessionUseCase.execute();
        if (!session?.user) throw new Error('User not authenticated');

        const newCard = {
            name,
            limit_amount: limit,
            closing_day: closingDay,
            due_day: dueDay,
            color,
            user_id: session.user.id
        };

        const { data, error } = await supabase
            .from('credit_cards')
            .insert(newCard)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return data;
    }

    async deleteCard(id: string): Promise<void> {
        const { error } = await supabase
            .from('credit_cards')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }
    }

    async getCardInvoice(cardId: string, month: Date): Promise<number> {
        // Logic to calculate invoice:
        // Transactions where card_id = cardId and falls within the billing cycle
        // For simplicity, let's filter by month for now. 
        // Real billing cycle logic would use the closing_day.

        const startOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).toISOString();
        const endOfMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0, 23, 59, 59).toISOString();

        const { data, error } = await supabase
            .from('transactions')
            .select('amount')
            .eq('card_id', cardId)
            .eq('payment_method', 'credit_card')
            .gte('created_at', startOfMonth)
            .lte('created_at', endOfMonth);

        if (error) {
            console.error('Error calculating invoice:', error);
            return 0;
        }

        return data?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
    }
}
