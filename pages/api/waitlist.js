

import { createClient } from '@supabase/supabase-js';
import { sendConfirmation } from '../../lib/sms';

// IMPORTANT: this uses the SERVICE ROLE key, not the anon key.
// The service role key bypasses Row Level Security so the server
// can write to the waitlist table. It must NEVER be sent to the
// browser — that's why it has no NEXT_PUBLIC_ prefix.
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { firstName, lastName, phone, role, area, referralCode } = req.body;

  // ── Validation ──
  if (!firstName || !lastName || !phone || !role || !area) {
    return res.status(400).json({ error: 'All fields are required.' });
  }
  if (!['tenant', 'landlord'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' });
  }

  // ── Check for duplicate phone number ──
  const { data: existing } = await supabaseAdmin
    .from('waitlist')
    .select('id, position')
    .eq('phone', phone)
    .single();

  if (existing) {
    return res.status(409).json({
      error: 'duplicate',
      message: 'This number is already on the list.',
      position: existing.position,
    });
  }

  // ── Find referrer if a referral code was provided ──
  let referredById = null;
  if (referralCode) {
    const { data: referrer } = await supabaseAdmin
      .from('waitlist')
      .select('id')
      .eq('referral_code', referralCode)
      .single();
    if (referrer) referredById = referrer.id;
  }

  // ── Insert the new signup ──
  const { data, error } = await supabaseAdmin
    .from('waitlist')
    .insert({
      first_name: firstName,
      last_name: lastName,
      phone,
      role,
      area,
      referred_by: referredById,
    })
    .select('id, position, referral_code')
    .single();

  if (error) {
    console.error('Supabase insert error:', error);
    return res.status(500).json({ error: 'Failed to save. Please try again.' });
  }

  // ── Send confirmation SMS (non-blocking) ──
  // We don't want the signup to fail just because the SMS failed —
  // so we fire this and don't await it before responding.
  sendConfirmation(phone, firstName, data.position)
    .then((smsResult) => {
      if (smsResult.success) {
        supabaseAdmin
          .from('waitlist')
          .update({ sms_sent: true, sms_sent_at: new Date().toISOString() })
          .eq('id', data.id);
      }
    })
    .catch((err) => console.error('SMS error (non-fatal):', err));

  // ── Respond to the browser ──
  return res.status(201).json({
    success: true,
    position: data.position,
    referralCode: data.referral_code,
    firstName,
    area,
    role,
  });
}