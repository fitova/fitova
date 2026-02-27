import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const timestamp = Date.now();
  console.log('Testing signup with email: test' + timestamp + '@example.com');
  const { data, error } = await supabase.auth.signUp({
    email: 'test' + timestamp + '@example.com',
    password: 'password123456',
    options: {
      data: {
        full_name: 'Test Setup User',
      },
    }
  });
  
  if (error) {
    console.error('SIGNUP ERROR:', JSON.stringify(error, null, 2));
  } else {
    console.log('SIGNUP SUCCESS:', JSON.stringify(data, null, 2));
    
    // Test if profile was created
    if (data.user) {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('PROFILE FETCH ERROR:', profileError);
      } else {
        console.log('PROFILE CREATED:', profile);
      }
    }
  }
}

testSignup();
