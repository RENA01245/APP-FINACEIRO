import React, { useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity, Modal, TextInput, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthViewModel } from '../../viewmodel/AuthViewModel';
import { HomeViewModel } from '../../viewmodel/HomeViewModel';
import { BudgetViewModel } from '../../viewmodel/BudgetViewModel';
import { PayablesViewModel } from '../../viewmodel/PayablesViewModel';
import { Transaction } from '../../model/Transaction';
import { Payable } from '../../model/Payable';
import { BudgetProgressBar } from '../components/BudgetProgressBar';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, total: 0 });
  const [monthLabel, setMonthLabel] = useState('');
  
  const authViewModel = new AuthViewModel();
  const [homeViewModel] = useState(() => new HomeViewModel());
  
  // Budget State
  const [budgetViewModel] = useState(() => new BudgetViewModel());
  const [payablesViewModel] = useState(() => new PayablesViewModel());
  const [budgetModalVisible, setBudgetModalVisible] = useState(false);
  const [budgetStatus, setBudgetStatus] = useState<{category: string, budget: number, spent: number}[]>([]);
  const [upcomingPayables, setUpcomingPayables] = useState<Payable[]>([]);
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
      // Check for recurring transactions
      await homeViewModel.checkRecurring();
      
      // Load budgets
      await loadBudgets();

      // Load upcoming payables
      const pending = await payablesViewModel.getPending();
      // Show only top 2 soonest
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
                <Feather name="target" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Metas</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.actionButton, {backgroundColor: '#2196f3'}]} onPress={() => navigation.navigate('Reports', { date: homeViewModel.currentDate.toISOString() })}>
                <Feather name="bar-chart-2" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Relatórios</Text>
            </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View>
            {upcomingPayables.length > 0 && (
              <View style={styles.budgetSection}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10}}>
                   <Text style={styles.sectionTitle}>Próximas Contas</Text>
                   <TouchableOpacity onPress={() => navigation.navigate('Payables')}>
                     <Text style={{color: '#2196f3', fontSize: 12}}>Ver todas</Text>
                   </TouchableOpacity>
                </View>
                {upcomingPayables.map((item, index) => (
                  <View key={index} style={styles.payableItem}>
                    <View>
                        <Text style={styles.payableDesc}>{item.description}</Text>
                        <Text style={styles.payableDate}>Vence: {new Date(item.due_date).toLocaleDateString('pt-BR')}</Text>
                    </View>
                    <Text style={styles.payableAmount}>R$ {item.amount.toFixed(2)}</Text>
                  </View>
                ))}
              </View>
            )}

            {budgetStatus.some(b => b.budget > 0) && (
              <View style={styles.budgetSection}>
                <Text style={styles.sectionTitle}>Orçamento Mensal</Text>
                {budgetStatus.map((item, index) => (
                   <BudgetProgressBar 
                      key={index}
                      category={item.category}
                      budget={item.budget}
                      spent={item.spent}
                   />
                ))}
              </View>
            )}
            <Text style={styles.sectionTitle}>Transações</Text>
          </View>
        }
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

      <Modal
        visible={budgetModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setBudgetModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Definir Orçamentos</Text>
                  <TouchableOpacity onPress={() => setBudgetModalVisible(false)}>
                      <Feather name="x" size={24} color="#333" />
                  </TouchableOpacity>
              </View>
              <ScrollView>
                  {budgetStatus.map((item, index) => (
                      <View key={index} style={styles.budgetRow}>
                          <View style={styles.budgetInfo}>
                              <Text style={styles.budgetCategory}>{item.category}</Text>
                          </View>
                          <View style={styles.budgetValues}>
                              <Text style={styles.budgetSpent}>Gasto: R$ {item.spent.toFixed(2)}</Text>
                              <View style={styles.budgetInputContainer}>
                                  <Text>Meta: R$ </Text>
                                  <TextInput 
                                      style={styles.budgetInput}
                                      keyboardType="numeric"
                                      placeholder="0.00"
                                      defaultValue={item.budget > 0 ? item.budget.toString() : ''}
                                      onEndEditing={(e) => saveBudget(item.category, e.nativeEvent.text)}
                                  />
                              </View>
                          </View>
                      </View>
                  ))}
              </ScrollView>
          </View>
        </View>
      </Modal>
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
  
  seeMoreText: { textAlign: 'center', color: '#2196F3', marginTop: 5, fontSize: 12 },
  budgetSection: { marginBottom: 15 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  list: { paddingBottom: 80 },
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
  budgetInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    width: 80,
    textAlign: 'right',
    padding: 2
  },
  payableItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },
  payableDesc: {
    fontWeight: '500',
    color: '#333'
  },
  payableDate: {
    fontSize: 12,
    color: '#666'
  },
  payableAmount: {
    fontWeight: 'bold',
    color: '#f44336'
  }
});
