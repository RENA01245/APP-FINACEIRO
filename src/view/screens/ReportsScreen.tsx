import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { ReportsViewModel } from '../../viewmodel/ReportsViewModel';
import { Transaction } from '../../model/Transaction';

const screenWidth = Dimensions.get('window').width;

export function ReportsScreen() {
  const [viewModel] = useState(() => new ReportsViewModel());
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
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 2,
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePrevMonth} style={styles.arrowButton}>
          <Feather name="chevron-left" size={28} color="#333" />
        </TouchableOpacity>
        <Text style={styles.monthLabel}>{monthLabel}</Text>
        <TouchableOpacity onPress={handleNextMonth} style={styles.arrowButton}>
          <Feather name="chevron-right" size={28} color="#333" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" style={{ marginTop: 50 }} />
      ) : (
        <ScrollView contentContainerStyle={styles.scrollContent}>
            
          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Despesas por Categoria</Text>
            {pieData.length > 0 ? (
                <>
                <PieChart
                data={pieData}
                width={screenWidth - 30}
                height={220}
                chartConfig={chartConfig}
                accessor={"amount"}
                backgroundColor={"transparent"}
                paddingLeft={"15"}
                center={[10, 0]}
                absolute
                />
                <Text style={styles.totalText}>Total Despesas: R$ {totalExpense.toFixed(2)}</Text>
                </>
            ) : (
                <Text style={styles.noDataText}>Sem despesas neste mês.</Text>
            )}
          </View>

          <View style={styles.chartContainer}>
            <Text style={styles.chartTitle}>Receitas vs Despesas</Text>
            {barData && (barData.datasets[0].data[0] > 0 || barData.datasets[0].data[1] > 0) ? (
                 <BarChart
                 data={barData}
                 width={screenWidth - 30}
                 height={220}
                 yAxisLabel="R$ "
                 yAxisSuffix=""
                 chartConfig={{
                     ...chartConfig,
                     color: (opacity = 1) => `rgba(63, 81, 181, ${opacity})`,
                 }}
                 verticalLabelRotation={0}
                 showValuesOnTopOfBars
               />
            ) : (
                <Text style={styles.noDataText}>Sem dados neste mês.</Text>
            )}
           
          </View>

        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    elevation: 2,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  arrowButton: {
    padding: 5,
  },
  scrollContent: {
    padding: 15,
    paddingBottom: 40,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    alignItems: 'center'
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
    alignSelf: 'flex-start'
  },
  totalText: {
      marginTop: 10,
      fontSize: 16,
      fontWeight: 'bold',
      color: '#555'
  },
  noDataText: {
      marginVertical: 20,
      color: '#999',
      fontStyle: 'italic'
  }
});
