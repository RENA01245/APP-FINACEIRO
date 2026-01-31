export interface Transaction {
  id?: string;
  user_id: string;
  amount: number;
  description: string;
  type: 'income' | 'expense';
  category?: string;
  created_at?: string;
}
