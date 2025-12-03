import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://jvsjuwfdxjtngmwfdujv.supabase.co';
const supabaseAnonKey = 'sb_publishable_gRYdG-cbyjYp3SGvADuU_A_DXDv_APR';

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

