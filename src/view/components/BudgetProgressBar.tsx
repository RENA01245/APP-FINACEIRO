import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface BudgetProgressBarProps {
  category: string;
  budget: number;
  spent: number;
  showLabel?: boolean;
}

export function BudgetProgressBar({ category, budget, spent, showLabel = true }: BudgetProgressBarProps) {
  // Se não houver orçamento definido, não mostra nada (ou mostra diferente)
  if (budget <= 0) return null;

  const percentage = Math.min((spent / budget) * 100, 100);
  const isOverBudget = spent > budget;

  // Cores baseadas no percentual
  let color = '#4caf50'; // Verde
  if (percentage >= 80) color = '#ff9800'; // Laranja
  if (percentage >= 100) color = '#f44336'; // Vermelho

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.header}>
          <Text style={styles.category}>{category}</Text>
          <Text style={styles.values}>
            R$ {spent.toFixed(2)} / R$ {budget.toFixed(2)}
          </Text>
        </View>
      )}

      <View style={styles.track}>
        <View
          style={[
            styles.bar,
            {
              width: `${percentage}%`,
              backgroundColor: color
            }
          ]}
        />
      </View>

      {isOverBudget && (
        <Text style={styles.warning}>Excedido em R$ {(spent - budget).toFixed(2)}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 12,
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    elevation: 1, // Sombra leve no Android
    shadowColor: '#000', // Sombra no iOS
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  category: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#333',
  },
  values: {
    fontSize: 12,
    color: '#666',
  },
  track: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 4,
  },
  warning: {
    color: '#f44336',
    fontSize: 10,
    marginTop: 4,
    fontWeight: 'bold',
  }
});
