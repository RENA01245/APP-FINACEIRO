import { AddPayable } from '../usecase/payables/AddPayable';
import { GetPendingPayables } from '../usecase/payables/GetPendingPayables';
import { PayAccount } from '../usecase/payables/PayAccount';
import { GetSession } from '../usecase/auth/GetSession';
import { Payable } from '../model/Payable';
import { NotificationService } from '../infra/services/NotificationService';

export class PayablesViewModel {
  private addUseCase = new AddPayable();
  private getPendingUseCase = new GetPendingPayables();
  private payUseCase = new PayAccount();
  private getSessionUseCase = new GetSession();

  async getPending(): Promise<Payable[]> {
    const session = await this.getSessionUseCase.execute();
    if (!session?.user) throw new Error('Usuário não autenticado');
    return await this.getPendingUseCase.execute(session.user.id);
  }

  async add(description: string, amount: string, date: Date) {
    const session = await this.getSessionUseCase.execute();
    if (!session?.user) throw new Error('Usuário não autenticado');

    const sanitizedAmount = amount.replace(',', '.');
    const value = parseFloat(sanitizedAmount);
    if (isNaN(value) || value <= 0) throw new Error('Valor inválido');

    if (!description) throw new Error('Descrição obrigatória');

    const createdPayable = await this.addUseCase.execute({
      user_id: session.user.id,
      description,
      amount: value,
      due_date: date.toISOString(),
      status: 'pending'
    });

    // Schedule notification for 9:00 AM on due date
    const triggerDate = new Date(date);
    triggerDate.setHours(9, 0, 0, 0);

    // If 9 AM has passed, schedule for next day or just don't schedule? 
    // Actually, if it's today and past 9 AM, it might trigger immediately or fail.
    // The service handles "past date" check, so we are safe.

    if (createdPayable && createdPayable.id) {
      await NotificationService.scheduleNotification(
        'Conta a Pagar',
        `Lembrete: Pagar ${description} no valor de R$ ${value.toFixed(2)}`,
        triggerDate,
        createdPayable.id
      );
    }
  }

  async pay(payable: Payable, date?: Date) {
    const session = await this.getSessionUseCase.execute();
    if (!session?.user) throw new Error('Usuário não autenticado');

    // Default category for paid bills
    const category = 'Contas';

    await this.payUseCase.execute(
      payable.id!,
      session.user.id,
      payable.amount,
      payable.description,
      category,
      date
    );

    if (payable.id) {
      await NotificationService.cancelNotification(payable.id);
    }
  }
}
