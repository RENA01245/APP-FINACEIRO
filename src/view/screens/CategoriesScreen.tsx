import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, ScrollView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { Category } from '../../model/Category';
import { CategoryViewModel } from '../../viewmodel/CategoryViewModel';
import { PrimaryButton } from '../components/PrimaryButton';
import { CustomInput } from '../components/CustomInput';
import { useAppTheme } from '../../design/ThemeContext';

const AVAILABLE_ICONS: (keyof typeof Feather.glyphMap)[] = ['coffee', 'truck', 'home', 'grid', 'activity', 'shopping-bag', 'briefcase', 'gift', 'book', 'wifi', 'smartphone', 'dollar-sign', 'umbrella', 'tool'];
const AVAILABLE_COLORS = ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#F44336', '#607D8B', '#E91E63', '#3F51B5', '#009688', '#795548'];

export function CategoriesScreen() {
    const { theme, baseTheme, isDarkMode } = useAppTheme();
    const styles = createStyles(theme, baseTheme);
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<any>();
    const [viewModel] = useState(() => new CategoryViewModel());
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    const [name, setName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState<(keyof typeof Feather.glyphMap)>(AVAILABLE_ICONS[0]);
    const [selectedColor, setSelectedColor] = useState(AVAILABLE_COLORS[0]);
    const [submitting, setSubmitting] = useState(false);

    const loadCategories = async () => {
        setLoading(true);
        try {
            const data = await viewModel.getCategories();
            setCategories(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCategories();
        }, [])
    );

    const handleAddCategory = async () => {
        if (!name) {
            Alert.alert('Erro', 'O nome é obrigatório.');
            return;
        }

        setSubmitting(true);
        try {
            await viewModel.addCategory(name, selectedIcon, selectedColor);
            setModalVisible(false);
            setName('');
            loadCategories();
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Excluir Categoria', 'Tem certeza?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir', style: 'destructive', onPress: async () => {
                    await viewModel.deleteCategory(id);
                    loadCategories();
                }
            }
        ]);
    };

    const renderItem = ({ item }: { item: Category }) => (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: theme.surface, borderBottomColor: theme.border + '30' }]}
            onLongPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                item.id && handleDelete(item.id);
            }}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: item.color + '15' }]}>
                <Feather name={item.icon as any} size={20} color={item.color} />
            </View>
            <Text style={[styles.itemName, { color: theme.textPrimary }]}>{item.name}</Text>
            <Feather name="chevron-right" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
            <LinearGradient colors={theme.gradientPrimary} style={[styles.header, { paddingTop: insets.top }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            navigation.goBack();
                        }}
                        style={styles.backButton}
                    >
                        <Feather name="arrow-left" size={20} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Categorias</Text>
                    <View style={{ width: 40 }} />
                </View>
                <Text style={styles.headerSubtitle}>Gerencie suas categorias de gastos</Text>
            </LinearGradient>

            <FlatList
                data={categories}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={renderItem}
                contentContainerStyle={{
                    padding: 20,
                    paddingBottom: 40 + insets.bottom
                }}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <View style={[styles.emptyIconCircle, { backgroundColor: theme.surface }]}>
                            <Feather name="grid" size={40} color={theme.placeholder} />
                        </View>
                        <Text style={[styles.emptyText, { color: theme.textSecondary }]}>Nenhuma categoria personalizada.</Text>
                    </View>
                )}
            />

            <TouchableOpacity
                style={[styles.fab, { backgroundColor: theme.primary }]}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setModalVisible(true);
                }}
            >
                <Feather name="plus" size={24} color="#FFF" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
                <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                    <View style={[styles.modalHeader, { borderBottomColor: theme.border + '40' }]}>
                        <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>Nova Categoria</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Feather name="x" size={24} color={theme.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ padding: 20 }} showsVerticalScrollIndicator={false}>
                        <CustomInput label="Nome da Categoria" placeholder="Ex: Presentes, Academia..." value={name} onChangeText={setName} />

                        <Text style={[styles.label, { color: theme.textPrimary }]}>Ícone</Text>
                        <View style={styles.iconGrid}>
                            {AVAILABLE_ICONS.map(icon => (
                                <TouchableOpacity
                                    key={icon}
                                    style={[styles.iconOption, { backgroundColor: theme.surface, borderColor: theme.border }, selectedIcon === icon && { borderColor: theme.primary, backgroundColor: theme.primary + '10' }]}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setSelectedIcon(icon);
                                    }}
                                >
                                    <Feather name={icon} size={20} color={selectedIcon === icon ? theme.primary : theme.textSecondary} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={[styles.label, { color: theme.textPrimary }]}>Cor</Text>
                        <View style={styles.colorGrid}>
                            {AVAILABLE_COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.colorOptionSelected]}
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setSelectedColor(color);
                                    }}
                                />
                            ))}
                        </View>

                        <View style={{ marginTop: 20 }}>
                            <PrimaryButton title="Adicionar" onPress={handleAddCategory} loading={submitting} />
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

function createStyles(theme: any, baseTheme: any) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.background },
        header: {
            paddingBottom: 25,
            paddingHorizontal: 20,
            borderBottomLeftRadius: 30,
            borderBottomRightRadius: 30,
        },
        headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
        backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
        headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#FFF' },
        headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.7)', marginTop: 4 },

        listContent: { padding: 20, paddingBottom: 100 },
        item: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 16,
            marginBottom: 12,
            borderBottomWidth: 1,
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: 16,
        },
        itemName: { flex: 1, fontSize: 16, fontWeight: '600' },

        fab: {
            position: 'absolute',
            bottom: 30,
            right: 30,
            width: 64,
            height: 64,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            ...baseTheme.shadows.default,
            elevation: 5
        },

        emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingTop: 100 },
        emptyIconCircle: {
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 20,
            ...baseTheme.shadows.soft
        },
        emptyText: { fontSize: 14, fontWeight: '500' },

        modalContent: { flex: 1 },
        modalHeader: {
            padding: 20,
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottomWidth: 1,
        },
        modalTitle: { fontSize: 20, fontWeight: 'bold' },
        label: { fontSize: 14, fontWeight: '600', marginBottom: 12, marginTop: 20 },
        iconGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
        iconOption: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
        colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
        colorOption: { width: 36, height: 36, borderRadius: 18, ...baseTheme.shadows.soft },
        colorOptionSelected: { borderWidth: 3, borderColor: '#FFF', elevation: 4 }
    });
}
