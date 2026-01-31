import React, { useState, useCallback } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { AuthViewModel } from '../../viewmodel/AuthViewModel';
import { HomeViewModel } from '../../viewmodel/HomeViewModel';
import { Transaction } from '../../model/Transaction';

export function HomeScreen() {
  const navigation = useNavigation<any>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState({ income: 0, expense: 0, total: 0 });
  
  const authViewModel = new AuthViewModel();
  const homeViewModel = new HomeViewModel();

  const loadData = async () => {
    try {
      const data = await homeViewModel.getTransactions();
      setTransactions(data);
      setSummary(homeViewModel.calculateSummary(data));
    } catch (error: any) {
      Alert.alert('Erro', error.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Minhas Finanças</Text>
        <Button title="Sair" onPress={handleLogout} color="red" />
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
        <Button title="Nova Transação" onPress={() => navigation.navigate('AddTransaction')} />
      </View>

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id || Math.random().toString()}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={[styles.card, item.type === 'expense' ? styles.expense : styles.income]}>
            <View style={styles.cardContent}>
              <Text style={styles.desc}>{item.description}</Text>
              <Text style={styles.amount}>R$ {item.amount.toFixed(2)}</Text>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, marginTop: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  
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
    borderRadius: 8, 
    borderWidth: 1,
    backgroundColor: '#fff'
  },
  cardContent: { flex: 1 },
  income: { backgroundColor: '#e8f5e9', borderColor: '#c8e6c9' },
  expense: { backgroundColor: '#ffebee', borderColor: '#ffcdd2' },
  desc: { fontSize: 16, fontWeight: 'bold' },
  amount: { fontSize: 14 },
  
  deleteButton: { padding: 10 },
  deleteText: { color: '#c62828', fontWeight: 'bold', fontSize: 18 },
  
  empty: { textAlign: 'center', marginTop: 20, color: '#666' },
});
