import { supabase } from '../supabase/client';
import { Transaction } from '../../model/Transaction';

export class TransactionRepositorySupabase {
  async add(transaction: Transaction): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .insert(transaction);

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

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
