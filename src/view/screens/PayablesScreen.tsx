import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TextInput, Alert, TouchableOpacity, Modal } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
// import DateTimePicker from '@react-native-community/datetimepicker';
import { PayablesViewModel } from '../../viewmodel/PayablesViewModel';
import { Payable } from '../../model/Payable';
import { Feather } from '@expo/vector-icons';

export function PayablesScreen() {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [viewModel] = useState(() => new PayablesViewModel());
  const [modalVisible, setModalVisible] = useState(false);
  
  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const data = await viewModel.getPending();
      setPayables(data);
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAdd = async () => {
    try {
      setLoading(true);
      await viewModel.add(description, amount, date);
      setModalVisible(false);
      setDescription('');
      setAmount('');
      setDate(new Date());
      loadData();
      Alert.alert('Sucesso', 'Conta agendada com sucesso!');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = async (payable: Payable) => {
    Alert.alert(
      'Pagar Conta',
      `Confirmar pagamento de ${payable.description}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          onPress: async () => {
            try {
              await viewModel.pay(payable);
              loadData();
              Alert.alert('Pago!', 'Conta paga e registrada como despesa.');
            } catch (e: any) {
              Alert.alert('Erro', e.message);
            }
          }
        }
      ]
    );
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const renderItem = ({ item }: { item: Payable }) => (
    <View style={styles.card}>
      <View style={styles.cardContent}>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.amount}>R$ {item.amount.toFixed(2)}</Text>
        <Text style={styles.date}>Vence em: {new Date(item.due_date).toLocaleDateString('pt-BR')}</Text>
      </View>
      <TouchableOpacity style={styles.payButton} onPress={() => handlePay(item)}>
        <Text style={styles.payButtonText}>Pagar</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Contas a Pagar</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Feather name="plus" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={payables}
        keyExtractor={item => item.id || Math.random().toString()}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma conta pendente.</Text>}
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nova Conta a Pagar</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Descrição (ex: Luz)"
              value={description}
              onChangeText={setDescription}
            />
            
            <TextInput
              style={styles.input}
              placeholder="Valor (0.00)"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
            />

            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.dateButton}>
              <Text>Vencimento: {date.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>

            {/* {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={onDateChange}
                minimumDate={new Date()}
              />
            )} */}

            <View style={styles.modalButtons}>
              <Button title="Cancelar" color="red" onPress={() => setModalVisible(false)} />
              <Button title={loading ? "Salvando..." : "Salvar"} onPress={handleAdd} disabled={loading} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold' },
  addButton: { backgroundColor: '#2196F3', padding: 10, borderRadius: 50 },
  
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', elevation: 2 },
  cardContent: { flex: 1 },
  description: { fontSize: 16, fontWeight: 'bold' },
  amount: { fontSize: 16, color: '#d32f2f', marginVertical: 4 },
  date: { fontSize: 12, color: '#666' },
  
  payButton: { backgroundColor: '#4caf50', paddingVertical: 8, paddingHorizontal: 15, borderRadius: 5 },
  payButtonText: { color: '#fff', fontWeight: 'bold' },
  
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' },
  
  modalContainer: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContent: { backgroundColor: '#fff', padding: 20, borderRadius: 10 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 15, borderRadius: 5 },
  dateButton: { padding: 15, borderWidth: 1, borderColor: '#ccc', borderRadius: 5, marginBottom: 20, alignItems: 'center' },
  modalButtons: { flexDirection: 'row', justifyContent: 'space-around' }
});
