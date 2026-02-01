
import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, ScrollView, TextInput, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../design/theme';
import { Category, DEFAULT_CATEGORIES } from '../../model/Category';
import { CategoryViewModel } from '../../viewmodel/CategoryViewModel';
import { PrimaryButton } from '../components/PrimaryButton';
import { CustomInput } from '../components/CustomInput';

const AVAILABLE_ICONS = ['coffee', 'truck', 'home', 'grid', 'activity', 'shopping-bag', 'briefcase', 'gift', 'book', 'wifi', 'smartphone', 'dollar-sign', 'umbrella', 'tool'];
const AVAILABLE_COLORS = ['#FF9800', '#2196F3', '#4CAF50', '#9C27B0', '#F44336', '#607D8B', '#E91E63', '#3F51B5', '#009688', '#795548'];

export function CategoriesScreen() {
    const navigation = useNavigation();
    const [viewModel] = useState(() => new CategoryViewModel());
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // New Category Form
    const [newName, setNewName] = useState('');
    const [newIcon, setNewIcon] = useState('grid');
    const [newColor, setNewColor] = useState(AVAILABLE_COLORS[0]);
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
        if (!newName.trim()) {
            Alert.alert('Erro', 'Informe o nome da categoria');
            return;
        }

        setSubmitting(true);
        try {
            await viewModel.addCategory(newName, newIcon, newColor);
            setModalVisible(false);
            setNewName('');
            setNewIcon('grid');
            setNewColor(AVAILABLE_COLORS[0]);
            loadCategories();
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        Alert.alert(
            'Excluir Categoria',
            'Tem certeza? Transações antigas podem ficar sem ícone.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Excluir',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await viewModel.deleteCategory(id);
                            loadCategories();
                        } catch (e: any) {
                            Alert.alert('Erro', 'Não foi possível excluir.');
                        }
                    }
                }
            ]
        );
    };

    const renderItem = ({ item }: { item: Category }) => (
        <View style={styles.card}>
            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                <Feather name={item.icon as any} size={24} color={item.color} />
            </View>
            <Text style={styles.cardName}>{item.name}</Text>
            {item.is_custom && (
                <TouchableOpacity onPress={() => item.id && handleDelete(item.id)} style={styles.deleteButton}>
                    <Feather name="trash-2" size={18} color={theme.colors.textSecondary} />
                </TouchableOpacity>
            )}
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Categorias</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <FlatList
                data={categories}
                keyExtractor={(item, index) => item.id || index.toString()}
                renderItem={renderItem}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={() => <View style={{ height: 100 }} />}
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Feather name="plus" size={24} color="#FFF" />
            </TouchableOpacity>

            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={false}
                presentationStyle='pageSheet'
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Nova Categoria</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Feather name="x" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView contentContainerStyle={{ padding: 20 }}>
                        <CustomInput
                            label="Nome da Categoria"
                            placeholder="Ex: Assinaturas"
                            value={newName}
                            onChangeText={setNewName}
                            icon="tag"
                        />

                        <Text style={styles.sectionLabel}>Ícone</Text>
                        <View style={styles.grid}>
                            {AVAILABLE_ICONS.map(icon => (
                                <TouchableOpacity
                                    key={icon}
                                    style={[
                                        styles.iconOption,
                                        newIcon === icon && { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary }
                                    ]}
                                    onPress={() => setNewIcon(icon)}
                                >
                                    <Feather name={icon as any} size={20} color={newIcon === icon ? '#FFF' : theme.colors.textSecondary} />
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.sectionLabel}>Cor</Text>
                        <View style={styles.grid}>
                            {AVAILABLE_COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[
                                        styles.colorOption,
                                        { backgroundColor: color },
                                        newColor === color && styles.colorOptionSelected
                                    ]}
                                    onPress={() => setNewColor(color)}
                                />
                            ))}
                        </View>

                        <View style={{ marginTop: 30 }}>
                            <PrimaryButton title="Salvar Categoria" onPress={handleAddCategory} loading={submitting} />
                        </View>
                    </ScrollView>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
        paddingTop: 50,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
    headerTitle: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },

    listContent: { padding: 20 },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        ...theme.shadows.soft
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 16
    },
    cardName: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, flex: 1 },
    deleteButton: { padding: 8 },

    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.default,
        elevation: 5
    },

    // Modal
    modalContainer: { flex: 1, backgroundColor: theme.colors.background }, // Full screen modal
    modalHeader: {
        padding: 20,
        paddingTop: 50, // SafeArea
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },

    sectionLabel: { fontSize: 16, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12, marginTop: 20 },
    grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
    iconOption: {
        width: 48,
        height: 48,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FFF'
    },
    colorOption: {
        width: 40,
        height: 40,
        borderRadius: 20,
    },
    colorOptionSelected: {
        borderWidth: 3,
        borderColor: theme.colors.textPrimary
    }
});
