import React, { useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthViewModel } from '../../viewmodel/AuthViewModel';
import { HomeViewModel } from '../../viewmodel/HomeViewModel';
import { BudgetViewModel } from '../../viewmodel/BudgetViewModel';
import { Transaction } from '../../model/Transaction';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, total: 0 });
  const [monthLabel, setMonthLabel] = useState('');
  
  const authViewModel = new AuthViewModel();
  const [homeViewModel] = useState(() => new HomeViewModel());
  
  // Budget State
  const [budgetViewModel] = useState(() => new BudgetViewModel());
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState<{category: string, budget: number, spent: number}[]>([]);
  const [categories] = useState(['Alimentação', 'Transporte', 'Lazer', 'Contas', 'Saúde', 'Outros']);

  const loadBudgets = async () => {
    try {
        const monthStr = homeViewModel.currentDate.toISOString().slice(0, 7); // YYYY-MM
        const status = await budgetViewModel.getBudgetsStatus(monthStr);
        
        // Merge with fixed categories to ensure all are shown
        const mergedStatus = categories.map(cat => {
            const existing = status.find(s => s.category === cat);
            return existing || { category: cat, budget: 0, spent: 0 };
        });
        
        // Also add any categories that have budgets but are not in the fixed list (custom ones)
        status.forEach(s => {
            if (!categories.includes(s.category)) {
                mergedStatus.push(s);
            }
        });
        
        setBudgetStatus(mergedStatus);
    } catch (e) {
        console.log(e);
    }
  };

  const saveBudget = async (category: string, amount: string) => {
      try {
          const monthStr = homeViewModel.currentDate.toISOString().slice(0, 7);
          await budgetViewModel.setBudget(category, amount, monthStr);
          loadBudgets(); // Refresh
      } catch (e: any) {
          Alert.alert('Erro', e.message);
      }
  };

  const loadData = async () => {
    try {
      // Check for recurring transactions (only once per session technically, but safe to check here)
      await homeViewModel.checkRecurring();
      
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

  const handleLogout = () => {
    authViewModel.logout();
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Excluir Transação',
      'Tem certeza que deseja excluir esta transação?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              await homeViewModel.deleteTransaction(id);
              loadData(); // Reload list and summary
            } catch (error: any) {
              Alert.alert('Erro', 'Não foi possível excluir a transação.');
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Finanças</Text>
        <Button title="Sair" onPress={handleLogout} color="red" />
      </View>

      <View style={styles.monthControl}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton}>
          <Feather name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
          <Feather name="chevron-right" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      <View style={styles.summaryContainer}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Receitas</Text>
          <Text style={[styles.summaryValue, styles.textIncome]}>R$ {summary.income.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Despesas</Text>
          <Text style={[styles.summaryValue, styles.textExpense]}>R$ {summary.expense.toFixed(2)}</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Saldo</Text>
          <Text style={[styles.summaryValue, summary.total >= 0 ? styles.textIncome : styles.textExpense]}>
            R$ {summary.total.toFixed(2)}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={styles.actionButtonsRow}>
            <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AddTransaction')}>
                <Feather name="plus" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Nova</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#ff9800'}]} onPress={() => navigation.navigate('Payables')}>
                <Feather name="calendar" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Contas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#9c27b0'}]} onPress={() => {
                loadBudgets();
                setBudgetModalVisible(true);
            }}>
                <Feather name="pie-chart" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Orçamento</Text>
            </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, item.type === 'expense' ? styles.expense : styles.income]}>
            <View style={styles.cardContent}>
              <TouchableOpacity onPress={() => navigation.navigate('AddTransaction', { transaction: item })}>
                <Text style={styles.desc}>{item.description}</Text>
                {item.category && <Text style={styles.category}>{item.category}</Text>}
                <Text style={styles.amount}>R$ {item.amount.toFixed(2)}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              onPress={() => item.id && handleDelete(item.id)}
              style={styles.deleteButton}
            >
              <Text style={styles.deleteText}>X</Text>
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>Nenhuma transação</Text>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  iconButton: {
    padding: 8,
    marginRight: 5,
  },
  monthControl: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
  },
  arrowButton: {
    paddingHorizontal: 20,
  },
  arrowText: {
    fontSize: 20,
    color: '#333',
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    minWidth: 150,
    textAlign: 'center',
  },

  summaryContainer: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 10, 
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
  },
  summaryItem: { alignItems: 'center' },
  summaryLabel: { fontSize: 12, color: '#666' },
  summaryValue: { fontSize: 16, fontWeight: 'bold' },
  textIncome: { color: '#2e7d32' },
  textExpense: { color: '#c62828' },

  actions: { marginBottom: 15 },
  
  list: { paddingBottom: 20 },
  card: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: 15, 
    marginBottom: 10, 
    backgroundColor: '#fff', 
    borderRadius: 8,
    elevation: 1,
  },
  expense: { borderLeftWidth: 5, borderLeftColor: '#c62828' },
  income: { borderLeftWidth: 5, borderLeftColor: '#2e7d32' },
  cardContent: { flex: 1 },
  desc: { fontSize: 16, fontWeight: 'bold' },
  category: { fontSize: 12, color: '#666', marginTop: 2 },
  amount: { fontSize: 16, marginTop: 4 },
  deleteButton: { padding: 10 },
  deleteText: { color: 'red', fontWeight: 'bold' },
  empty: { textAlign: 'center', marginTop: 50, color: '#999' },
  
  actionButtonsRow: { flexDirection: 'row', justifyContent: 'space-around' },
  actionButton: { 
      backgroundColor: '#2196F3', 
      paddingVertical: 10, 
      paddingHorizontal: 20, 
      borderRadius: 8, 
      flexDirection: 'row', 
      alignItems: 'center',
      minWidth: 100,
      justifyContent: 'center'
  },
  actionButtonText: { color: '#fff', marginLeft: 8, fontWeight: 'bold' },

  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold' },
  budgetRow: { marginBottom: 20 },
  budgetInfo: { marginBottom: 5 },
  budgetCategory: { fontWeight: 'bold', fontSize: 16 },
  budgetValues: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },
  budgetSpent: { color: '#666' },
  budgetInputContainer: { flexDirection: 'row', alignItems: 'center' },
  budgetInput: { borderBottomWidth: 1, borderColor: '#ccc', width: 60, textAlign: 'center', padding: 0 },
  progressBarBg: { height: 10, backgroundColor: '#eee', borderRadius: 5, overflow: 'hidden' },
  progressBarFill: { height: '100%' },
});
