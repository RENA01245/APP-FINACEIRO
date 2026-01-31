export interface Budget {
    id?: string;
    user_id: string;
    category: string;
    amount: number;
    month: string; // Format: 'YYYY-MM'
}
