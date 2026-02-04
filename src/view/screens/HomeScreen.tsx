import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, StatusBar, ScrollView, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { AuthViewModel } from '../../viewmodel/AuthViewModel';
import { HomeViewModel } from '../../viewmodel/HomeViewModel';
import { BudgetViewModel } from '../../viewmodel/BudgetViewModel';
import { PayablesViewModel } from '../../viewmodel/PayablesViewModel';

import { Transaction } from '../../model/Transaction';
import { Payable } from '../../model/Payable';
import { DEFAULT_CATEGORIES } from '../../model/Category';
import { NotificationService } from '../../infra/notifications/NotificationService';

import { TransactionList } from '../components/TransactionList';
import { Card } from '../components/Card';
import { BudgetProgressBar } from '../components/BudgetProgressBar';
import { useAppTheme } from '../../design/ThemeContext';

export function HomeScreen() {
  const { theme, baseTheme, isDarkMode } = useAppTheme();
  const styles = createStyles(theme, baseTheme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, total: 0 });
  const [monthLabel, setMonthLabel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [authViewModel] = useState(() => new AuthViewModel());
  const [homeViewModel] = useState(() => new HomeViewModel());
  const [budgetViewModel] = useState(() => new BudgetViewModel());
  const [payablesViewModel] = useState(() => new PayablesViewModel());

  const [budgetStatus, setBudgetStatus] = useState<{ category: string, budget: number, spent: number }[]>([]);
  const [upcomingPayables, setUpcomingPayables] = useState<Payable[]>([]);
  const [cardSummaries, setCardSummaries] = useState<{ card: any, invoice: number }[]>([]);

  const loadData = async () => {
    try {
      await homeViewModel.checkRecurring();

      const monthStr = homeViewModel.currentDate.toISOString().slice(0, 7);
      const status = await budgetViewModel.getBudgetsStatus(monthStr);
      setBudgetStatus(status);

      const pending = await payablesViewModel.getPending();
      setUpcomingPayables(pending.slice(0, 2));

      pending.forEach(payable => {
        if (payable.id) {
          NotificationService.schedulePayableAlert(
            payable.id,
            payable.description,
            payable.amount,
            new Date(payable.due_date)
          );
        }
      });

      const data = await homeViewModel.getTransactions();
      setTransactions(data);
      setSummary(homeViewModel.calculateSummary(data));
      setMonthLabel(homeViewModel.getCurrentMonthLabel());

      const cards = await homeViewModel.getCardSummaries();
      setCardSummaries(cards);
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  React.useEffect(() => {
    NotificationService.requestPermissions();
  }, []);

  const handleNextMonth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await homeViewModel.nextMonth();
    loadData();
  };

  const handlePrevMonth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await homeViewModel.prevMonth();
    loadData();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Excluir Transação',
      'Tem certeza?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await homeViewModel.deleteTransaction(id);
              loadData();
            } catch (error: any) {
              Alert.alert('Erro', 'Não foi possível excluir.');
            }
          },
        },
      ]
    );
  };

  const filteredTransactions = transactions.filter(t => {
    const description = t.description?.toLowerCase() || '';
    const cat = t.category?.toLowerCase() || '';
    const query = searchQuery.toLowerCase();
    const matchesQuery = description.includes(query) || cat.includes(query);
    const matchesCategory = selectedCategory === '' || t.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <LinearGradient
        colors={theme.gradientPrimary}
        style={[styles.bgHeader, { height: 220 + insets.top }]}
      />

      <TransactionList
        transactions={filteredTransactions}
        onPressItem={(item) => navigation.navigate('AddTransaction', { transaction: item })}
        onDeleteItem={handleDelete}
        ListHeaderComponent={
          <View style={{ paddingTop: insets.top }}>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greetingText}>Olá,</Text>
                <Text style={styles.usernameText}>Bem-vindo de volta</Text>
              </View>
              <TouchableOpacity
                style={styles.logoutButton}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  navigation.navigate('Settings');
                }}
              >
                <Feather name="settings" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowArea}>
                <Feather name="chevron-left" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{monthLabel}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.arrowArea}>
                <Feather name="chevron-right" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            <Card style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Saldo atual</Text>
                <Feather name={summary.total >= 0 ? "trending-up" : "trending-down"} size={20} color={summary.total >= 0 ? theme.secondary : theme.danger} />
              </View>
              <Text style={[styles.balanceValue, { color: theme.textPrimary }]}>R$ {summary.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>

              <View style={styles.balanceRow}>
                <View style={{ flex: 1 }}>
                  <View style={styles.balanceRowLabel}>
                    <Feather name="arrow-up-circle" size={14} color={theme.secondary} />
                    <Text style={styles.miniLabel}> Receitas</Text>
                  </View>
                  <Text style={[styles.miniValue, { color: theme.secondary }]}>R$ {summary.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                </View>
                <View style={styles.separator} />
                <View style={{ flex: 1, paddingLeft: 20 }}>
                  <View style={styles.balanceRowLabel}>
                    <Feather name="arrow-down-circle" size={14} color={theme.danger} />
                    <Text style={styles.miniLabel}> Despesas</Text>
                  </View>
                  <Text style={[styles.miniValue, { color: theme.danger }]}>R$ {summary.expense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                </View>
              </View>
            </Card>

            <View style={styles.sectionContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Orçamentos</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Budgets')}>
                  <Text style={[styles.seeAll, { color: theme.primary }]}>Ver mais</Text>
                </TouchableOpacity>
              </View>
              {budgetStatus.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 10 }}>Nenhum orçamento definido.</Text>
              ) : (
                budgetStatus.slice(0, 3).map((item, index) => (
                  <View key={index} style={{ marginBottom: 15 }}>
                    <BudgetProgressBar
                      category={item.category}
                      budget={item.budget}
                      spent={item.spent}
                    />
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Próximas Contas</Text>
                <TouchableOpacity onPress={() => navigation.navigate('AppTabs', { screen: 'Payables' })}>
                  <Text style={[styles.seeAll, { color: theme.primary }]}>Ver todas</Text>
                </TouchableOpacity>
              </View>

              {upcomingPayables.length === 0 ? (
                <Text style={{ color: theme.textSecondary, fontSize: 13, textAlign: 'center', marginTop: 10 }}>Nenhuma conta pendente.</Text>
              ) : (
                upcomingPayables.map((item, index) => (
                  <View key={index} style={[styles.payableAlert, { backgroundColor: theme.surface }]}>
                    <Feather name="alert-circle" size={18} color={theme.danger} style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.payableAlertTitle, { color: theme.textPrimary }]}>{item.description}</Text>
                      <Text style={styles.payableAlertDate}>Vence: {new Date(item.due_date).toLocaleDateString('pt-BR')}</Text>
                    </View>
                    <Text style={[styles.payableAlertAmount, { color: theme.danger }]}>R$ {item.amount.toFixed(2)}</Text>
                  </View>
                ))
              )}
            </View>

            <View style={styles.sectionContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Meus Cartões</Text>
                <TouchableOpacity onPress={() => navigation.navigate('Cards')}>
                  <Text style={[styles.seeAll, { color: theme.primary }]}>Gerenciar</Text>
                </TouchableOpacity>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {cardSummaries.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[styles.cardInvoiceItem, { borderLeftColor: item.card.color, backgroundColor: theme.surface }]}
                    onPress={() => navigation.navigate('Cards')}
                  >
                    <Text style={styles.cardInvoiceName}>{item.card.name}</Text>
                    <Text style={[styles.cardInvoiceAmount, { color: theme.textPrimary }]}>R$ {item.invoice.toFixed(2)}</Text>
                    <View style={[styles.limitBarBackground, { backgroundColor: isDarkMode ? '#333' : '#EEE' }]}>
                      <View
                        style={[
                          styles.limitBarForeground,
                          {
                            backgroundColor: item.card.color,
                            width: `${Math.min((item.invoice / (item.card.limit_amount || 1)) * 100, 100)}%`
                          }
                        ]}
                      />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <View style={styles.filterSection}>
              <View style={[styles.searchBar, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Feather name="search" size={18} color={theme.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: theme.textPrimary }]}
                  placeholder="Pesquisar..."
                  placeholderTextColor={theme.placeholder}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Feather name="x" size={18} color={theme.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                <TouchableOpacity
                  style={[
                    styles.categoryChip,
                    { backgroundColor: theme.surface, borderColor: theme.border },
                    selectedCategory === '' && { backgroundColor: theme.primary, borderColor: theme.primary }
                  ]}
                  onPress={() => setSelectedCategory('')}
                >
                  <Text style={[
                    styles.categoryChipText,
                    { color: theme.textSecondary },
                    selectedCategory === '' && { color: '#FFF' }
                  ]}>Todas</Text>
                </TouchableOpacity>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[
                      styles.categoryChip,
                      { backgroundColor: theme.surface, borderColor: theme.border },
                      selectedCategory === cat.name && { backgroundColor: theme.primary, borderColor: theme.primary }
                    ]}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      { color: theme.textSecondary },
                      selectedCategory === cat.name && { color: '#FFF' }
                    ]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        contentContainerStyle={{
          padding: 20,
          paddingTop: 10,
          paddingBottom: 100 + insets.bottom
        }}
      />
    </View>
  );
}

function createStyles(theme: any, baseTheme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    bgHeader: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerTop: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 12,
      paddingHorizontal: 5
    },
    greetingText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
    usernameText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    logoutButton: { padding: 10, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },

    monthSelector: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 12
    },
    arrowArea: { padding: 10 },
    monthLabel: { color: '#FFF', fontSize: 18, fontWeight: '600', minWidth: 140, textAlign: 'center' },

    balanceCard: {
      marginBottom: 16,
      borderRadius: 20,
      padding: 16,
    },
    balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    balanceLabel: { color: theme.textSecondary, fontSize: 13 },
    balanceValue: { fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
    balanceRow: { flexDirection: 'row', justifyContent: 'space-between' },
    separator: { width: 1, backgroundColor: theme.border },
    balanceRowLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
    miniLabel: { fontSize: 12, color: theme.textSecondary },
    miniValue: { fontSize: 16, fontWeight: 'bold' },

    sectionContainer: { marginBottom: 20 },
    sectionTitle: { fontSize: 18, fontWeight: 'bold' },
    seeAll: { fontSize: 14, fontWeight: '600' },

    payableAlert: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 12,
      borderRadius: 12,
      borderLeftWidth: 4,
      borderLeftColor: '#FF5252',
      marginTop: 10,
      ...baseTheme.shadows.soft
    },
    payableAlertTitle: { fontWeight: '600' },
    payableAlertDate: { fontSize: 12, color: theme.textSecondary },
    payableAlertAmount: { fontWeight: 'bold' },

    cardInvoiceItem: {
      padding: 12,
      borderRadius: 16,
      marginRight: 15,
      minWidth: 160,
      borderLeftWidth: 4,
      ...baseTheme.shadows.soft,
      marginBottom: 5
    },
    cardInvoiceName: { fontSize: 12, color: theme.textSecondary, marginBottom: 2 },
    cardInvoiceAmount: { fontSize: 16, fontWeight: 'bold', marginBottom: 8 },
    limitBarBackground: { height: 4, borderRadius: 2, overflow: 'hidden' },
    limitBarForeground: { height: '100%' },
    filterSection: { marginTop: 15, marginBottom: 5 },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      borderRadius: 12,
      paddingHorizontal: 16,
      height: 48,
      ...baseTheme.shadows.soft,
      marginBottom: 12,
      borderWidth: 1,
    },
    searchInput: {
      flex: 1,
      marginLeft: 8,
      fontSize: 14,
    },
    categoriesScroll: {
      marginBottom: 5
    },
    categoryChip: {
      paddingHorizontal: 14,
      paddingVertical: 6,
      borderRadius: 18,
      marginRight: 8,
      borderWidth: 1,
      ...baseTheme.shadows.soft
    },
    categoryChipText: {
      fontSize: 12,
      fontWeight: '500'
    },
  });
}
