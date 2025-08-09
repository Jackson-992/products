import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uxdhayvrmzyhlogpngpl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV4ZGhheXZybXp5aGxvZ3BuZ3BsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTI2NDIsImV4cCI6MjA2NzI4ODY0Mn0.QB3-9crfpn8h_EK7leFB0Dva3kelAEnfdvTGd1_faBs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
