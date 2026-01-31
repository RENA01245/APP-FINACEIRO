import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AddTransactionViewModel } from '../../viewmodel/AddTransactionViewModel';

export function AddTransactionScreen() {
  const navigation = useNavigation();
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [loading, setLoading] = useState(false);

  const viewModel = new AddTransactionViewModel();

  const handleSave = async () => {
    try {
      setLoading(true);
      await viewModel.add(amount, description, type);
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

      <Button title={loading ? "Salvando..." : "Salvar"} onPress={handleSave} />
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
});
