
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../design/theme';

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

    const isPrimary = variant === 'primary';
    const isDanger = variant === 'danger';
    const isOutline = variant === 'outline';

    const getGradientColors = () => {
        if (disabled) return ['#E0E0E0', '#BDBDBD'] as const;
        if (isDanger) return ['#FF5252', '#D32F2F'] as const;
        if (isOutline || variant === 'secondary') return undefined; // No gradient for outline/secondary
        return theme.colors.gradientPrimary;
    };

    const content = (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.8}
            style={[
                styles.container,
                isOutline && styles.outlineContainer,
                variant === 'secondary' && styles.secondaryContainer,
                style
            ]}
        >
            {loading ? (
                <ActivityIndicator color={isOutline ? theme.colors.primary : '#FFF'} />
            ) : (
                <Text style={[
                    styles.text,
                    isOutline && styles.outlineText,
                    variant === 'secondary' && styles.secondaryText,
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
                colors={colors}
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

const styles = StyleSheet.create({
    gradient: {
        borderRadius: theme.borderRadius.pill,
        width: '100%',
        ...theme.shadows.default,
    },
    container: {
        paddingVertical: theme.spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        borderRadius: theme.borderRadius.pill,
    },
    text: {
        color: '#FFF',
        fontSize: theme.typography.sizes.md,
        fontWeight: 'bold',
        letterSpacing: 0.5,
    },
    outlineContainer: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: theme.colors.primary,
    },
    outlineText: {
        color: theme.colors.primary,
    },
    secondaryContainer: {
        backgroundColor: '#E8EAF6',
    },
    secondaryText: {
        color: theme.colors.primary,
    }
});
