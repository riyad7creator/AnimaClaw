import { createClient } from '@supabase/supabase-js';

// Use service key on server side to bypass RLS — single-master system
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Fixed master UUID for single-user ANIMA OS deployment
const MASTER_UUID = '00000000-0000-0000-0000-000000000001';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET': {
      const { data, error } = await supabase
        .from('anima_master_profile')
        .select('*')
        .eq('user_id', MASTER_UUID)
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        return res.status(500).json({ error: error.message });
      }

      return res.status(200).json(data || null);
    }

    case 'POST': {
      const { profile_json, onboarding_mode } = req.body;

      if (!profile_json) {
        return res.status(400).json({ error: 'profile_json is required' });
      }

      const profileWithMeta = {
        ...profile_json,
        installed_at: profile_json.installed_at || new Date().toISOString(),
        last_evolution: profile_json.last_evolution || '',
        total_cycles: profile_json.total_cycles || 0,
      };

      const { data, error } = await supabase
        .from('anima_master_profile')
        .upsert({
          user_id: MASTER_UUID,
          profile_json: profileWithMeta,
          onboarding_mode: onboarding_mode || 'SPARK',
          onboarding_complete: true,
          oracle_version: profile_json.oracle_version || 1,
          version: '1.5.0',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' })
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(201).json(data);
    }

    case 'PUT': {
      const { updates } = req.body;

      const { data: current, error: fetchError } = await supabase
        .from('anima_master_profile')
        .select('profile_json')
        .eq('user_id', MASTER_UUID)
        .single();

      if (fetchError) return res.status(500).json({ error: fetchError.message });

      const mergedProfile = {
        ...(current?.profile_json || {}),
        ...updates,
      };

      const { data, error } = await supabase
        .from('anima_master_profile')
        .update({
          profile_json: mergedProfile,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', MASTER_UUID)
        .select();

      if (error) return res.status(500).json({ error: error.message });
      return res.status(200).json(data);
    }

    default:
      return res.status(405).json({ error: 'Method not allowed' });
  }
}
