
import React, { useState } from 'react';
import { View, TextInput, StyleSheet, Text, TextInputProps, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { theme } from '../../design/theme';

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
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.wrapper}>
            {label && <Text style={styles.label}>{label}</Text>}

            <View style={[
                styles.container,
                isFocused && styles.focused,
                !!error && styles.errorBorder,
                style
            ]}>
                {icon && (
                    <Feather
                        name={icon}
                        size={20}
                        color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                        style={styles.icon}
                    />
                )}

                <TextInput
                    style={styles.input}
                    placeholderTextColor={theme.colors.placeholder}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    {...props}
                />

                {rightAction && (
                    <TouchableOpacity onPress={rightAction.onPress} style={styles.rightAction}>
                        <Feather name={rightAction.icon} size={20} color={theme.colors.textSecondary} />
                    </TouchableOpacity>
                )}
            </View>

            {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        marginBottom: theme.spacing.md,
        width: '100%',
    },
    label: {
        fontSize: theme.typography.sizes.sm,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
        fontWeight: '600',
        marginLeft: theme.spacing.xs,
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        paddingHorizontal: theme.spacing.md,
        height: 56,
    },
    focused: {
        borderColor: theme.colors.primary,
        borderWidth: 1.5,
    },
    errorBorder: {
        borderColor: theme.colors.danger,
    },
    icon: {
        marginRight: theme.spacing.sm,
    },
    input: {
        flex: 1,
        height: '100%',
        color: theme.colors.textPrimary,
        fontSize: theme.typography.sizes.md,
    },
    rightAction: {
        marginLeft: theme.spacing.sm,
        padding: theme.spacing.xs,
    },
    errorText: {
        color: theme.colors.danger,
        fontSize: theme.typography.sizes.xs,
        marginTop: theme.spacing.xs,
        marginLeft: theme.spacing.xs,
    }
});
