import { SignIn } from '../usecase/auth/SignIn';
import { SignUp } from '../usecase/auth/SignUp';
import { SignOut } from '../usecase/auth/SignOut';

export class AuthViewModel {
  private signInUseCase = new SignIn();
  private signUpUseCase = new SignUp();
  private signOutUseCase = new SignOut();

  async login(email: string, pass: string) {
    if (!email || !pass) throw new Error('Preencha todos os campos');
    await this.signInUseCase.execute(email, pass);
  }

  async register(email: string, pass: string) {
    if (!email || !pass) throw new Error('Preencha todos os campos');
    await this.signUpUseCase.execute(email, pass);
  }

  async logout() {
    await this.signOutUseCase.execute();
  }
}
