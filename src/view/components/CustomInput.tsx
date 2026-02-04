import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useAppTheme } from '../../design/ThemeContext';

interface CustomInputProps extends TextInputProps {
    label?: string;
    icon?: keyof typeof Feather.glyphMap;
    error?: string;
    rightAction?: {
        icon: keyof typeof Feather.glyphMap;
        onPress: () => void;
    };
}

export function CustomInput({
    label,
    icon,
    error,
    rightAction,
    style,
    ...props
}: CustomInputProps) {
    const { theme, baseTheme } = useAppTheme();
    const styles = createStyles(theme, baseTheme);
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.wrapper}>
            {label && <Text style={[styles.label, { color: theme.textPrimary }]}>{label}</Text>}

            <View style={[
                styles.container,
                { backgroundColor: theme.surface, borderColor: theme.border },
                isFocused && { borderColor: theme.primary, borderWidth: 1.5 },
                !!error && { borderColor: theme.danger },
                style
            ]}>
                {icon && (
                    <Feather
                        name={icon}
                        size={20}
                        color={isFocused ? theme.primary : theme.textSecondary}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={[styles.input, { color: theme.textPrimary }]}
                    placeholderTextColor={theme.placeholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {rightAction && (
                    <TouchableOpacity onPress={rightAction.onPress} style={styles.rightAction}>
                        <Feather name={rightAction.icon} size={20} color={theme.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={[styles.errorText, { color: theme.danger }]}>{error}</Text>}
        </View>
    );
}

function createStyles(theme: any, baseTheme: any) {
    return StyleSheet.create({
        wrapper: {
            marginBottom: baseTheme.spacing.md,
            width: '100%',
        },
        label: {
            fontSize: baseTheme.typography.sizes.sm,
            marginBottom: baseTheme.spacing.xs,
            fontWeight: '600',
            marginLeft: baseTheme.spacing.xs,
        },
        container: {
            flexDirection: 'row',
            alignItems: 'center',
            borderWidth: 1,
            borderRadius: baseTheme.borderRadius.md,
            paddingHorizontal: baseTheme.spacing.md,
            height: 56,
        },
        icon: {
            marginRight: baseTheme.spacing.sm,
        },
        input: {
            flex: 1,
            height: '100%',
            fontSize: baseTheme.typography.sizes.md,
        },
        rightAction: {
            marginLeft: baseTheme.spacing.sm,
            padding: baseTheme.spacing.xs,
        },
        errorText: {
            fontSize: baseTheme.typography.sizes.xs,
            marginTop: baseTheme.spacing.xs,
            marginLeft: baseTheme.spacing.xs,
        }
    });
}
