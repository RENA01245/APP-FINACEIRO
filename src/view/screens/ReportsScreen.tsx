
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { ReportsViewModel } from '../../viewmodel/ReportsViewModel';
import { theme } from '../../design/theme';

const screenWidth = Dimensions.get('window').width;

export function ReportsScreen() {
  const [viewModel] = useState(() => new ReportsViewModel());
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(true);
  const [monthLabel, setMonthLabel] = useState('');
  const [pieData, setPieData] = useState<any[]>([]);
  const [barData, setBarData] = useState<any>(null);
  const [totalExpense, setTotalExpense] = useState(0);

  const loadData = async () => {
    try {
      setLoading(true);
      const transactions = await viewModel.getTransactions();

      const pie = viewModel.getExpensesByCategory(transactions);
      setPieData(pie);
      setTotalExpense(pie.reduce((acc, item) => acc + item.amount, 0));

      const bar = viewModel.getBalanceData(transactions);
      setBarData(bar);

      setMonthLabel(viewModel.getCurrentMonthLabel());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      if (route.params?.date) {
        viewModel.currentDate = new Date(route.params.date);
      }
      loadData();
    }, [route.params?.date])
  );

  const handleNextMonth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await viewModel.nextMonth();
    loadData();
  };

  const handlePrevMonth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await viewModel.prevMonth();
    loadData();
  };

  const chartConfig = {
    backgroundGradientFrom: "#ffffff",
    backgroundGradientTo: "#ffffff",
    color: (opacity = 1) => theme.colors.primary,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 2,
    labelColor: (opacity = 1) => theme.colors.textSecondary,
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient colors={theme.colors.gradientPrimary} style={[styles.header, { paddingTop: insets.top + 10 }]}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={20} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Relatórios</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.monthSelector}>
          <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowArea}>
            <Feather name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.monthLabelText}>{monthLabel}</Text>
          <TouchableOpacity onPress={handleNextMonth} style={styles.arrowArea}>
            <Feather name="chevron-right" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Principais Gastos</Text>
            {pieData.length > 0 ? (
              <>
                <PieChart
                  data={pieData.map(item => ({
                    ...item,
                    legendFontColor: theme.colors.textSecondary,
                    legendFontSize: 12
                  }))}
                  width={screenWidth - 40}
                  height={200}
                  chartConfig={chartConfig}
                  accessor={"amount"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[5, 0]}
                  absolute
                />

                <View style={styles.categoryList}>
                  {pieData.sort((a, b) => b.amount - a.amount).map((item, index) => (
                    <View key={index} style={styles.categoryItem}>
                      <View style={[styles.categoryDot, { backgroundColor: item.color }]} />
                      <Text style={styles.categoryName}>{item.name}</Text>
                      <Text style={styles.categoryAmount}>R$ {item.amount.toFixed(2)}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.totalBadge}>
                  <Text style={styles.totalLabel}>Total no Mês</Text>
                  <Text style={styles.totalValue}>R$ {totalExpense.toFixed(2)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Feather name="pie-chart" size={32} color={theme.colors.placeholder} />
                </View>
                <Text style={styles.emptyText}>Nenhuma despesa encontrada</Text>
              </View>
            )}
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Balanço Mensal</Text>
            {barData && (barData.datasets[0].data[0] > 0 || barData.datasets[0].data[1] > 0) ? (
              <BarChart
                data={barData}
                width={screenWidth - 40}
                height={220}
                yAxisLabel="R$ "
                yAxisSuffix=""
                chartConfig={{
                  ...chartConfig,
                  color: (opacity = 1) => theme.colors.secondary,
                }}
                verticalLabelRotation={0}
                showValuesOnTopOfBars
                fromZero
                style={{
                  marginVertical: 8,
                  borderRadius: 16
                }}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Feather name="bar-chart-2" size={32} color={theme.colors.placeholder} />
                </View>
                <Text style={styles.emptyText}>Sem dados de comparação</Text>
              </View>
            )}
          </View>

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
  headerTitle: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },

  monthSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  arrowArea: { padding: 10 },
  monthLabelText: { color: '#FFF', fontSize: 18, fontWeight: '600', minWidth: 140, textAlign: 'center' },

  scrollContent: {
    paddingBottom: 40,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 20,
    marginHorizontal: 20,
    marginTop: 20,
    ...theme.shadows.soft,
    alignItems: 'center'
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 16,
    color: theme.colors.textPrimary,
    alignSelf: 'flex-start'
  },
  categoryList: {
    width: '100%',
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border + '50',
    paddingTop: 15,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 10,
  },
  categoryName: {
    flex: 1,
    fontSize: 14,
    color: theme.colors.textPrimary,
    fontWeight: '500',
  },
  categoryAmount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: theme.colors.textPrimary,
  },
  totalBadge: {
    marginTop: 10,
    backgroundColor: theme.colors.danger + '10',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 16,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.danger,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: theme.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyText: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: '500',
  }
});
