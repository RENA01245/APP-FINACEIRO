import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Alert, Text, TouchableOpacity, Switch, Platform, ScrollView, StatusBar, FlatList } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { AddTransactionViewModel } from '../../viewmodel/AddTransactionViewModel';
import { CategoryViewModel } from '../../viewmodel/CategoryViewModel';
import { CardViewModel } from '../../viewmodel/CardViewModel';
import { Category } from '../../model/Category';
import { useAppTheme } from '../../design/ThemeContext';
import { PrimaryButton } from '../components/PrimaryButton';
import { CustomInput } from '../components/CustomInput';

export function AddTransactionScreen() {
  const { theme, baseTheme, isDarkMode } = useAppTheme();
  const styles = createStyles(theme, baseTheme);
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const route = useRoute<any>();
  const transaction = route.params?.transaction;

  const [amount, setAmount] = useState(transaction?.amount !== undefined ? transaction.amount.toString() : '');
  const [description, setDescription] = useState(transaction?.description || '');
  const [type, setType] = useState<'income' | 'expense'>(transaction?.type || 'expense');
  const [category, setCategory] = useState(transaction?.category || '');
  const [isRecurring, setIsRecurring] = useState(transaction?.isRecurring || false);
  const [date, setDate] = useState(transaction?.created_at ? new Date(transaction.created_at) : new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'credit_card'>(transaction?.payment_method || 'cash');
  const [cardId, setCardId] = useState(transaction?.card_id || '');
  const [cards, setCards] = useState<any[]>([]);

  const [viewModel] = useState(() => new AddTransactionViewModel());
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
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      setLoading(true);
      if (transaction && transaction.id) {
        await viewModel.update(transaction.id, amount, description, type, category, isRecurring, date, paymentMethod, paymentMethod === 'credit_card' ? cardId : undefined);
      } else {
        await viewModel.add(amount, description, type, category, isRecurring, date, paymentMethod, paymentMethod === 'credit_card' ? cardId : undefined);
      }
      navigation.goBack();
    } catch (e: any) {
      console.error('Error saving transaction:', e);
      Alert.alert('Erro', e.message || 'Ocorreu um erro ao salvar a transação.');
    } finally {
      setLoading(false);
    }
  };

  const isIncome = type === 'income';
  const activeGradient = (isIncome ? theme.gradientSecondary : (isDarkMode ? ['#441111', '#662222'] : ['#c62828', '#e53935'])) as readonly [string, string, ...string[]];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={activeGradient} style={[styles.header, { paddingTop: insets.top + 10 }]}>
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

        <View style={styles.typeSelectorHeader}>
          <TouchableOpacity
            style={[styles.typeButtonHeader, isIncome && styles.typeButtonActiveHeader]}
            onPress={() => {
              Haptics.selectionAsync();
              setType('income');
            }}
          >
            <Feather name="arrow-up-circle" size={20} color={isIncome ? theme.secondary : 'rgba(255,255,255,0.7)'} />
            <Text style={[styles.typeTextHeader, isIncome ? { color: theme.secondary } : { color: '#FFF' }]}>Receita</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.typeButtonHeader, !isIncome && styles.typeButtonActiveHeader]}
            onPress={() => {
              Haptics.selectionAsync();
              setType('expense');
            }}
          >
            <Feather name="arrow-down-circle" size={20} color={!isIncome ? theme.danger : 'rgba(255,255,255,0.7)'} />
            <Text style={[styles.typeTextHeader, !isIncome ? { color: theme.danger } : { color: '#FFF' }]}>Despesa</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.inputGroup, { backgroundColor: theme.surface }]}>
          <CustomInput
            label="Descrição"
            placeholder="Ex: Supermercado"
            value={description}
            onChangeText={setDescription}
            icon="file-text"
          />

          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
            <Text style={[styles.label, { color: theme.textPrimary }]}>Categoria</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Categories')}>
              <Text style={{ color: theme.primary, fontSize: 12, fontWeight: 'bold' }}>Configurar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.categoriesGrid}>
            {categories.map((cat, idx) => (
              <TouchableOpacity
                key={cat.id || `cat-${idx}`}
                style={[styles.categoryCard, { borderColor: theme.border }, category === cat.name && { borderColor: theme.primary, backgroundColor: theme.surface }]}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setCategory(cat.name);
                }}
              >
                <View style={[styles.catIcon, { backgroundColor: theme.background }, category === cat.name && { backgroundColor: theme.primary }]}>
                  <Feather
                    name={cat.icon as any}
                    size={20}
                    color={category === cat.name ? '#FFF' : theme.textSecondary}
                  />
                </View>
                <Text style={[styles.categoryText, { color: theme.textSecondary }, category === cat.name && { color: theme.primary, fontWeight: 'bold' }]}>{cat.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 10 }}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Data</Text>
              <TouchableOpacity style={[styles.dateButton, { borderColor: theme.border }]} onPress={() => setShowDatePicker(true)}>
                <Feather name="calendar" size={20} color={theme.textPrimary} />
                <Text style={[styles.dateText, { color: theme.textPrimary }]}>{date.toLocaleDateString()}</Text>
              </TouchableOpacity>
            </View>

            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Recorrente?</Text>
              <View style={[styles.switchContainer, { borderColor: theme.border }]}>
                <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>{isRecurring ? 'Sim' : 'Não'}</Text>
                <Switch
                  value={isRecurring}
                  onValueChange={setIsRecurring}
                  trackColor={{ false: "#767577", true: theme.primary }}
                  thumbColor={"#f4f3f4"}
                />
              </View>
            </View>
          </View>

          {!isIncome && (
            <View style={{ marginTop: 20 }}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>Forma de Pagamento</Text>
              <View style={[styles.methodSelector, { backgroundColor: isDarkMode ? '#1A1A1A' : '#F5F5F5' }]}>
                <TouchableOpacity
                  style={[styles.methodButton, paymentMethod === 'cash' && { backgroundColor: theme.surface }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPaymentMethod('cash');
                  }}
                >
                  <Feather name="dollar-sign" size={18} color={paymentMethod === 'cash' ? theme.primary : theme.textSecondary} />
                  <Text style={[styles.methodText, { color: paymentMethod === 'cash' ? theme.primary : theme.textSecondary }]}>Dinheiro</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.methodButton, paymentMethod === 'credit_card' && { backgroundColor: theme.surface }]}
                  onPress={() => {
                    Haptics.selectionAsync();
                    setPaymentMethod('credit_card');
                  }}
                >
                  <Feather name="credit-card" size={18} color={paymentMethod === 'credit_card' ? theme.primary : theme.textSecondary} />
                  <Text style={[styles.methodText, { color: paymentMethod === 'credit_card' ? theme.primary : theme.textSecondary }]}>Cartão</Text>
                </TouchableOpacity>
              </View>

              {paymentMethod === 'credit_card' && (
                <View style={{ marginTop: 15 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <Text style={[styles.label, { marginTop: 0, color: theme.textPrimary }]}>Selecionar Cartão</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Cards')}>
                      <Text style={{ color: theme.primary, fontSize: 12, fontWeight: 'bold' }}>Gerenciar</Text>
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
                          onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setCardId(card.id);
                          }}
                        >
                          <Text style={[styles.miniCardText, { color: theme.textPrimary }, cardId === card.id && { color: '#FFF' }]}>{card.name}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  ) : (
                    <TouchableOpacity style={[styles.errorContainer, { backgroundColor: isDarkMode ? '#331111' : '#FFF5F5', borderColor: isDarkMode ? '#662222' : '#FED7D7' }]} onPress={() => navigation.navigate('Cards')}>
                      <Text style={[styles.errorText, { color: isDarkMode ? '#FF8888' : '#C53030' }]}>Nenhum cartão cadastrado. Toque para adicionar.</Text>
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
              maximumDate={new Date()}
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

function createStyles(theme: any, baseTheme: any) {
  return StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
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

    typeSelectorHeader: { flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.1)', borderRadius: 16, padding: 4 },
    typeButtonHeader: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 12 },
    typeButtonActiveHeader: { backgroundColor: '#FFF' },
    typeTextHeader: { marginLeft: 8, fontWeight: 'bold' },

    content: { flex: 1 },
    scrollContent: { padding: 20 },
    inputGroup: { borderRadius: 20, padding: 20, ...baseTheme.shadows.default, marginBottom: 20 },
    label: { fontSize: 14, fontWeight: '600', marginBottom: 10, marginTop: 10 },

    categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 10 },
    categoryCard: {
      width: '30%',
      aspectRatio: 1,
      borderWidth: 1,
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 5
    },
    catIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
    categoryText: { fontSize: 12 },

    row: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    dateButton: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      borderWidth: 1,
      borderRadius: 12
    },
    dateText: { marginLeft: 10 },

    switchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 10,
      borderWidth: 1,
      borderRadius: 12,
      height: 52
    },
    switchLabel: { fontWeight: 'bold' },

    methodSelector: { flexDirection: 'row', borderRadius: 12, padding: 4, marginTop: 5 },
    methodButton: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },
    methodText: { marginLeft: 8, fontWeight: '600', fontSize: 13 },

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
    miniCardText: { fontSize: 13, fontWeight: 'bold' },
    errorContainer: { padding: 15, borderRadius: 12, borderWidth: 1 },
    errorText: { fontSize: 13, textAlign: 'center' }
  });
}
