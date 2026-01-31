import { PayableRepositorySupabase } from '../../infra/repositories/PayableRepositorySupabase';
import { Payable } from '../../model/Payable';
import * as Notifications from 'expo-notifications';

export class AddPayable {
  private repo: PayableRepositorySupabase;

  constructor() {
    this.repo = new PayableRepositorySupabase();
  }

  async execute(payable: Payable) {
    if (!payable.user_id) throw new Error('User ID required');
    if (!payable.amount) throw new Error('Amount required');
    if (!payable.due_date) throw new Error('Due date required');

    const createdPayable = await this.repo.add(payable);

    // Schedule Notification
    this.scheduleNotification(createdPayable);
  }

  private async scheduleNotification(payable: Payable) {
    try {
      const dueDate = new Date(payable.due_date);
      // Schedule for 9 AM on the due date
      const trigger = new Date(dueDate);
      trigger.setHours(9, 0, 0, 0);

      // If due date is today or passed, schedule for 1 minute from now (for testing/immediate awareness)
      // or just don't schedule if it's too late. Let's schedule only if future.
      // if (trigger.getTime() > Date.now()) {
      //   await Notifications.scheduleNotificationAsync({
      //     content: {
      //       title: "Conta a Vencer! 💸",
      //       body: `Não esqueça de pagar: ${payable.description} - R$ ${payable.amount.toFixed(2)}`,
      //     },
      //     trigger: {
      //       date: trigger, // Valid for expo-notifications
      //     } as any, // Type cast to avoid TS issues with specific trigger types
      //   });
      // }
    } catch (e) {
      console.error('Failed to schedule notification', e);
    }
  }
}
