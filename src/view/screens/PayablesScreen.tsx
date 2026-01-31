import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TextInput, Alert, TouchableOpacity, Modal, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { NotificationService } from '../../infra/services/NotificationService';
import { PayablesViewModel } from '../../viewmodel/PayablesViewModel';
import { Payable } from '../../model/Payable';
import { Feather } from '@expo/vector-icons';

export function PayablesScreen() {
  const [payables, setPayables] = useState<Payable[]>([]);
  const [viewModel] = useState(() => new PayablesViewModel());
  const [modalVisible, setModalVisible] = useState(false);
  
  // Payment Modal State
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedPayable, setSelectedPayable] = useState<Payable | null>(null);
  const [paymentDate, setPaymentDate] = useState(new Date());
  const [showPaymentDatePicker, setShowPaymentDatePicker] = useState(false);
  
  // Form state
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [dateStr, setDateStr] = useState('');
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
      NotificationService.requestPermissions();
    }, [])
  );
  
  const handleDateChange = (text: string) => {
    // Remove tudo que não é número
    let cleanText = text.replace(/\D/g, '');
    
    // Adiciona as barras automaticamente
    if (cleanText.length >= 2) {
      cleanText = cleanText.substring(0, 2) + '/' + cleanText.substring(2);
    }
    if (cleanText.length >= 5) {
      cleanText = cleanText.substring(0, 5) + '/' + cleanText.substring(5, 9);
    }

    setDateStr(cleanText);
  };

  const handleAdd = async () => {
    try {
      if (!dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
        Alert.alert('Erro', 'Data inválida. Use o formato DD/MM/AAAA');
        return;
      }
      
      const [day, month, year] = dateStr.split('/').map(Number);
      const dateObj = new Date(year, month - 1, day);
      
      setLoading(true);
      await viewModel.add(description, amount, dateObj);
      setModalVisible(false);
      setDescription('');
      setAmount('');
      setDateStr('');
      loadData();
      Alert.alert('Sucesso', 'Conta agendada com sucesso!');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePay = (payable: Payable) => {
    setSelectedPayable(payable);
    setPaymentDate(new Date());
    setPaymentModalVisible(true);
  };

  const confirmPayment = async () => {
    if (!selectedPayable) return;
    
    try {
      await viewModel.pay(selectedPayable, paymentDate);
      setPaymentModalVisible(false);
      loadData();
      Alert.alert('Pago!', 'Conta paga e registrada como despesa.');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
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

            <TextInput
              style={styles.input}
              placeholder="Vencimento (DD/MM/AAAA)"
              value={dateStr}
              onChangeText={handleDateChange}
              keyboardType="numeric"
              maxLength={10}
            />

            <View style={styles.modalButtons}>
              <Button title="Cancelar" color="red" onPress={() => setModalVisible(false)} />
              <Button title={loading ? "Salvando..." : "Salvar"} onPress={handleAdd} disabled={loading} />
            </View>
          </View>
        </View>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal visible={paymentModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Confirmar Pagamento</Text>
            
            {selectedPayable && (
               <Text style={{marginBottom: 15, fontSize: 16, textAlign: 'center'}}>
                 Pagar {selectedPayable.description} no valor de R$ {selectedPayable.amount.toFixed(2)}?
               </Text>
            )}

            <Text style={{marginBottom: 5, fontWeight: 'bold'}}>Data do Pagamento:</Text>
            
            <TouchableOpacity 
              style={styles.dateButton} 
              onPress={() => setShowPaymentDatePicker(true)}
            >
              <Text>{paymentDate.toLocaleDateString('pt-BR')}</Text>
            </TouchableOpacity>

            {showPaymentDatePicker && (
              <DateTimePicker
                value={paymentDate}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowPaymentDatePicker(false);
                  if (selectedDate) setPaymentDate(selectedDate);
                }}
              />
            )}

            <View style={styles.modalButtons}>
              <Button title="Cancelar" color="red" onPress={() => setPaymentModalVisible(false)} />
              <Button title="Confirmar" onPress={confirmPayment} />
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
