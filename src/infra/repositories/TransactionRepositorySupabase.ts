import { supabase } from '../supabase/client';
import { Transaction } from '../../model/Transaction';

export class TransactionRepositorySupabase {
  async add(transaction: Transaction): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .insert({
        user_id: transaction.user_id,
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        category: transaction.category,
        is_recurring: transaction.isRecurring || false
      });

    if (error) {
      throw new Error(error.message);
    }
  }

  async getAll(): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return data as Transaction[];
  }

  async getByMonth(date: Date): Promise<Transaction[]> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    return (data || []).map((item: any) => ({
      ...item,
      isRecurring: item.is_recurring
    })) as Transaction[];
  }

  async update(transaction: Transaction): Promise<void> {
    if (!transaction.id) throw new Error('Transaction ID required for update');

    const { error } = await supabase
      .from('transactions')
      .update({
        amount: transaction.amount,
        description: transaction.description,
        type: transaction.type,
        category: transaction.category
      })
      .eq('id', transaction.id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }

  async countByMonth(userId: string, date: Date): Promise<number> {
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1).toISOString();
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString();

    const { count, error } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('created_at', startOfMonth)
      .lte('created_at', endOfMonth);

    if (error) {
      throw new Error(error.message);
    }
    
    return count || 0;
  }

  async getRecurring(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_recurring', true)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }
    
    // Map database field to model
    return (data || []).map((item: any) => ({
      ...item,
      isRecurring: item.is_recurring
    })) as Transaction[];
  }
}
