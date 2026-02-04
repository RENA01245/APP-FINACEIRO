import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Button, TextInput, Alert, TouchableOpacity, Modal, StatusBar } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { NotificationService } from '../../infra/services/NotificationService';
import { PayablesViewModel } from '../../viewmodel/PayablesViewModel';
import { Payable } from '../../model/Payable';
import { useAppTheme } from '../../design/ThemeContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { CustomInput } from '../components/CustomInput';

export function PayablesScreen() {
  const { theme, baseTheme, isDarkMode } = useAppTheme();
  const styles = createStyles(theme, baseTheme);
  const insets = useSafeAreaInsets();
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
    let cleanText = text.replace(/\D/g, '');
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

      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
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
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedPayable(payable);
    setPaymentDate(new Date());
    setPaymentModalVisible(true);
  };

  const confirmPayment = async () => {
    if (!selectedPayable) return;

    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await viewModel.pay(selectedPayable, paymentDate);
      setPaymentModalVisible(false);
      loadData();
      Alert.alert('Pago!', 'Conta paga e registrada como despesa.');
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    }
  };

  const renderItem = ({ item }: { item: Payable }) => (
    <View style={[styles.cardContainer, { backgroundColor: theme.surface }]}>
      <View style={styles.cardContent}>
        <View style={[styles.iconContainer, { backgroundColor: theme.danger + '15' }]}>
          <Feather name="file-text" size={24} color={theme.danger} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.description, { color: theme.textPrimary }]}>{item.description}</Text>
          <Text style={[styles.date, { color: theme.textSecondary }]}>Vence: {new Date(item.due_date).toLocaleDateString('pt-BR')}</Text>
        </View>
        <View style={{ alignItems: 'flex-end', marginRight: 10 }}>
          <Text style={[styles.amount, { color: theme.danger }]}>R$ {item.amount.toFixed(2)}</Text>
        </View>
      </View>

      <TouchableOpacity style={[styles.payButton, { backgroundColor: theme.secondary }]} onPress={() => handlePay(item)}>
        <Text style={styles.payButtonText}>Pagar</Text>
        <Feather name="check-circle" size={16} color="#FFF" style={{ marginLeft: 5 }} />
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={theme.gradientPrimary} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Contas a Pagar</Text>
          <TouchableOpacity onPress={() => setModalVisible(true)} style={styles.addButton}>
            <Feather name="plus" size={24} color={theme.primary} />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <FlatList
        data={payables}
        keyExtractor={item => item.id || Math.random().toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
              <Feather name="check-circle" size={40} color={theme.placeholder} />
            </View>
            <Text style={[styles.emptyText, { color: theme.textPrimary }]}>Tudo em dia!</Text>
            <Text style={[styles.emptySubText, { color: theme.textSecondary }]}>Nenhuma conta pendente.</Text>
          </View>
        }
      />

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Nova Conta</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Feather name="x" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <CustomInput
              label="Descrição"
              placeholder="Ex: Energia"
              value={description}
              onChangeText={setDescription}
              icon="file-text"
            />

            <CustomInput
              label="Valor"
              placeholder="0.00"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              icon="dollar-sign"
            />

            <CustomInput
              label="Vencimento"
              placeholder="DD/MM/AAAA"
              value={dateStr}
              onChangeText={handleDateChange}
              keyboardType="numeric"
              maxLength={10}
              icon="calendar"
            />

            <PrimaryButton title="Agendar" onPress={handleAdd} loading={loading} style={{ marginTop: 10 }} />
          </View>
        </View>
      </Modal>

      {/* Payment Confirmation Modal */}
      <Modal visible={paymentModalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface, marginHorizontal: 40 }]}>
            <Text style={[styles.modalTitle, { textAlign: 'center', marginBottom: 20, color: theme.textPrimary }]}>Confirmar Pagamento</Text>

            {selectedPayable && (
              <Text style={{ marginBottom: 20, fontSize: 16, textAlign: 'center', color: theme.textSecondary }}>
                Confirmar pagamento de <Text style={{ fontWeight: 'bold', color: theme.textPrimary }}>{selectedPayable.description}</Text> no valor de <Text style={{ fontWeight: 'bold', color: theme.danger }}>R$ {selectedPayable.amount.toFixed(2)}</Text>?
              </Text>
            )}

            <Text style={{ marginBottom: 8, fontWeight: 'bold', color: theme.textPrimary, alignSelf: 'flex-start' }}>Data do Pagamento:</Text>

            <TouchableOpacity
              style={[styles.dateButton, { borderColor: theme.border, backgroundColor: theme.background }]}
              onPress={() => setShowPaymentDatePicker(true)}
            >
              <Feather name="calendar" size={20} color={theme.textPrimary} />
              <Text style={{ marginLeft: 10, color: theme.textPrimary }}>{paymentDate.toLocaleDateString('pt-BR')}</Text>
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
              <PrimaryButton title="Cancelar" onPress={() => setPaymentModalVisible(false)} variant="outline" style={{ flex: 1, marginRight: 10 }} />
              <PrimaryButton title="Confirmar" onPress={confirmPayment} style={{ flex: 1, marginLeft: 10 }} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function createStyles(theme: any, baseTheme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      paddingBottom: 20,
      paddingHorizontal: 20,
      borderBottomLeftRadius: 30,
      borderBottomRightRadius: 30,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
    addButton: {
      backgroundColor: '#FFF',
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      ...baseTheme.shadows.default
    },

    list: { padding: 20 },
    cardContainer: {
      borderRadius: 16,
      marginBottom: 12,
      ...baseTheme.shadows.soft,
      overflow: 'hidden'
    },
    cardContent: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 16
    },
    iconContainer: {
      width: 44,
      height: 44,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12
    },
    description: { fontSize: 16, fontWeight: 'bold' },
    date: { fontSize: 12 },
    amount: { fontSize: 18, fontWeight: 'bold' },

    payButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 12
    },
    payButtonText: { color: '#fff', fontWeight: 'bold' },

    emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 80 },
    emptyIconCircle: {
      width: 80,
      height: 80,
      borderRadius: 40,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 20,
      ...baseTheme.shadows.soft
    },
    emptyText: { fontSize: 22, fontWeight: 'bold', marginTop: 10 },
    emptySubText: { fontSize: 15, marginTop: 5 },

    modalOverlay: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
    modalContent: { padding: 24, borderRadius: 24, ...baseTheme.shadows.default },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderWidth: 1,
      borderRadius: 12,
      marginBottom: 24
    },
    modalButtons: { flexDirection: 'row', justifyContent: 'space-between' }
  });
}
