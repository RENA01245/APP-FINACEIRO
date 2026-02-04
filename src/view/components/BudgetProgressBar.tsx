import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useAppTheme } from '../../design/ThemeContext';

interface BudgetProgressBarProps {
  category: string;
  budget: number;
  spent: number;
  showLabel?: boolean;
}

export function BudgetProgressBar({ category, budget, spent, showLabel = true }: BudgetProgressBarProps) {
  const { theme, baseTheme } = useAppTheme();
  const styles = createStyles(theme, baseTheme);

  if (budget <= 0) return null;

  const percentage = Math.min((spent / budget) * 100, 100);
  const isOverBudget = spent > budget;

  let color = theme.secondary;
  if (percentage >= 80) color = '#ff9800';
  if (percentage >= 100) color = theme.danger;

  return (
    <View style={styles.container}>
      {showLabel && (
        <View style={styles.header}>
          <Text style={[styles.category, { color: theme.textPrimary }]}>{category}</Text>
          <Text style={[styles.values, { color: theme.textSecondary }]}>
            R$ {spent.toFixed(2)} / R$ {budget.toFixed(2)}
          </Text>
        </View>
      )}

      <View style={[styles.track, { backgroundColor: theme.border + '50' }]}>
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

function createStyles(theme: any, baseTheme: any) {
  return StyleSheet.create({
    container: {
      marginBottom: 12,
      backgroundColor: theme.surface,
      padding: 10,
      borderRadius: 8,
      ...baseTheme.shadows.soft
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    category: {
      fontWeight: 'bold',
      fontSize: 14,
    },
    values: {
      fontSize: 12,
    },
    track: {
      height: 8,
      borderRadius: 4,
      overflow: 'hidden',
    },
    bar: {
      height: '100%',
      borderRadius: 4,
    },
    warning: {
      color: theme.danger,
      fontSize: 10,
      marginTop: 4,
      fontWeight: 'bold',
    }
  });
}
