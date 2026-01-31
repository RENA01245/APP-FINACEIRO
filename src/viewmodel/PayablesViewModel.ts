import { AddPayable } from '../usecase/payables/AddPayable';
import { GetPendingPayables } from '../usecase/payables/GetPendingPayables';
import { PayAccount } from '../usecase/payables/PayAccount';
import { GetSession } from '../usecase/auth/GetSession';
import { Payable } from '../model/Payable';

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

    await this.addUseCase.execute({
      user_id: session.user.id,
      description,
      amount: value,
      due_date: date.toISOString(),
      status: 'pending'
    });
  }

  async pay(payable: Payable) {
    const session = await this.getSessionUseCase.execute();
    if (!session?.user) throw new Error('Usuário não autenticado');

    // Default category for paid bills
    const category = 'Contas'; 

    await this.payUseCase.execute(
      payable.id!, 
      session.user.id, 
      payable.amount, 
      payable.description, 
      category
    );
  }
}
