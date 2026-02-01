
import { CategoryViewModel } from '../CategoryViewModel';
import { supabase } from '../../infra/supabase/client';
import { DEFAULT_CATEGORIES } from '../../model/Category';

// Mock Supabase client
jest.mock('../../infra/supabase/client', () => ({
    supabase: {
        from: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        insert: jest.fn().mockReturnThis(),
        delete: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn(),
    }
}));

// Mock GetSession use case
jest.mock('../../usecase/auth/GetSession', () => ({
    GetSession: jest.fn().mockImplementation(() => ({
        execute: jest.fn().mockResolvedValue({ user: { id: 'user-123' } })
    }))
}));

describe('CategoryViewModel', () => {
    let viewModel: CategoryViewModel;
    let mockSupabase: any;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSupabase = supabase;
        viewModel = new CategoryViewModel();
    });

    it('should return default categories if database is empty', async () => {
        mockSupabase.from().select.mockResolvedValue({ data: [], error: null });

        const categories = await viewModel.getCategories();

        expect(categories).toEqual(DEFAULT_CATEGORIES);
    });

    it('should merge default categories with user categories', async () => {
        const userCategories = [
            { id: '1', name: 'Streaming', icon: 'tv', color: '#800080', is_custom: true, user_id: 'user-123' }
        ];
        mockSupabase.from().select.mockResolvedValue({ data: userCategories, error: null });

        const categories = await viewModel.getCategories();

        expect(categories).toHaveLength(DEFAULT_CATEGORIES.length + 1);
        expect(categories[categories.length - 1]).toEqual(userCategories[0]);
    });

    it('should add a new category', async () => {
        const newCatInput = { name: 'Gym', icon: 'dumbbell', color: '#000' };
        const savedCat = { ...newCatInput, id: '2', is_custom: true, user_id: 'user-123' };

        // Mock insert response
        mockSupabase.from().insert().select().single.mockResolvedValue({ data: savedCat, error: null });

        const result = await viewModel.addCategory(newCatInput.name, newCatInput.icon, newCatInput.color);

        expect(result).toEqual(savedCat);
        expect(mockSupabase.from().insert).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Gym',
            is_custom: true,
            user_id: 'user-123'
        }));
    });

    it('should delete a category', async () => {
        mockSupabase.from().delete().eq.mockResolvedValue({ error: null });

        await viewModel.deleteCategory('cat-id-1');

        expect(mockSupabase.from().delete).toHaveBeenCalled();
        expect(mockSupabase.from().eq).toHaveBeenCalledWith('id', 'cat-id-1');
    });
});
