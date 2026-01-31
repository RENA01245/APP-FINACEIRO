import { supabase } from '../../infra/supabase/client';
import { Session } from '@supabase/supabase-js';

export class ObserveAuthState {
  execute(callback: (session: Session | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session);
    });
  }
}
