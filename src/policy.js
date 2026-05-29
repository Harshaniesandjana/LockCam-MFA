// src/policy.js
import { logUnlock } from './logger.js';
import { updateSession } from './store.js';

export function canRemoteUnlock(session) {
  if (!session.mfaValid) {
    logUnlock('UNLOCK_BLOCKED_MFA_MISSING', {
      sessionId: session.id,
      userId: session.userId
    });
    return { ok: false, reason: 'MFA_REQUIRED' };
  }

  if (session.suspicious) {
    logUnlock('UNLOCK_BLOCKED_SUSPICIOUS_SESSION', {
      sessionId: session.id,
      userId: session.userId
    });
    return { ok: false, reason: 'SUSPICIOUS_SESSION' };
  }

  logUnlock('UNLOCK_ALLOWED', {
    sessionId: session.id,
    userId: session.userId
  });

  updateSession(session.id, {});
  return { ok: true };
}
