
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, StatusBar } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';

import { theme } from '../../design/theme';
import { BudgetViewModel } from '../../viewmodel/BudgetViewModel';
import { BudgetProgressBar } from '../components/BudgetProgressBar';

export function BudgetsScreen() {
    const [viewModel] = useState(() => new BudgetViewModel());
    const [budgetStatus, setBudgetStatus] = useState<{ category: string, budget: number, spent: number }[]>([]);
    const [loading, setLoading] = useState(false);

    // We can use the current date or add a selector. For now, current month.
    const monthStr = new Date().toISOString().slice(0, 7);

    const loadBudgets = async () => {
        try {
            setLoading(true);
            const status = await viewModel.getBudgetsStatus(monthStr);
            setBudgetStatus(status);
        } catch (e: any) {
            console.log(e);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadBudgets();
        }, [])
    );

    const saveBudget = async (category: string, amount: string) => {
        try {
            // Remove non-numeric chars except dot
            const numericAmount = amount.replace(',', '.');
            await viewModel.setBudget(category, numericAmount, monthStr);
            loadBudgets();
        } catch (e: any) {
            Alert.alert('Erro', e.message);
        }
    };

    const categories = ['Alimentação', 'Transporte', 'Lazer', 'Contas', 'Saúde', 'Outros'];

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
                <View style={styles.headerTop}>
                    <Text style={styles.headerTitle}>Metas de Orçamento</Text>
                    <View style={{ width: 24 }} />
                </View>
                <Text style={styles.monthText}>Orçamento Mensal</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Definir Limites</Text>
                    <Text style={styles.cardSubtitle}>Toque no valor para editar</Text>

                    {categories.map((cat, index) => {
                        const budgetItem = budgetStatus.find(b => b.category === cat) || { category: cat, budget: 0, spent: 0 };
                        return (
                            <View key={index} style={styles.row}>
                                <View style={{ flex: 1 }}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={[styles.dot, { backgroundColor: theme.colors.primary }]} />
                                        <Text style={styles.categoryName}>{cat}</Text>
                                    </View>
                                    <View style={styles.progressContainer}>
                                        <BudgetProgressBar
                                            category="" // We render custom below, so just verify visual
                                            budget={budgetItem.budget}
                                            spent={budgetItem.spent}
                                            showLabel={false}
                                        />
                                    </View>
                                </View>

                                <View style={styles.inputContainer}>
                                    <Text style={styles.currency}>R$</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="0.00"
                                        keyboardType="numeric"
                                        defaultValue={budgetItem.budget > 0 ? budgetItem.budget.toString() : ''}
                                        onEndEditing={(e) => saveBudget(cat, e.nativeEvent.text)}
                                    />
                                </View>
                            </View>
                        );
                    })}
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        paddingTop: 50,
        paddingBottom: 25,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
    monthText: { textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontSize: 14 },

    content: { padding: 20 },
    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 20,
        ...theme.shadows.default
    },
    cardTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 5 },
    cardSubtitle: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 20 },

    row: { marginBottom: 20 },
    categoryName: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 5 },
    dot: { width: 8, height: 8, borderRadius: 4, marginRight: 8 },

    progressContainer: { marginTop: 5 },

    inputContainer: {
        position: 'absolute',
        right: 0,
        top: 0,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
        paddingHorizontal: 10,
        paddingVertical: 5,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border
    },
    currency: { color: theme.colors.textSecondary, marginRight: 4, fontSize: 12 },
    input: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary, minWidth: 50, textAlign: 'right' }
});
