import type { PostgrestError } from '@supabase/supabase-js';

export const normalizePostgrestError = (
  error: unknown,
  code: string = 'FETCH_EXCEPTION'
): PostgrestError => ({
  name: 'PostgrestError',
  message: error instanceof Error ? error.message : 'Unknown error',
  details: '',
  hint: '',
  code,
});

