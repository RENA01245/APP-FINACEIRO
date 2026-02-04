import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch, ScrollView, Alert, Image } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import { useAppTheme } from '../../design/ThemeContext';
import { AuthViewModel } from '../../viewmodel/AuthViewModel';
import { ObserveAuthState } from '../../usecase/auth/ObserveAuthState';

export function SettingsScreen() {
    const navigation = useNavigation<any>();
    const insets = useSafeAreaInsets();
    const { theme, isDarkMode, toggleTheme } = useAppTheme();
    const [authViewModel] = React.useState(() => new AuthViewModel());
    const [user, setUser] = React.useState<any>(null);

    React.useEffect(() => {
        const observer = new ObserveAuthState();
        const { data } = observer.execute((session: any) => {
            setUser(session?.user);
        });
        return () => data.subscription.unsubscribe();
    }, []);

    const handleLogout = () => {
        Alert.alert('Sair', 'Deseja realmente sair da sua conta?', [
            { text: 'Cancelar', style: 'cancel' },
            {
                text: 'Sair',
                style: 'destructive',
                onPress: () => {
                    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                    authViewModel.logout();
                }
            }
        ]);
    };

    const SettingItem = ({ icon, title, value, type = 'link', onPress }: any) => (
        <TouchableOpacity
            style={[styles.item, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}
            onPress={onPress}
            disabled={type === 'switch'}
            activeOpacity={0.7}
        >
            <View style={styles.itemLeft}>
                <View style={[styles.iconContainer, { backgroundColor: theme.primary + '15' }]}>
                    <Feather name={icon} size={20} color={theme.primary} />
                </View>
                <Text style={[styles.itemTitle, { color: theme.textPrimary }]}>{title}</Text>
            </View>

            {type === 'switch' ? (
                <Switch
                    value={value}
                    onValueChange={onPress}
                    trackColor={{ false: theme.border, true: theme.primary + '80' }}
                    thumbColor={value ? theme.primary : '#f4f3f4'}
                />
            ) : (
                <Feather name="chevron-right" size={20} color={theme.textSecondary} />
            )}
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { backgroundColor: theme.background }]}>
            <LinearGradient colors={theme.gradientPrimary} style={[styles.header, { paddingTop: insets.top + 10 }]}>
                <View style={styles.headerTop}>
                    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                        <Feather name="arrow-left" size={24} color="#FFF" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Ajustes</Text>
                    <View style={{ width: 24 }} />
                </View>

                <View style={styles.profileContainer}>
                    <View style={styles.avatarContainer}>
                        <Image
                            source={{ uri: `https://ui-avatars.com/api/?name=${user?.email || 'User'}&background=random` }}
                            style={styles.avatar}
                        />
                    </View>
                    <View style={styles.profileInfo}>
                        <Text style={styles.userName}>Minha Conta</Text>
                        <Text style={styles.userEmail}>{user?.email || 'loading...'}</Text>
                    </View>
                </View>
            </LinearGradient>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>PREFERÊNCIAS</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="moon"
                        title="Modo Escuro"
                        type="switch"
                        value={isDarkMode}
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                            toggleTheme();
                        }}
                    />
                    <SettingItem
                        icon="grid"
                        title="Gerenciar Categorias"
                        onPress={() => navigation.navigate('Categories')}
                    />
                    <SettingItem
                        icon="credit-card"
                        title="Meus Cartões"
                        onPress={() => navigation.navigate('Cards')}
                    />
                </View>

                <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>CONTA</Text>
                <View style={styles.section}>
                    <SettingItem
                        icon="log-out"
                        title="Sair da Conta"
                        onPress={handleLogout}
                    />
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.versionText, { color: theme.textSecondary }]}>Versão 1.0.2 Premium</Text>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    header: {
        paddingBottom: 30,
        paddingHorizontal: 20,
        borderBottomLeftRadius: 35,
        borderBottomRightRadius: 35,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20
    },
    backButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: 12
    },
    headerTitle: {
        fontSize: 18,
        color: '#FFF',
        fontWeight: 'bold'
    },
    profileContainer: { flexDirection: 'row', alignItems: 'center' },
    avatarContainer: {
        width: 70,
        height: 70,
        borderRadius: 35,
        borderWidth: 3,
        borderColor: 'rgba(255,255,255,0.3)',
        overflow: 'hidden',
        backgroundColor: '#FFF'
    },
    avatar: { width: '100%', height: '100%' },
    profileInfo: { marginLeft: 20 },
    userName: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
    userEmail: { color: 'rgba(255,255,255,0.7)', fontSize: 14, marginTop: 2 },

    scrollContent: { padding: 20 },
    sectionTitle: { fontSize: 13, fontWeight: '700', marginBottom: 10, marginLeft: 10, letterSpacing: 1 },
    section: { borderRadius: 20, overflow: 'hidden', marginBottom: 25 },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 18,
        borderBottomWidth: 1,
    },
    itemLeft: { flexDirection: 'row', alignItems: 'center' },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 15
    },
    itemTitle: { fontSize: 16, fontWeight: '600' },
    footer: { alignItems: 'center', marginTop: 20, marginBottom: 40 },
    versionText: { fontSize: 12, fontWeight: '500' }
});
