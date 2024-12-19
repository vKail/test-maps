import { createClient } from '@supabase/supabase-js';

export const supabaseConfig = {
  supabaseUrl: 'https://qzcetiheflxrdbmfulje.supabase.co',
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF6Y2V0aWhlZmx4cmRibWZ1bGplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NzYyODUsImV4cCI6MjA1MDE1MjI4NX0.UtgVtv9kB6boacWJq3HnvE4dzY8Uo_32hPDdE5tcyb8",
};

export const supabase = createClient(
  supabaseConfig.supabaseUrl,
  supabaseConfig.supabaseKey,
);