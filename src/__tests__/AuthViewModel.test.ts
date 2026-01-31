import { AuthViewModel } from '../viewmodel/AuthViewModel';
import { SignIn } from '../usecase/auth/SignIn';
import { SignUp } from '../usecase/auth/SignUp';
import { SignOut } from '../usecase/auth/SignOut';

// Mock UseCases
jest.mock('../usecase/auth/SignIn');
jest.mock('../usecase/auth/SignUp');
jest.mock('../usecase/auth/SignOut');

describe('AuthViewModel', () => {
  let authViewModel: AuthViewModel;
  let mockSignIn: jest.Mocked<SignIn>;
  let mockSignOut: jest.Mocked<SignOut>;

  beforeEach(() => {
    jest.clearAllMocks();
    authViewModel = new AuthViewModel();
    
    // @ts-ignore
    mockSignIn = SignIn.mock.instances[0];
    // @ts-ignore
    mockSignOut = SignOut.mock.instances[0];
  });

  describe('login', () => {
    it('deve chamar signIn com email e senha corretos', async () => {
      // Act
      await authViewModel.login('test@email.com', 'password123');

      // Assert
      expect(mockSignIn.execute).toHaveBeenCalledWith('test@email.com', 'password123');
    });

    it('deve lançar erro se campos estiverem vazios', async () => {
      await expect(authViewModel.login('', 'pass')).rejects.toThrow('Preencha todos os campos');
      await expect(authViewModel.login('email', '')).rejects.toThrow('Preencha todos os campos');
    });
  });

  describe('logout', () => {
    it('deve chamar signOut', async () => {
      // Act
      await authViewModel.logout();

      // Assert
      expect(mockSignOut.execute).toHaveBeenCalled();
    });
  });
});
