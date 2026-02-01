
export interface Category {
    id?: string;
    name: string;
    icon: string;
    color: string;
    is_custom: boolean;
    user_id?: string;
}

export const DEFAULT_CATEGORIES: Category[] = [
    { name: 'Alimentação', icon: 'coffee', color: '#FF9800', is_custom: false },
    { name: 'Transporte', icon: 'truck', color: '#2196F3', is_custom: false },
    { name: 'Moradia', icon: 'home', color: '#4CAF50', is_custom: false },
    { name: 'Lazer', icon: 'grid', color: '#9C27B0', is_custom: false },
    { name: 'Saúde', icon: 'activity', color: '#F44336', is_custom: false },
    { name: 'Outros', icon: 'shopping-bag', color: '#607D8B', is_custom: false },
];
