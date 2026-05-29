// src/auth.js
import speakeasy from 'speakeasy';
import { users, createSession, updateSession } from './store.js';
import { logAuth, logMfa } from './logger.js';

export function authenticate(username, password, deviceId, ip, userAgent) {
  const user = [...users.values()].find(u => u.username === username);
  if (!user || user.password !== password) {
    logAuth('LOGIN_FAILED', { username, ip });
    return { ok: false, reason: 'INVALID_CREDENTIALS' };
  }

  const isKnownDevice = user.knownDevices.has(deviceId);
  const mfaRequired = user.mfaEnabled && !isKnownDevice;

  const session = createSession({
    userId: user.id,
    deviceId,
    ip,
    userAgent,
    mfaValid: !mfaRequired
  });

  if (!isKnownDevice) {
    logAuth('NEW_DEVICE', { userId: user.id, deviceId, sessionId: session.id });
  }

  logAuth('LOGIN_SUCCESS', {
    userId: user.id,
    sessionId: session.id,
    mfaRequired
  });

  return {
    ok: true,
    sessionId: session.id,
    mfaRequired
  };
}

export function verifyMfa(sessionId, token) {
  const session = updateSession(sessionId, {});
  if (!session) {
    logMfa('MFA_FAILED_NO_SESSION', { sessionId });
    return { ok: false, reason: 'INVALID_SESSION' };
  }

  const user = users.get(session.userId);
  if (!user || !user.mfaEnabled) {
    logMfa('MFA_FAILED_USER', { sessionId, userId: session.userId });
    return { ok: false, reason: 'MFA_NOT_ENABLED' };
  }

  const verified = speakeasy.totp.verify({
    secret: user.mfaSecret,
    encoding: 'ascii',
    token,
    window: 1
  });

  if (!verified) {
    logMfa('MFA_FAILED', { sessionId, userId: user.id });
    const failCount = (session.mfaFailCount || 0) + 1;
    const suspicious = failCount >= 3;
    updateSession(sessionId, { mfaFailCount: failCount, suspicious });
    return { ok: false, reason: 'INVALID_TOKEN' };
  }

  user.knownDevices.add(session.deviceId);
  const updated = updateSession(sessionId, {
    mfaValid: true,
    mfaFailCount: 0,
    suspicious: false
  });

  logMfa('MFA_SUCCESS', {
    sessionId,
    userId: user.id,
    deviceId: updated.deviceId
  });

  return { ok: true };
}

export function requireValidSession(sessionId) {
  const session = updateSession(sessionId, {});
  if (!session) return { ok: false, reason: 'INVALID_SESSION' };
  return { ok: true, session };
}
