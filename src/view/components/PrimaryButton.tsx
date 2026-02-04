import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAppTheme } from '../../design/ThemeContext';

interface PrimaryButtonProps {
    title: string;
    onPress: () => void;
    loading?: boolean;
    disabled?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
    variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export function PrimaryButton({
    title,
    onPress,
    loading = false,
    disabled = false,
    style,
    textStyle,
    variant = 'primary'
}: PrimaryButtonProps) {
    const { theme, baseTheme, isDarkMode } = useAppTheme();
    const styles = createStyles(theme, baseTheme);

    const isPrimary = variant === 'primary';
    const isDanger = variant === 'danger';
    const isOutline = variant === 'outline';

    const getGradientColors = () => {
        if (disabled) return isDarkMode ? (['#333333', '#444444'] as const) : (['#E0E0E0', '#BDBDBD'] as const);
        if (isDanger) return isDarkMode ? (['#882222', '#AA3333'] as const) : (['#FF5252', '#D32F2F'] as const);
        if (isOutline || variant === 'secondary') return undefined;
        return theme.gradientPrimary;
    };

    const content = (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.container,
                isOutline && { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: theme.primary },
                variant === 'secondary' && { backgroundColor: isDarkMode ? '#2C2C2C' : '#E8EAF6' },
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={isOutline ? theme.primary : '#FFF'} />
            ) : (
                <Text style={[
                    styles.text,
                    isOutline && { color: theme.primary },
                    variant === 'secondary' && { color: theme.primary },
                    textStyle
                ]}>
                    {title}
                </Text>
            )}
        </TouchableOpacity>
    );

    const colors = getGradientColors();

    if (colors) {
        return (
            <LinearGradient
                colors={colors as readonly [string, string, ...string[]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={[styles.gradient, style]}
            >
                {content}
            </LinearGradient>
        );
    }

    return content;
}

function createStyles(theme: any, baseTheme: any) {
    return StyleSheet.create({
        gradient: {
            borderRadius: baseTheme.borderRadius.pill,
            width: '100%',
            ...baseTheme.shadows.default,
        },
        container: {
            paddingVertical: baseTheme.spacing.md,
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            borderRadius: baseTheme.borderRadius.pill,
        },
        text: {
            color: '#FFF',
            fontSize: baseTheme.typography.sizes.md,
            fontWeight: 'bold',
            letterSpacing: 0.5,
        }
    });
}
