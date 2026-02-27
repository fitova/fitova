import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testSignup() {
  const timestamp = Date.now();
  const email = 'test' + timestamp + '@example.com';
  console.log('Testing signup with email:', email);
  
  const { data, error } = await supabase.auth.signUp({
    email,
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
  }
}

testSignup();
