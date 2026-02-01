
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ViewStyle } from 'react-native';
import { Transaction } from '../../model/Transaction';
import { theme } from '../../design/theme';
import { Feather } from '@expo/vector-icons';
import { Card } from './Card';

interface TransactionListProps {
    transactions: Transaction[];
    onPressItem: (transaction: Transaction) => void;
    onDeleteItem: (id: string) => void;
    ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
    contentContainerStyle?: ViewStyle;
}

const getCategoryIcon = (category: string): keyof typeof Feather.glyphMap => {
    switch (category) {
        case 'Alimentação': return 'coffee';
        case 'Transporte': return 'truck';
        case 'Lazer': return 'headphones';
        case 'Contas': return 'file-text';
        case 'Saúde': return 'activity';
        case 'Moradia': return 'home';
        default: return 'shopping-bag';
    }
};

export function TransactionList({ transactions, onPressItem, onDeleteItem, ListHeaderComponent, contentContainerStyle }: TransactionListProps) {

    const renderItem = ({ item }: { item: Transaction }) => {
        const isExpense = item.type === 'expense';
        const amountColor = isExpense ? theme.colors.danger : theme.colors.secondary;
        const iconName = getCategoryIcon(item.category || '');

        return (
            <View style={styles.itemWrapper}>
                <TouchableOpacity
                    style={styles.itemContainer}
                    onPress={() => onPressItem(item)}
                    activeOpacity={0.7}
                >
                    <View style={[styles.iconContainer, { backgroundColor: isExpense ? '#FFEBEE' : '#E8F5E9' }]}>
                        <Feather name={iconName} size={20} color={amountColor} />
                    </View>

                    <View style={styles.details}>
                        <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                        <Text style={styles.category}>{item.category || 'Geral'}</Text>
                    </View>

                    <View style={styles.amountContainer}>
                        <Text style={[styles.amount, { color: amountColor }]}>
                            {isExpense ? '-' : '+'} R$ {Number(item.amount).toFixed(2)}
                        </Text>
                        <Text style={styles.date}>
                            {item.created_at ? new Date(item.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) : ''}
                        </Text>
                    </View>
                </TouchableOpacity>

                {/* Delete Action (could be swipeable in future, but keeping simple button for now) */}
                {item.id && (
                    <TouchableOpacity
                        style={styles.deleteButton}
                        onPress={() => onDeleteItem(item.id!)}
                    >
                        <Feather name="trash-2" size={18} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <FlatList
            data={transactions}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={renderItem}
            ListHeaderComponent={ListHeaderComponent}
            contentContainerStyle={[styles.listContent, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <Feather name="inbox" size={48} color={theme.colors.placeholder} />
                    <Text style={styles.emptyText}>Nenhuma transação neste mês</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 100,
    },
    itemWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        marginBottom: theme.spacing.sm,
        borderRadius: theme.borderRadius.md,
        ...theme.shadows.soft,
        marginHorizontal: 1, // prevent shadow clipping
    },
    itemContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: theme.spacing.md,
    },
    details: {
        flex: 1,
        marginRight: theme.spacing.sm,
    },
    description: {
        fontSize: theme.typography.sizes.md,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    category: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textSecondary,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: theme.typography.sizes.md,
        fontWeight: 'bold',
    },
    date: {
        fontSize: theme.typography.sizes.xs,
        color: theme.colors.textSecondary,
        marginTop: 2,
    },
    deleteButton: {
        padding: theme.spacing.md,
        borderLeftWidth: 1,
        borderLeftColor: theme.colors.border,
        height: '100%',
        justifyContent: 'center'
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 50,
    },
    emptyText: {
        marginTop: theme.spacing.md,
        color: theme.colors.textSecondary,
        fontSize: theme.typography.sizes.md,
    }
});
