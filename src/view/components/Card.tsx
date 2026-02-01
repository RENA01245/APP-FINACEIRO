
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { theme } from '../../design/theme';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'flat' | 'outlined';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
    return (
        <View style={[
            styles.container,
            variant === 'default' && styles.elevation,
            variant === 'outlined' && styles.outlined,
            style
        ]}>
            {children}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
    },
    elevation: {
        ...theme.shadows.default,
    },
    outlined: {
        borderWidth: 1,
        borderColor: theme.colors.border,
    }
});
