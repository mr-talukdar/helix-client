const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...value] = line.split('=');
  if (key && value) {
    env[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
  }
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;

async function restoreProfile(userId, newName) {
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  console.log(`Restoring profile for ${userId} to "${newName}"...`);
  
  const { data, error } = await supabase
    .from('users')
    .update({ display_name: newName })
    .eq('id', userId)
    .select();

  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success! Profile updated:', data);
  }
}

// Pass userId and name as arguments
const [,, userId, name] = process.argv;
if (!userId || !name) {
  console.log('Usage: node restore-profile.js <userId> <name>');
  process.exit(1);
}

restoreProfile(userId, name);
