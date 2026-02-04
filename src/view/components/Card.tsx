import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { useAppTheme } from '../../design/ThemeContext';

interface CardProps {
    children: React.ReactNode;
    style?: ViewStyle;
    variant?: 'default' | 'flat' | 'outlined';
}

export function Card({ children, style, variant = 'default' }: CardProps) {
    const { theme, baseTheme } = useAppTheme();
    const styles = createStyles(theme, baseTheme);

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

function createStyles(theme: any, baseTheme: any) {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.surface,
            borderRadius: baseTheme.borderRadius.md,
            padding: baseTheme.spacing.md,
        },
        elevation: {
            ...baseTheme.shadows.default,
        },
        outlined: {
            borderWidth: 1,
            borderColor: theme.border,
        }
    });
}
