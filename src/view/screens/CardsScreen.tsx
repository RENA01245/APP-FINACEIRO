
import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, Alert, ScrollView, StatusBar } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';

import { theme } from '../../design/theme';
import { CreditCard } from '../../model/CreditCard';
import { CardViewModel } from '../../viewmodel/CardViewModel';
import { PrimaryButton } from '../components/PrimaryButton';
import { CustomInput } from '../components/CustomInput';

const CARD_COLORS = ['#2196F3', '#4CAF50', '#E91E63', '#9C27B0', '#000000', '#FF9800', '#607D8B'];

export function CardsScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
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
            onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Here we could open more details or transactions for this card
            }}
            onLongPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                item.id && handleDelete(item.id);
            }}
            activeOpacity={0.8}
        >
            <LinearGradient
                colors={[item.color, item.color + 'CC']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cardGradient}
            >
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardName}>{item.name}</Text>
                        <Text style={styles.cardType}>Crédito</Text>
                    </View>
                    <View style={styles.cardChip}>
                        <Feather name="credit-card" size={24} color="#FFF" />
                    </View>
                </View>

                <View style={styles.cardBody}>
                    <Text style={styles.cardLabel}>Limite Disponível</Text>
                    <Text style={styles.cardValue}>R$ {item.limit_amount.toFixed(2)}</Text>
                </View>

                <View style={styles.cardFooter}>
                    <View style={styles.cardFooterItem}>
                        <Feather name="calendar" size={10} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.cardSubLabel}> FECHAMENTO: {item.closing_day}</Text>
                    </View>
                    <View style={styles.cardFooterItem}>
                        <Feather name="clock" size={10} color="rgba(255,255,255,0.7)" />
                        <Text style={styles.cardSubLabel}> VENCIMENTO: {item.due_day}</Text>
                    </View>
                </View>
            </LinearGradient>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" />
            <LinearGradient colors={theme.colors.gradientPrimary} style={[styles.header, { paddingTop: insets.top + 10 }]}>
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
                        <View style={styles.emptyIconCircle}>
                            <Feather name="credit-card" size={40} color={theme.colors.placeholder} />
                        </View>
                        <Text style={styles.emptyText}>Nenhum cartão cadastrado.</Text>
                    </View>
                )}
            />

            <TouchableOpacity
                style={styles.fab}
                onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setModalVisible(true);
                }}
            >
                <Feather name="plus" size={24} color="#FFF" />
            </TouchableOpacity>

            <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setModalVisible(false)}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Novo Cartão</Text>
                        <TouchableOpacity onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            setModalVisible(false);
                        }}>
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
                                    onPress={() => {
                                        Haptics.selectionAsync();
                                        setSelectedColor(color);
                                    }}
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
        paddingTop: 0,
        paddingBottom: 20,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    backButton: { padding: 8, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 },
    headerTitle: { fontSize: 18, color: '#FFF', fontWeight: 'bold' },

    listContent: { padding: 20, paddingBottom: 100 },
    cardItem: {
        marginBottom: 20,
        borderRadius: 24,
        overflow: 'hidden',
        ...theme.shadows.default,
        height: 190
    },
    cardGradient: { padding: 24, flex: 1, justifyContent: 'space-between' },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    cardName: { color: '#FFF', fontSize: 22, fontWeight: 'bold', letterSpacing: 0.5 },
    cardType: { color: 'rgba(255,255,255,0.7)', fontSize: 12, marginTop: 2 },
    cardChip: { width: 44, height: 32, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    cardBody: { marginTop: 10 },
    cardLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 },
    cardValue: { color: '#FFF', fontSize: 28, fontWeight: 'bold', marginTop: 4 },
    cardFooter: { flexDirection: 'row', gap: 20 },
    cardFooterItem: { flexDirection: 'row', alignItems: 'center' },
    cardSubLabel: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '700' },

    fab: {
        position: 'absolute',
        bottom: 30,
        right: 30,
        width: 64,
        height: 64,
        borderRadius: 20, // Material 3 shape
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        ...theme.shadows.default,
        elevation: 5
    },

    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 100
    },
    emptyIconCircle: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#FFF',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
        ...theme.shadows.soft
    },
    emptyText: { color: theme.colors.textSecondary, fontSize: 16, fontWeight: '500' },

    modalContent: { flex: 1, backgroundColor: theme.colors.background },
    modalHeader: {
        padding: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border + '40'
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold' },
    row: { flexDirection: 'row', justifyContent: 'space-between' },
    label: { fontSize: 14, fontWeight: '600', color: theme.colors.textPrimary, marginBottom: 12, marginTop: 10 },
    colorGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 20 },
    colorOption: { width: 48, height: 48, borderRadius: 24, ...theme.shadows.soft },
    colorOptionSelected: { borderWidth: 3, borderColor: '#FFF', elevation: 4 }
});
