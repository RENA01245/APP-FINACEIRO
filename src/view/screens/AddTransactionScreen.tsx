
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity, Switch, Platform, ScrollView, StatusBar, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import { AddTransactionViewModel } from '../../viewmodel/AddTransactionViewModel';
import { CategoryViewModel } from '../../viewmodel/CategoryViewModel';
import { CardViewModel } from '../../viewmodel/CardViewModel';
import { Category } from '../../model/Category';
import { theme } from '../../design/theme';
import { PrimaryButton } from '../components/PrimaryButton';
import { CustomInput } from '../components/CustomInput';

export function AddTransactionScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const transaction = route.params?.transaction;

  const [amount, setAmount] = useState(transaction ? transaction.amount.toString() : '');
  const [description, setDescription] = useState(transaction ? transaction.description : '');
  const [type, setType] = useState<'income' | 'expense'>(transaction ? transaction.type : 'expense');
  const [category, setCategory] = useState(transaction ? transaction.category : '');
  const [isRecurring, setIsRecurring] = useState(transaction ? transaction.isRecurring : false);
  const [date, setDate] = useState(transaction?.created_at ? new Date(transaction.created_at) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card'>(transaction ? transaction.payment_method : 'cash');
  const [cardId, setCardId] = useState(transaction ? transaction.card_id : '');
  const [cards, setCards] = useState<any[]>([]);

  const viewModel = new AddTransactionViewModel();
  const [categoryViewModel] = useState(() => new CategoryViewModel());
  const [cardViewModel] = useState(() => new CardViewModel());

  const loadData = async () => {
    try {
      const [cats, cardList] = await Promise.all([
        categoryViewModel.getCategories(),
        cardViewModel.getCards()
      ]);
      setCategories(cats);
      setCards(cardList);

      if (!cardId && cardList.length > 0) {
        setCardId(cardList[0].id);
      }
    } catch (e) {
      console.error(e);
    }
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleSave = async () => {
    if (!amount || !description || !category) {
      Alert.alert('Ops', 'Por favor, preencha valor, descrição e categoria.');
      return;
    }

    try {
      setLoading(true);
      if (transaction && transaction.id) {
        await viewModel.update(transaction.id, amount, description, type, category, isRecurring, date, paymentMethod, paymentMethod === 'credit_card' ? cardId : undefined);
      } else {
        await viewModel.add(amount, description, type, category, isRecurring, date, paymentMethod, paymentMethod === 'credit_card' ? cardId : undefined);
      }
      navigation.goBack();
    } catch (e: any) {
      Alert.alert('Erro', e.message);
    } finally {
      setLoading(false);
    }
  };

  const isIncome = type === 'income';
  const headerColors = isIncome ? theme.colors.gradientSecondary : theme.colors.gradientPrimary;
  // If expense, maybe use a reddish gradient or keep primary blue for neutral. 
  // Let's use Red for expense to be clear.
  const expenseGradient = ['#c62828', '#e53935'] as const;
  const activeGradient = isIncome ? theme.colors.gradientSecondary : expenseGradient;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={activeGradient} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{transaction ? 'Editar Transação' : 'Nova Transação'}</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.amountContainer}>
          <Text style={styles.currencyPrefix}>R$</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
            placeholder="0.00"
            placeholderTextColor="rgba(255,255,255,0.6)"
            cursorColor="#FFF"
            autoFocus={!transaction}
          />
        </View>

        <View style={styles.typeSelector}>
          <TouchableOpacity
            style={[styles.typeButton, isIncome && styles.typeButtonActive]}
            onPress={() => setType('income')}
          >
            <Feather name="arrow-up-circle" size={20} color={isIncome ? theme.colors.secondary : 'rgba(255,255,255,0.7)'} />
            <Text style={[styles.typeText, isIncome ? { color: theme.colors.secondary } : { color: '#FFF' }]}>Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButton, !isIncome && styles.typeButtonActive]}
            onPress={() => setType('expense')}
          >
            <Feather name="arrow-down-circle" size={20} color={!isIncome ? theme.colors.danger : 'rgba(255,255,255,0.7)'} />
            <Text style={[styles.typeText, !isIncome ? { color: theme.colors.danger } : { color: '#FFF' }]}>Despesa</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputGroup}>
          <CustomInput
            label="Descrição"
            placeholder="Ex: Supermercado"
            value={description}
            onChangeText={setDescription}
            icon="file-text"
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
            <Text style={styles.label}>Categoria</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' }}>Configurar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {categories.map((cat, idx) => (
              <TouchableOpacity
                key={cat.id || `cat-${idx}`}
                style={[styles.categoryCard, category === cat.name && styles.categoryCardActive]}
                onPress={() => setCategory(cat.name)}
              >
                <View style={[styles.catIcon, category === cat.name && { backgroundColor: theme.colors.primary }]}>
                  <Feather
                    name={cat.icon as any}
                    size={20}
                    color={category === cat.name ? '#FFF' : theme.colors.textSecondary}
                  />
                </View>
                <Text style={[styles.categoryText, category === cat.name && styles.categoryTextActive]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={styles.label}>Data</Text>
              <TouchableOpacity style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
                <Feather name="calendar" size={20} color={theme.colors.textPrimary} />
                <Text style={styles.dateText}>{date.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.label}>Recorrente?</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>{isRecurring ? 'Sim' : 'Não'}</Text>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: "#767577", true: theme.colors.primary }}
                  thumbColor={"#f4f3f4"}
                />
              </View>
            </View>
          </View>

          {!isIncome && (
            <View style={{ marginTop: 20 }}>
              <Text style={styles.label}>Forma de Pagamento</Text>
              <View style={styles.typeSelector}>
                <TouchableOpacity
                  style={[styles.typeButton, paymentMethod === 'cash' && styles.typeButtonActive]}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <Feather name="dollar-sign" size={18} color={paymentMethod === 'cash' ? theme.colors.primary : theme.colors.textSecondary} />
                  <Text style={[styles.typeText, { color: paymentMethod === 'cash' ? theme.colors.primary : theme.colors.textSecondary }]}>Dinheiro</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.typeButton, paymentMethod === 'credit_card' && styles.typeButtonActive]}
                  onPress={() => setPaymentMethod('credit_card')}
                >
                  <Feather name="credit-card" size={18} color={paymentMethod === 'credit_card' ? theme.colors.primary : theme.colors.textSecondary} />
                  <Text style={[styles.typeText, { color: paymentMethod === 'credit_card' ? theme.colors.primary : theme.colors.textSecondary }]}>Cartão</Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === 'credit_card' && (
                <View style={{ marginTop: 15 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={[styles.label, { marginTop: 0 }]}>Selecionar Cartão</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Cards')}>
                      <Text style={{ color: theme.colors.primary, fontSize: 12, fontWeight: 'bold' }}>Gerenciar</Text>
                    </TouchableOpacity>
                  </View>

                  {cards.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexDirection: 'row' }}>
                      {cards.map(card => (
                        <TouchableOpacity
                          key={card.id}
                          style={[
                            styles.miniCard,
                            { backgroundColor: card.color + '20', borderColor: card.color },
                            cardId === card.id && { backgroundColor: card.color, borderWidth: 0 }
                          ]}
                          onPress={() => setCardId(card.id)}
                        >
                          <Text style={[styles.miniCardText, cardId === card.id && { color: '#FFF' }]}>{card.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <TouchableOpacity style={styles.errorContainer} onPress={() => navigation.navigate('Cards')}>
                      <Text style={styles.errorText}>Nenhum cartão cadastrado. Toque para adicionar.</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          )}

          {showDatePicker && (
            <DateTimePicker
              value={date}
              mode="date"
              display="default"
              maximumDate={new Date()} // Can't create future transactions unless it's a payable (different screen)
              onChange={(event, selectedDate) => {
                setShowDatePicker(false);
                if (selectedDate) setDate(selectedDate);
              }}
            />
          )}
        </View>

        <View style={styles.footer}>
          <PrimaryButton title="Salvar" onPress={handleSave} loading={loading} />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerTitle: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },

  amountContainer: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', marginBottom: 20 },
  currencyPrefix: { fontSize: 24, color: 'rgba(255,255,255,0.8)', marginRight: 5, marginTop: 10 },
  amountInput: { fontSize: 48, color: '#FFF', fontWeight: 'bold', minWidth: 100, textAlign: 'center' },

  typeSelector: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 16, padding: 4 },
  typeButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12 },
  typeButtonActive: { backgroundColor: '#FFF' },
  typeText: { marginLeft: 8, fontWeight: 'bold' },

  content: { flex: 1 },
  scrollContent: { padding: 20 },
  inputGroup: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, ...theme.shadows.default, marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 10, marginTop: 10 },

  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
  categoryCard: {
    width: '30%',
    aspectRatio: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5
  },
  categoryCardActive: { borderColor: theme.colors.primary, backgroundColor: theme.colors.surface },
  catIcon: { width: 36, height: 36, borderRadius: 18, backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  categoryText: { fontSize: 12, color: theme.colors.textSecondary },
  categoryTextActive: { color: theme.colors.primary, fontWeight: 'bold' },

  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12
  },
  dateText: { marginLeft: 10, color: theme.colors.textPrimary },

  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    height: 52
  },
  switchLabel: { fontWeight: 'bold', color: theme.colors.textPrimary },

  footer: { marginBottom: 30 },

  miniCard: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 10,
    minWidth: 80,
    alignItems: 'center'
  },
  miniCardText: { fontSize: 13, fontWeight: 'bold', color: theme.colors.textPrimary },
  errorContainer: { padding: 15, backgroundColor: '#FFF5F5', borderRadius: 12, borderWidth: 1, borderColor: '#FED7D7' },
  errorText: { color: '#C53030', fontSize: 13, textAlign: 'center' }
});
