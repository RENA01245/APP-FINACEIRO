import { supabase } from '../../infra/supabase/client';

export class SignOut {
  async execute() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }
}
