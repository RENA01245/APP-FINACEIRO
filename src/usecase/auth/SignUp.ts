import { supabase } from '../../infra/supabase/client';

export class SignUp {
  async execute(email: string, pass: string) {
    const { error } = await supabase.auth.signUp({
      email,
      password: pass,
    });
    if (error) throw error;
  }
}
