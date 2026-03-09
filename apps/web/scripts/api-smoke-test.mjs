import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.resolve(__dirname, '../.env.local');

if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value) {
      process.env[key.trim()] = value.join('=').trim().replace(/['"]/g, '');
    }
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://btjrttdzawpzdocxzdss.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_ibS9_HlsMyRtQpXiLPg7lQ_zeLYaVt4';
const API_BASE = 'http://localhost:3000/api';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function runTests() {
  console.log('--- HeliX API Smoke Tests ---');
  
  const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
  
  // 1. Authenticate
  console.log(`[AUTH] Fetching first existing user ID via Admin API...`);
  const { data: users, error: userError } = await adminClient.from('users').select('id').limit(1);

  if (userError || !users || users.length === 0) {
    console.error('[FAIL] Could not find an existing user to test with:', userError);
    process.exit(1);
  }

  const userId = users[0].id;
  const token = `test_user_${userId}`;
  console.log(`[PASS] Using simulated session token for user: ${userId}`);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const results = [];

  async function testEndpoint(name, url, method = 'GET', body = null) {
    try {
      console.log(`Testing [${method}] ${url}...`);
      const options = { method, headers };
      if (body) options.body = JSON.stringify(body);
      
      const res = await fetch(`${API_BASE}${url}`, options);
      const data = await res.json().catch(() => null);
      
      if (!res.ok) {
        throw new Error(`Status ${res.status} - ${data?.error || data?.message || 'Unknown error'} ${data?.details ? '- ' + JSON.stringify(data.details) : ''}`);
      }
      
      results.push({ name, status: 'PASS', data });
      return data;
    } catch (err) {
      results.push({ name, status: 'FAIL', error: err.message });
      return null;
    }
  }

  // 2. Auth Profile
  await testEndpoint('Get Profile', '/auth/profile');
  await testEndpoint('Update Profile', '/auth/profile', 'POST', { displayName: 'Test Runner', goals: ['strength'] });

  // 3. Exercises
  const exercises = await testEndpoint('Get Exercises', '/exercises');
  const deadlift = exercises?.find(e => e.name === 'Deadlift') || exercises?.[0];

  // 4. Gyms
  const gyms = await testEndpoint('Search Gyms', '/gym/search?q=');
  let gymId = null;
  if (gyms && gyms.length > 0) {
    gymId = gyms[0].id;
    await testEndpoint('Get Gym Metadata', `/gym/${gymId}`);
    await testEndpoint('Join Gym', '/gym/join', 'POST', { gymId });
  }

  // 5. Workouts
  if (deadlift) {
    await testEndpoint('Finish Workout', '/workouts/finish', 'POST', {
      title: 'API Test Workout',
      durationSeconds: 3600,
      sets: [
        { exerciseId: deadlift.id, setNumber: 1, weight: 200, reps: 1, rpe: 9 }
      ]
    });
  }

  await testEndpoint('Get Workouts', '/workouts');

  // 6. Progress
  await testEndpoint('Get Progress Summary', '/progress');
  if (deadlift) {
    await testEndpoint('Get Progress Trends', `/progress/trends?exerciseId=${deadlift.id}`);
  }

  // 7. Gym Ecosystem
  if (gymId) {
    await testEndpoint('Get Gym Feed', `/gym/feed?gymId=${gymId}`);
    await testEndpoint('Get Gym Leaderboard', `/gym/leaderboard?gymId=${gymId}`);
  }

  // 8. Summary
  const passed = results.filter(r => r.status === 'PASS').length;
  
  const report = JSON.stringify({
    summary: `${passed} / ${results.length} Passed`,
    failures: results.filter(r => r.status === 'FAIL')
  }, null, 2);

  fs.writeFileSync(path.resolve(__dirname, 'api-results.json'), report);

  if (passed !== results.length) {
    process.exit(1);
  }
}

runTests();
