
const AfricasTalking = require('africastalking');

const at = AfricasTalking({
  username: process.env.AT_USERNAME,
  apiKey:   process.env.AT_API_KEY,
});

const sms = at.SMS;


const MESSAGES = {

  // Sent immediately on signup
  confirmation: (firstName, position) =>
    `Nyumba: Habari ${firstName}! You're #${position} on the waiting list. ` +
    `We'll text you the moment we launch in Kampala. ` +
    `No broker. Zero commission. Just your home. — nyumba.ug`,

  // Sent when we go live — tenants
  launch_tenant: (firstName) =>
    `Nyumba is LIVE in Kampala! ${firstName}, find your house now — ` +
    `verified listings, direct landlord contact, zero broker fee. ` +
    `Download: nyumba.ug/app`,

  // Sent when we go live — landlords
  launch_landlord: (firstName) =>
    `Nyumba is LIVE in Kampala! ${firstName}, list your property FREE — ` +
    `reach 1,000+ tenants, zero commission, rent collected on your phone. ` +
    `Start: nyumba.ug/list`,

  // Referral notification
  referral: (firstName, referredName) =>
    `Nyumba: ${referredName} just joined using your referral link! ` +
    `You're moving up the list, ${firstName}. Keep sharing — nyumba.ug/waitlist`,
};


/**
 * Send confirmation SMS after signup
 * @param {string} phone     - e.g. "+256701234567"
 * @param {string} firstName - e.g. "Sarah"
 * @param {number} position  - e.g. 47
 */
async function sendConfirmation(phone, firstName, position) {
  try {
    const result = await sms.send({
      to:      [phone],
      message: MESSAGES.confirmation(firstName, position),
      from:    process.env.AT_SENDER_ID || 'NYUMBA',
    });

    const recipient = result.SMSMessageData.Recipients[0];

    if (recipient.status === 'Success') {
      console.log(`[SMS] Confirmation sent to ${phone} — position #${position}`);
      return { success: true, messageId: recipient.messageId };
    } else {
      console.error(`[SMS] Failed for ${phone}:`, recipient.status);
      return { success: false, error: recipient.status };
    }

  } catch (err) {
    console.error('[SMS] Africa\'s Talking error:', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Send launch SMS to all waitlist members
 * Called when you flip the launch switch
 * @param {Array} members - [{phone, first_name, role, position}]
 */
async function sendLaunchBlast(members) {
  const results = { sent: 0, failed: 0, errors: [] };

  // AT supports up to 1,000 recipients per call
  // Chunk into batches of 500 to be safe
  const BATCH = 500;

  for (let i = 0; i < members.length; i += BATCH) {
    const batch = members.slice(i, i + BATCH);

    // Split by role — different messages
    const tenants   = batch.filter(m => m.role === 'tenant');
    const landlords = batch.filter(m => m.role === 'landlord');

    // Send tenant blast
    if (tenants.length > 0) {
      // Personalised = one SMS each (better but costs more)
      // For cost savings: send bulk with generic opener
      for (const m of tenants) {
        try {
          await sms.send({
            to:      [m.phone],
            message: MESSAGES.launch_tenant(m.first_name),
            from:    process.env.AT_SENDER_ID || 'NYUMBA',
          });
          results.sent++;
        } catch (err) {
          results.failed++;
          results.errors.push({ phone: m.phone, err: err.message });
        }
      }
    }

    // Send landlord blast
    for (const m of landlords) {
      try {
        await sms.send({
          to:      [m.phone],
          message: MESSAGES.launch_landlord(m.first_name),
          from:    process.env.AT_SENDER_ID || 'NYUMBA',
        });
        results.sent++;
      } catch (err) {
        results.failed++;
        results.errors.push({ phone: m.phone, err: err.message });
      }
    }

    // Pause 500ms between batches to respect rate limits
    if (i + BATCH < members.length) {
      await new Promise(r => setTimeout(r, 500));
    }
  }

  console.log(`[SMS] Launch blast complete: ${results.sent} sent, ${results.failed} failed`);
  return results;
}

/**
 * Send referral notification
 */
async function sendReferralNotification(referrerPhone, referrerFirst, newMemberName) {
  try {
    await sms.send({
      to:      [referrerPhone],
      message: MESSAGES.referral(referrerFirst, newMemberName),
      from:    process.env.AT_SENDER_ID || 'NYUMBA',
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}


// COST ESTIMATE HELPER

function estimateCost(memberCount, pricePerSmsUGX = 45) {
  const total = memberCount * pricePerSmsUGX;
  return {
    sms_count:    memberCount,
    price_each:   `UGX ${pricePerSmsUGX}`,
    total_ugx:    `UGX ${total.toLocaleString()}`,
    total_usd:    `~$${(total / 3700).toFixed(2)}`,
  };
}

module.exports = {
  sendConfirmation,
  sendLaunchBlast,
  sendReferralNotification,
  estimateCost,
  MESSAGES,
};
