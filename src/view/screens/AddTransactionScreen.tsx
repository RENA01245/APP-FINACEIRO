import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity, Switch } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { AddTransactionViewModel } from '../../viewmodel/AddTransactionViewModel';

export function AddTransactionScreen() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const transaction = route.params?.transaction;

  const [amount, setAmount] = useState(transaction ? transaction.amount.toString() : '');
  const [description, setDescription] = useState(transaction ? transaction.description : '');
  const [type, setType] = useState<'income' | 'expense'>(transaction ? transaction.type : 'expense');
  const [category, setCategory] = useState(transaction ? transaction.category : '');
  const [isRecurring, setIsRecurring] = useState(transaction ? transaction.isRecurring : false);
  const [loading, setLoading] = useState(false);

  const viewModel = new AddTransactionViewModel();

  const categories = ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Saúde', 'Outros'];

  const handleSave = async () => {
    try {
      setLoading(true);
      if (transaction && transaction.id) {
        await viewModel.update(transaction.id, amount, description, type, category, isRecurring);
      } else {
        await viewModel.add(amount, description, type, category, isRecurring);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Valor</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
        placeholder="0.00"
      />

      <Text style={styles.label}>Descrição</Text>
      <TextInput
        style={styles.input}
        value={description}
        onChangeText={setDescription}
        placeholder="Ex: Mercado"
      />

      <View style={styles.typeContainer}>
        <TouchableOpacity
          style={[styles.typeButton, type === 'income' && styles.activeIncome]}
          onPress={() => setType('income')}
        >
          <Text style={styles.typeText}>Receita</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, type === 'expense' && styles.activeExpense]}
          onPress={() => setType('expense')}
        >
          <Text style={styles.typeText}>Despesa</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.label}>Categoria</Text>
      <View style={styles.categoriesContainer}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[styles.categoryButton, category === cat && styles.activeCategory]}
            onPress={() => setCategory(cat)}
          >
            <Text style={[styles.categoryText, category === cat && styles.activeCategoryText]}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button title={loading ? "Salvando..." : "Salvar"} onPress={handleSave} disabled={loading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  label: { marginBottom: 5, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 20, borderRadius: 5 },
  typeContainer: { flexDirection: 'row', marginBottom: 20 },
  typeButton: { flex: 1, padding: 15, alignItems: 'center', borderWidth: 1, borderColor: '#ccc' },
  activeIncome: { backgroundColor: '#c8e6c9', borderColor: 'green' },
  activeExpense: { backgroundColor: '#ffcdd2', borderColor: 'red' },
  typeText: { fontWeight: 'bold' },
  
  categoriesContainer: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20, gap: 10 },
  categoryButton: { padding: 10, borderWidth: 1, borderColor: '#ccc', borderRadius: 20, marginBottom: 5 },
  activeCategory: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  categoryText: { color: '#333' },
  activeCategoryText: { color: '#fff', fontWeight: 'bold' },
  switchContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
});
