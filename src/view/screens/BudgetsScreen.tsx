import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, Alert, StatusBar } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { BudgetViewModel } from '../../viewmodel/BudgetViewModel';
import { BudgetProgressBar } from '../components/BudgetProgressBar';
import { useAppTheme } from '../../design/ThemeContext';

export function BudgetsScreen() {
    const { theme, baseTheme } = useAppTheme();
    const styles = createStyles(theme, baseTheme);
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const [viewModel] = useState(() => new BudgetViewModel());
    const [budgetStatus, setBudgetStatus] = useState<{ category: string, budget: number, spent: number }[]>([]);
    const [loading, setLoading] = useState(false);

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
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
            <LinearGradient colors={theme.gradientPrimary} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            navigation.goBack();
                        }}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={20} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Orçamentos</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.monthText}>Ajuste suas metas mensais</Text>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={[styles.card, { backgroundColor: theme.surface }]}>
                    <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Definir Limites</Text>
                    <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>Toque no valor para editar</Text>

                    {categories.map((cat, index) => {
                        const budgetItem = budgetStatus.find(b => b.category === cat) || { category: cat, budget: 0, spent: 0 };
                        return (
                            <View key={index} style={[styles.row, { borderBottomColor: theme.border + '30' }, index === categories.length - 1 && { borderBottomWidth: 0, marginBottom: 0 }]}>
                                <View style={styles.categoryContainer}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <View style={[styles.dot, { backgroundColor: theme.primary }]} />
                                        <Text style={[styles.categoryName, { color: theme.textPrimary }]}>{cat}</Text>
                                    </View>

                                    <View style={[styles.inputContainer, { backgroundColor: theme.background, borderColor: theme.border + '80' }]}>
                                        <Text style={[styles.currency, { color: theme.textSecondary }]}>R$</Text>
                                        <TextInput
                                            style={[styles.input, { color: theme.textPrimary }]}
                                            placeholder="0.00"
                                            placeholderTextColor={theme.placeholder}
                                            keyboardType="numeric"
                                            defaultValue={budgetItem.budget > 0 ? budgetItem.budget.toString() : ''}
                                            onEndEditing={(e) => saveBudget(cat, e.nativeEvent.text)}
                                        />
                                    </View>
                                </View>

                                <View style={styles.progressContainer}>
                                    <BudgetProgressBar
                                        category=""
                                        budget={budgetItem.budget}
                                        spent={budgetItem.spent}
                                        showLabel={false}
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

function createStyles(theme: any, baseTheme: any) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        header: {
            paddingBottom: 25,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
        },
        headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
        backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
        headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
        monthText: { textAlign: 'center', color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 4 },

        content: { paddingBottom: 40 },
        card: {
            borderRadius: 20,
            padding: 24,
            marginHorizontal: 20,
            marginTop: 20,
            ...baseTheme.shadows.soft
        },
        cardTitle: { fontSize: 18, fontWeight: '700', marginBottom: 4 },
        cardSubtitle: { fontSize: 13, marginBottom: 24 },

        row: { marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1 },
        categoryContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
        categoryName: { fontSize: 16, fontWeight: '600' },
        dot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },

        progressContainer: { marginTop: 4 },

        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 12,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1.5,
        },
        currency: { marginRight: 4, fontSize: 13, fontWeight: '600' },
        input: { fontSize: 15, fontWeight: 'bold', minWidth: 60, textAlign: 'right' }
    });
}
