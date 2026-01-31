export interface Payable {
  id?: string;
  user_id: string;
  description: string;
  amount: number;
  due_date: string; // ISO Date string
  status: 'pending' | 'paid';
  created_at?: string;
}
