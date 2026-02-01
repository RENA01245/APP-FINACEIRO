
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRoute, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { ReportsViewModel } from '../../viewmodel/ReportsViewModel';
import { theme } from '../../design/theme';

const screenWidth = Dimensions.get('window').width;

export function ReportsScreen() {
  const [viewModel] = useState(() => new ReportsViewModel());
  const navigation = useNavigation();
  const route = useRoute<any>();
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
    await viewModel.nextMonth();
    loadData();
  };

  const handlePrevMonth = async () => {
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

      <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Feather name="arrow-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Relatórios</Text>
          <View style={{ width: 24 }} />
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
            <Text style={styles.chartTitle}>Despesas por Categoria</Text>
            {pieData.length > 0 ? (
              <>
                <PieChart
                  data={pieData}
                  width={screenWidth - 60}
                  height={220}
                  chartConfig={chartConfig}
                  accessor={"amount"}
                  backgroundColor={"transparent"}
                  paddingLeft={"15"}
                  center={[10, 0]}
                  absolute
                />
                <View style={styles.totalBadge}>
                  <Text style={styles.totalText}>Total: R$ {totalExpense.toFixed(2)}</Text>
                </View>
              </>
            ) : (
              <View style={styles.noDataContainer}>
                <Feather name="pie-chart" size={48} color={theme.colors.placeholder} />
                <Text style={styles.noDataText}>Sem despesas neste mês.</Text>
              </View>
            )}
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Receitas vs Despesas</Text>
            {barData && (barData.datasets[0].data[0] > 0 || barData.datasets[0].data[1] > 0) ? (
              <BarChart
                data={barData}
                width={screenWidth - 60}
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
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Feather name="bar-chart-2" size={48} color={theme.colors.placeholder} />
                <Text style={styles.noDataText}>Sem transações para comparar.</Text>
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
    padding: 20,
    paddingBottom: 40,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    ...theme.shadows.default,
    alignItems: 'center'
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 20,
    color: theme.colors.textPrimary,
    alignSelf: 'flex-start'
  },
  totalBadge: {
    marginTop: 20,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  totalText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.danger
  },
  noDataContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 30 },
  noDataText: {
    marginTop: 10,
    color: theme.colors.textSecondary,
    fontStyle: 'italic'
  }
});
