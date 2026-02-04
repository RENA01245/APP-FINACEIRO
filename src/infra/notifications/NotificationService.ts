import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export class NotificationService {
    static async requestPermissions() {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        return finalStatus === 'granted';
    }

    static async schedulePayableAlert(id: string, title: string, amount: number, dueDate: Date) {
        // Schedule for 1 day before at 9:00 AM
        const triggerDate = new Date(dueDate);
        triggerDate.setDate(triggerDate.getDate() - 1);
        triggerDate.setHours(9, 0, 0, 0);

        // If trigger date is in the past, don't schedule or schedule for right now + 1 min for testing?
        // For production, if past, skip.
        if (triggerDate.getTime() <= Date.now()) {
            return null;
        }

        const identifier = await Notifications.scheduleNotificationAsync({
            content: {
                title: '📢 Conta Próxima ao Vencimento',
                body: `Sua conta "${title}" de R$ ${amount.toFixed(2)} vence amanhã!`,
                data: { id },
            },
            trigger: {
                date: triggerDate instanceof Date ? triggerDate : new Date(triggerDate),
            } as Notifications.NotificationTriggerInput,
        });

        return identifier;
    }

    static async cancelAll() {
        await Notifications.cancelAllScheduledNotificationsAsync();
    }
}
