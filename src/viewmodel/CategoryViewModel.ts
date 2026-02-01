
import { supabase } from '../infra/supabase/client';
import { GetSession } from '../usecase/auth/GetSession';
import { Category, DEFAULT_CATEGORIES } from '../model/Category';

export class CategoryViewModel {
    private getSessionUseCase: GetSession;

    constructor() {
        this.getSessionUseCase = new GetSession();
    }

    async getCategories(): Promise<Category[]> {
        const { data, error } = await supabase
            .from('categories')
            .select('*');

        if (error) {
            console.error('Error fetching categories:', error);
            return DEFAULT_CATEGORIES;
        }

        if (!data || data.length === 0) {
            return DEFAULT_CATEGORIES;
        }

        const userCategories: Category[] = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            icon: item.icon,
            color: item.color,
            is_custom: item.is_custom,
            user_id: item.user_id
        }));

        return [...DEFAULT_CATEGORIES, ...userCategories];
    }

    async addCategory(name: string, icon: string, color: string): Promise<Category | null> {
        const session = await this.getSessionUseCase.execute();
        if (!session?.user) throw new Error('User not authenticated');

        const newCategory = {
            name,
            icon,
            color,
            is_custom: true,
            user_id: session.user.id
        };

        const { data, error } = await supabase
            .from('categories')
            .insert(newCategory)
            .select()
            .single();

        if (error) {
            throw new Error(error.message);
        }

        return {
            id: data.id,
            name: data.name,
            icon: data.icon,
            color: data.color,
            is_custom: data.is_custom,
            user_id: data.user_id
        };
    }

    async deleteCategory(id: string): Promise<void> {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) {
            throw new Error(error.message);
        }
    }
}
