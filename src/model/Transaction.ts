export interface Transaction {
  id?: string;
  user_id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category?: string;
  isRecurring?: boolean;
  payment_method?: 'cash' | 'credit_card';
  card_id?: string;
  created_at?: string;
}
