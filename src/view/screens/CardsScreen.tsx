
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, ScrollView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

import { theme } from '../../design/theme';
import { CreditCard } from '../../model/CreditCard';
import { CardViewModel } from '../../viewmodel/CardViewModel';
import { PrimaryButton } from '../components/PrimaryButton';
import { CustomInput } from '../components/CustomInput';

const CARD_COLORS = ['#2196F3', '#4CAF50', '#E91E63', '#9C27B0', '#000000', '#FF9800', '#607D8B'];

export function CardsScreen() {
    const navigation = useNavigation();
    const [viewModel] = useState(() => new CardViewModel());
    const [cards, setCards] = useState<CreditCard[]>([]);
    const [loading, setLoading] = useState(false);
    const [modalVisible, setModalVisible] = useState(false);

    // New Card Form
    const [name, setName] = useState('');
    const [limit, setLimit] = useState('');
    const [closingDay, setClosingDay] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);
    const [submitting, setSubmitting] = useState(false);

    const loadCards = async () => {
        setLoading(true);
        try {
            const data = await viewModel.getCards();
            setCards(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadCards();
        }, [])
    );

    const handleAddCard = async () => {
        if (!name || !limit || !closingDay || !dueDay) {
            Alert.alert('Erro', 'Preencha todos os campos.');
            return;
        }

        setSubmitting(true);
        try {
            await viewModel.addCard(
                name,
                parseFloat(limit),
                parseInt(closingDay),
                parseInt(dueDay),
                selectedColor
            );
            setModalVisible(false);
            setName('');
            setLimit('');
            setClosingDay('');
            setDueDay('');
            loadCards();
        } catch (error: any) {
            Alert.alert('Erro', error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = (id: string) => {
        Alert.alert('Excluir Cartão', 'Tem certeza? Transações vinculadas perderão o vínculo.', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Excluir', style: 'destructive', onPress: async () => {
                    await viewModel.deleteCard(id);
                    loadCards();
                }
            }
        ]);
    };

    const renderCard = ({ item }: { item: CreditCard }) => (
        <TouchableOpacity
            style={styles.cardItem}
            onLongPress={() => item.id && handleDelete(item.id)}
            activeOpacity={0.8}
        >
            <LinearGradient colors={[item.color, item.color + 'CC']} style={styles.cardGradient}>
                <View style={styles.cardHeader}>
                    <Text style={styles.cardName}>{item.name}</Text>
                    <Feather name="credit-card" size={24} color="rgba(255,255,255,0.7)" />
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.cardLabel}>Limite Total</Text>
                    <Text style={styles.cardValue}>R$ {item.limit_amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                </View>

                <View style={styles.cardFooter}>
                    <View>
                        <Text style={styles.cardSubLabel}>Fechamento</Text>
                        <Text style={styles.cardSubValue}>Dia {item.closing_day}</Text>
                    </View>
                    <View>
                        <Text style={styles.cardSubLabel}>Vencimento</Text>
                        <Text style={styles.cardSubValue}>Dia {item.due_day}</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={theme.colors.gradientPrimary} style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Meus Cartões</Text>
                    <View style={{ width: 40 }} />
                </View>
            </LinearGradient>

            <FlatList
                data={cards}
                keyExtractor={(item) => item.id!}
                renderItem={renderCard}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={() => (
                    <View style={styles.emptyContainer}>
                        <Feather name="credit-card" size={64} color={theme.colors.border} />
                        <Text style={styles.emptyText}>Nenhum cartão cadastrado.</Text>
                    </View>
                )}
            />

            <TouchableOpacity style={styles.fab} onPress={() => setModalVisible(true)}>
                <Feather name="plus" size={24} color="#FFF" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Novo Cartão</Text>
                        <TouchableOpacity onPress={() => setModalVisible(false)}>
                            <Feather name="x" size={24} color={theme.colors.textPrimary} />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={{ padding: 20 }}>
                        <CustomInput label="Apelido do Cartão" placeholder="Ex: Nubank, Inter..." value={name} onChangeText={setName} icon="tag" />
                        <CustomInput label="Limite Total" placeholder="0.00" value={limit} onChangeText={setLimit} keyboardType="numeric" icon="dollar-sign" />

                        <View style={styles.row}>
                            <View style={{ flex: 1, marginRight: 10 }}>
                                <CustomInput label="Dia Fechamento" placeholder="Ex: 5" value={closingDay} onChangeText={setClosingDay} keyboardType="numeric" icon="calendar" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <CustomInput label="Dia Vencimento" placeholder="Ex: 12" value={dueDay} onChangeText={setDueDay} keyboardType="numeric" icon="calendar" />
                            </View>
                        </View>

                        <Text style={styles.label}>Cor do Cartão</Text>
                        <View style={styles.colorGrid}>
                            {CARD_COLORS.map(color => (
                                <TouchableOpacity
                                    key={color}
                                    style={[styles.colorOption, { backgroundColor: color }, selectedColor === color && styles.colorOptionSelected]}
                                    onPress={() => setSelectedColor(color)}
                                />
                            ))}
                        </View>

                        <View style={{ marginTop: 20 }}>
                            <PrimaryButton title="Cadastrar Cartão" onPress={handleAddCard} loading={submitting} />
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
    cardItem: { marginBottom: 20, borderRadius: 20, overflow: 'hidden', ...theme.shadows.default },
    cardGradient: { padding: 20, height: 180, justifyContent: 'space-between' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardName: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    cardBody: { marginTop: 10 },
    cardLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 12, textTransform: 'uppercase' },
    cardValue: { color: '#FFF', fontSize: 24, fontWeight: 'bold' },
    cardFooter: { flexDirection: 'row', justifyContent: 'space-between' },
    cardSubLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 10, textTransform: 'uppercase' },
    cardSubValue: { color: '#FFF', fontSize: 14, fontWeight: '600' },

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

    emptyContainer: { alignItems: 'center', marginTop: 100 },
    emptyText: { marginTop: 20, color: theme.colors.textSecondary, fontSize: 16 },

    modalContent: { flex: 1, backgroundColor: theme.colors.background },
    modalHeader: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 10, marginTop: 10 },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 20 },
    colorOption: { width: 44, height: 44, borderRadius: 22 },
    colorOptionSelected: { borderWidth: 3, borderColor: theme.colors.textPrimary }
});
