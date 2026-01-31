import { getSession } from '../../infra/supabase/session';

export class GetSession {
  async execute() {
    return await getSession();
  }
}
