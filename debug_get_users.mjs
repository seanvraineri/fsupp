import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://tcptynohlpggtufqanqg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRjcHR5bm9obHBnZ3R1ZnFhbnFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0ODE5ODIwNSwiZXhwIjoyMDYzNzc0MjA1fQ.VK4qGBXKbYVNJWJIfV7I5YnKvOdnYrKKpBFfhRlCn28'
);

(async () => {
  const { data, error } = await supabase
    .from('health_assessments')
    .select('user_id, id, created_at')
    .eq('is_complete', true)
    .order('created_at', { ascending: false })
    .limit(10);
  if (error) console.error(error);
  else console.log(JSON.stringify(data, null, 2));
})(); 