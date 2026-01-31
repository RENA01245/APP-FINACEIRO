import { supabase } from '../../infra/supabase/client';

export class SignIn {
  async execute(email: string, pass: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: pass,
    });
    if (error) throw error;
  }
}
