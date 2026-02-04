
import React from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity, ViewStyle } from 'react-native';
import { Transaction } from '../../model/Transaction';
import { theme } from '../../design/theme';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { RectButton, Swipeable } from 'react-native-gesture-handler';
import Animated, { FadeInRight, FadeOutLeft } from 'react-native-reanimated';

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

const formatDateSection = (date: Date) => {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';

    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' });
};

const groupTransactions = (transactions: Transaction[]) => {
    const groups: { [key: string]: Transaction[] } = {};

    // Sort transactions by date descending
    const sorted = [...transactions].sort((a, b) => {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
        return dateB - dateA;
    });

    sorted.forEach(t => {
        const dateKey = t.created_at ? new Date(t.created_at).toDateString() : 'Sem Data';
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(t);
    });

    return Object.entries(groups).map(([date, data]) => ({
        title: date === 'Sem Data' ? 'Sem Data' : formatDateSection(new Date(date)),
        data
    }));
};

export function TransactionList({ transactions, onPressItem, onDeleteItem, ListHeaderComponent, contentContainerStyle }: TransactionListProps) {

    const renderRightActions = (id: string) => {
        return (
            <RectButton
                style={styles.deleteAction}
                onPress={() => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                    onDeleteItem(id);
                }}
            >
                <Feather name="trash-2" size={20} color="#FFF" />
            </RectButton>
        );
    };

    const renderLeftActions = (item: Transaction) => {
        return (
            <RectButton
                style={styles.editAction}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    onPressItem(item);
                }}
            >
                <Feather name="edit-2" size={20} color="#FFF" />
            </RectButton>
        );
    };

    const renderItem = ({ item }: { item: Transaction }) => {
        const isExpense = item.type === 'expense';
        const amountColor = isExpense ? theme.colors.danger : theme.colors.secondary;
        const iconName = getCategoryIcon(item.category || '');

        return (
            <Animated.View entering={FadeInRight} exiting={FadeOutLeft}>
                <Swipeable
                    renderRightActions={() => item.id ? renderRightActions(item.id) : null}
                    renderLeftActions={() => renderLeftActions(item)}
                    friction={2}
                    rightThreshold={40}
                    leftThreshold={40}
                    onSwipeableWillOpen={(direction) => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                >
                    <TouchableOpacity
                        style={styles.itemContainer}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            onPressItem(item);
                        }}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.iconContainer, { backgroundColor: isExpense ? '#FFF2F2' : '#F2FBF2' }]}>
                            <Feather name={iconName} size={16} color={amountColor} />
                        </View>

                        <View style={styles.details}>
                            <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                            <Text style={styles.category}>{item.category || 'Geral'}</Text>
                        </View>

                        <View style={styles.amountContainer}>
                            <Text style={[styles.amount, { color: amountColor }]}>
                                {isExpense ? '-' : '+'} R$ {Number(item.amount).toFixed(2)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </Swipeable>
            </Animated.View>
        );
    };

    const sections = groupTransactions(transactions);

    return (
        <SectionList
            sections={sections}
            keyExtractor={(item) => item.id || Math.random().toString()}
            renderItem={renderItem}
            renderSectionHeader={({ section: { title } }) => (
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionHeaderText}>{title}</Text>
                </View>
            )}
            ListHeaderComponent={ListHeaderComponent}
            contentContainerStyle={[styles.listContent, contentContainerStyle]}
            showsVerticalScrollIndicator={false}
            stickySectionHeadersEnabled={false}
            ListEmptyComponent={
                <View style={styles.emptyContainer}>
                    <View style={styles.emptyIconCircle}>
                        <Feather name="file-text" size={32} color={theme.colors.placeholder} />
                    </View>
                    <Text style={styles.emptyTitle}>Sem transações</Text>
                    <Text style={styles.emptySubtitle}>Seu extrato aparecerá aqui.</Text>
                </View>
            }
        />
    );
}

const styles = StyleSheet.create({
    listContent: {
        paddingBottom: 100,
    },
    sectionHeader: {
        paddingTop: 16,
        paddingBottom: 8,
        backgroundColor: 'transparent',
    },
    sectionHeaderText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    itemContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: theme.colors.surface,
        borderBottomWidth: 0.5,
        borderBottomColor: theme.colors.border + '40',
        borderRadius: 4, // Very subtle rounding for "integrated" look
    },
    iconContainer: {
        width: 36,
        height: 36,
        borderRadius: 12, // More Material 3 square-rounded
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    details: {
        flex: 1,
        marginRight: 8,
    },
    description: {
        fontSize: 14,
        fontWeight: '600',
        color: theme.colors.textPrimary,
        marginBottom: 2,
    },
    category: {
        fontSize: 12,
        color: theme.colors.textSecondary,
    },
    amountContainer: {
        alignItems: 'flex-end',
    },
    amount: {
        fontSize: 15,
        fontWeight: 'bold',
    },
    deleteAction: {
        backgroundColor: theme.colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: '100%',
    },
    editAction: {
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        width: 70,
        height: '100%',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 60,
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F8F9FA',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 4,
    },
    emptySubtitle: {
        color: theme.colors.textSecondary,
        fontSize: 14,
    }
});
