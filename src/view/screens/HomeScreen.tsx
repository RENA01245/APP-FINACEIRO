
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

import { theme } from '../../design/theme';
import { TransactionList } from '../components/TransactionList';
import { Card } from '../components/Card';
import { BudgetProgressBar } from '../components/BudgetProgressBar';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, total: 0 });
  const [monthLabel, setMonthLabel] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const authViewModel = new AuthViewModel();
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

      // Schedule notifications for all pending payables
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
      <StatusBar barStyle="light-content" />

      {/* Background Gradient Header */}
      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.bgHeader} />

      <TransactionList
        transactions={filteredTransactions}
        onPressItem={(item) => navigation.navigate('AddTransaction', { transaction: item })}
        onDeleteItem={handleDelete}
        ListHeaderComponent={
          <View>
            <View style={styles.headerTop}>
              <View>
                <Text style={styles.greetingText}>Olá,</Text>
                <Text style={styles.usernameText}>Bem-vindo de volta</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                  authViewModel.logout();
                }}
                style={styles.logoutButton}
              >
                <Feather name="log-out" size={20} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Month Selector */}
            <View style={styles.monthSelector}>
              <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowArea}>
                <Feather name="chevron-left" size={24} color="#FFF" />
              </TouchableOpacity>
              <Text style={styles.monthLabel}>{monthLabel}</Text>
              <TouchableOpacity onPress={handleNextMonth} style={styles.arrowArea}>
                <Feather name="chevron-right" size={24} color="#FFF" />
              </TouchableOpacity>
            </View>

            {/* Balance Card */}
            <Card style={styles.balanceCard}>
              <View style={styles.balanceHeader}>
                <Text style={styles.balanceLabel}>Saldo Atual</Text>
                <Feather name={summary.total >= 0 ? "trending-up" : "trending-down"} size={20} color={summary.total >= 0 ? theme.colors.secondary : theme.colors.danger} />
              </View>
              <Text style={styles.balanceValue}>R$ {summary.total.toFixed(2)}</Text>

              <View style={styles.balanceRow}>
                <View>
                  <View style={styles.balanceRowLabel}>
                    <Feather name="arrow-up-circle" size={14} color={theme.colors.secondary} />
                    <Text style={styles.miniLabel}> Receitas</Text>
                  </View>
                  <Text style={[styles.miniValue, { color: theme.colors.secondary }]}>R$ {summary.income.toFixed(2)}</Text>
                </View>
                <View style={styles.separator} />
                <View>
                  <View style={styles.balanceRowLabel}>
                    <Feather name="arrow-down-circle" size={14} color={theme.colors.danger} />
                    <Text style={styles.miniLabel}> Despesas</Text>
                  </View>
                  <Text style={[styles.miniValue, { color: theme.colors.danger }]}>R$ {summary.expense.toFixed(2)}</Text>
                </View>
              </View>
            </Card>

            {/* Credit Card Section */}
            {cardSummaries.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={styles.sectionTitle}>Faturas do Cartão</Text>
                  <TouchableOpacity onPress={() => {
                    Haptics.selectionAsync();
                    navigation.navigate('Cards');
                  }}>
                    <Text style={styles.seeAll}>Gerenciar</Text>
                  </TouchableOpacity>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                  {cardSummaries.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[styles.cardInvoiceItem, { borderLeftColor: item.card.color }]}
                      onPress={() => navigation.navigate('Cards')}
                    >
                      <Text style={styles.cardInvoiceName}>{item.card.name}</Text>
                      <Text style={styles.cardInvoiceAmount}>R$ {item.invoice.toFixed(2)}</Text>
                      <View style={styles.limitBarBackground}>
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
            )}

            {/* Notifications / Payables Preview */}
            {upcomingPayables.length > 0 && (
              <View style={styles.sectionContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.sectionTitle}>Próximas Contas</Text>
                  <TouchableOpacity onPress={() => {
                    Haptics.selectionAsync();
                    navigation.navigate('Contas');
                  }}>
                    <Text style={styles.seeAll}>Ver todas</Text>
                  </TouchableOpacity>
                </View>

                {upcomingPayables.map((item, index) => (
                  <View key={index} style={styles.payableAlert}>
                    <Feather name="alert-circle" size={18} color={theme.colors.danger} style={{ marginRight: 8 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.payableAlertTitle}>{item.description}</Text>
                      <Text style={styles.payableAlertDate}>Vence: {new Date(item.due_date).toLocaleDateString('pt-BR')}</Text>
                    </View>
                    <Text style={[styles.payableAlertAmount, { color: theme.colors.danger }]}>R$ {item.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}

            {budgetStatus.some(b => b.budget > 0) && (
              <View style={styles.sectionContainer}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <Text style={styles.sectionTitle}>Orçamentos</Text>
                </View>

                {budgetStatus.filter(b => b.budget > 0).slice(0, 3).map((item, index) => (
                  <BudgetProgressBar
                    key={index}
                    category={item.category}
                    budget={item.budget}
                    spent={item.spent}
                  />
                ))}
              </View>
            )}

            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Transações</Text>

            {/* Search and Filters */}
            <View style={styles.filterSection}>
              <View style={styles.searchBar}>
                <Feather name="search" size={16} color={theme.colors.textSecondary} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor={theme.colors.placeholder}
                />
                {searchQuery !== '' && (
                  <TouchableOpacity onPress={() => setSearchQuery('')}>
                    <Feather name="x" size={16} color={theme.colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesScroll}>
                <TouchableOpacity
                  style={[styles.categoryChip, selectedCategory === '' && styles.categoryChipSelected]}
                  onPress={() => setSelectedCategory('')}
                >
                  <Text style={[styles.categoryChipText, selectedCategory === '' && styles.categoryChipTextSelected]}>Todas</Text>
                </TouchableOpacity>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.name}
                    style={[styles.categoryChip, selectedCategory === cat.name && styles.categoryChipSelected]}
                    onPress={() => setSelectedCategory(cat.name)}
                  >
                    <Text style={[styles.categoryChipText, selectedCategory === cat.name && styles.categoryChipTextSelected]}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        }
        contentContainerStyle={{ padding: 20, paddingTop: insets.top + 10, paddingBottom: 100 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  bgHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 250,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  greetingText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  usernameText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  logoutButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },

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
    ...theme.shadows.default
  },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  balanceLabel: { color: theme.colors.textSecondary, fontSize: 13 },
  balanceValue: { color: theme.colors.textPrimary, fontSize: 28, fontWeight: 'bold', marginBottom: 12 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  separator: { width: 1, backgroundColor: theme.colors.border },
  balanceRowLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  miniLabel: { fontSize: 12, color: theme.colors.textSecondary },
  miniValue: { fontSize: 16, fontWeight: 'bold' },

  sectionContainer: { marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.colors.textPrimary },
  seeAll: { color: theme.colors.primary, fontSize: 14, fontWeight: '600' },

  payableAlert: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.danger,
    marginTop: 10,
    ...theme.shadows.soft
  },
  payableAlertTitle: { fontWeight: '600', color: theme.colors.textPrimary },
  payableAlertDate: { fontSize: 12, color: theme.colors.textSecondary },
  payableAlertAmount: { fontWeight: 'bold' },

  cardInvoiceItem: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 16,
    marginRight: 15,
    minWidth: 160,
    borderLeftWidth: 4,
    ...theme.shadows.soft,
    marginBottom: 5
  },
  cardInvoiceName: { fontSize: 12, color: theme.colors.textSecondary, marginBottom: 2 },
  cardInvoiceAmount: { fontSize: 16, fontWeight: 'bold', color: theme.colors.textPrimary, marginBottom: 8 },
  limitBarBackground: { height: 4, backgroundColor: theme.colors.border, borderRadius: 2, overflow: 'hidden' },
  limitBarForeground: { height: '100%' },
  filterSection: { marginTop: 15, marginBottom: 5 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    ...theme.shadows.soft,
    marginBottom: 10
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: theme.colors.textPrimary
  },
  categoriesScroll: {
    marginBottom: 5
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: '#FFF',
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.colors.border,
    ...theme.shadows.soft
  },
  categoryChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryChipText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500'
  },
  categoryChipTextSelected: {
    color: '#FFF'
  }
});
