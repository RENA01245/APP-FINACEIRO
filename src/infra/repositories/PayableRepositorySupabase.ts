import { supabase } from '../supabase/client';
import { Payable } from '../../model/Payable';
import { Transaction } from '../../model/Transaction';

export class PayableRepositorySupabase {
  async add(payable: Payable): Promise<Payable> {
    const { data, error } = await supabase
      .from('payables')
      .insert({
        user_id: payable.user_id,
        description: payable.description,
        amount: payable.amount,
        due_date: payable.due_date,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }
    return data as Payable;
  }

  async getPending(userId: string): Promise<Payable[]> {
    const { data, error } = await supabase
      .from('payables')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending')
      .order('due_date', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }
    return data as Payable[];
  }

  async markAsPaid(payableId: string, transaction: Transaction): Promise<void> {
    // 1. Start a transaction (conceptual, Supabase doesn't support multi-table transactions via client directly without stored procedures, so we do sequentially with error handling)
    
    // A. Update Payable Status
    const { error: updateError } = await supabase
      .from('payables')
      .update({ status: 'paid' })
      .eq('id', payableId);

    if (updateError) throw new Error(updateError.message);

    // B. Create Expense Transaction
    const { error: insertError } = await supabase
      .from('transactions')
      .insert({
        user_id: transaction.user_id,
        amount: transaction.amount,
        description: transaction.description,
        type: 'expense',
        category: transaction.category,
        created_at: transaction.created_at || new Date().toISOString()
      });

    if (insertError) {
      // Rollback (revert payable status)
      await supabase
        .from('payables')
        .update({ status: 'pending' })
        .eq('id', payableId);
      throw new Error(insertError.message);
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('payables')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }
  }
}
