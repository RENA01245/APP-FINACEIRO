
export interface CreditCard {
    id?: string;
    user_id: string;
    name: string;
    limit_amount: number;
    closing_day: number;
    due_day: number;
    color: string;
    created_at?: string;
}
