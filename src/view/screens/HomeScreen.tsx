
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, TouchableOpacity, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { AuthViewModel } from '../../viewmodel/AuthViewModel';
import { HomeViewModel } from '../../viewmodel/HomeViewModel';
import { BudgetViewModel } from '../../viewmodel/BudgetViewModel';
import { PayablesViewModel } from '../../viewmodel/PayablesViewModel';

import { Transaction } from '../../model/Transaction';
import { Payable } from '../../model/Payable';

import { theme } from '../../design/theme';
import { TransactionList } from '../components/TransactionList';
import { Card } from '../components/Card';
import { BudgetProgressBar } from '../components/BudgetProgressBar';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, total: 0 });
  const [monthLabel, setMonthLabel] = useState('');

  const authViewModel = new AuthViewModel();
  const [homeViewModel] = useState(() => new HomeViewModel());
  const [budgetViewModel] = useState(() => new BudgetViewModel());
  const [payablesViewModel] = useState(() => new PayablesViewModel());

  const [budgetStatus, setBudgetStatus] = useState<{ category: string, budget: number, spent: number }[]>([]);
  const [upcomingPayables, setUpcomingPayables] = useState<Payable[]>([]);

  const loadData = async () => {
    try {
      await homeViewModel.checkRecurring();

      const monthStr = homeViewModel.currentDate.toISOString().slice(0, 7);
      const status = await budgetViewModel.getBudgetsStatus(monthStr);
      setBudgetStatus(status);

      const pending = await payablesViewModel.getPending();
      setUpcomingPayables(pending.slice(0, 2));

      const data = await homeViewModel.getTransactions();
      setTransactions(data);
      setSummary(homeViewModel.calculateSummary(data));
      setMonthLabel(homeViewModel.getCurrentMonthLabel());
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleNextMonth = async () => {
    await homeViewModel.nextMonth();
    loadData();
  };

  const handlePrevMonth = async () => {
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

  const Header = () => (
    <View>
      <View style={styles.headerTop}>
        <View>
          <Text style={styles.greetingText}>Olá,</Text>
          <Text style={styles.usernameText}>Bem-vindo de volta</Text>
        </View>
        <TouchableOpacity onPress={() => authViewModel.logout()} style={styles.logoutButton}>
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

      {/* Notifications / Payables Preview */}
      {upcomingPayables.length > 0 && (
        <View style={styles.sectionContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={styles.sectionTitle}>Próximas Contas</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Contas')}>
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

      <Text style={styles.sectionTitle}>Todas as Transações</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Background Gradient Header */}
      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.bgHeader} />

      <TransactionList
        transactions={transactions}
        onPressItem={(item) => navigation.navigate('AddTransaction', { transaction: item })}
        onDeleteItem={handleDelete}
        ListHeaderComponent={Header}
        // Need extra padding at bottom for TabBar content if it overlays, but standard TabBar doesn't.
        contentContainerStyle={{ padding: 20, paddingTop: 60, paddingBottom: 100 }}
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
    marginBottom: 20
  },
  greetingText: { color: 'rgba(255,255,255,0.7)', fontSize: 16 },
  usernameText: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  logoutButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },

  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20
  },
  arrowArea: { padding: 10 },
  monthLabel: { color: '#FFF', fontSize: 18, fontWeight: '600', minWidth: 140, textAlign: 'center' },

  balanceCard: {
    marginBottom: 24,
    borderRadius: 20,
    padding: 20,
    ...theme.shadows.default
  },
  balanceHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
  balanceLabel: { color: theme.colors.textSecondary, fontSize: 14 },
  balanceValue: { color: theme.colors.textPrimary, fontSize: 32, fontWeight: 'bold', marginBottom: 20 },
  balanceRow: { flexDirection: 'row', justifyContent: 'space-between' },
  separator: { width: 1, backgroundColor: theme.colors.border },
  balanceRowLabel: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  miniLabel: { fontSize: 12, color: theme.colors.textSecondary },
  miniValue: { fontSize: 16, fontWeight: 'bold' },

  sectionContainer: { marginBottom: 20 },
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
});
