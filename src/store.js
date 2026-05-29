// src/store.js
import { v4 as uuid } from 'uuid';

export const users = new Map();
export const sessions = new Map();
export const logs = [];

const ownerId = 'owner-1';

export function initOwner() {
  if (!users.has(ownerId)) {
    const mfaSecret = uuid().replace(/-/g, '').slice(0, 32);
    users.set(ownerId, {
      id: ownerId,
      username: 'owner',
      password: 'Password123!',
      mfaEnabled: true,
      mfaSecret,
      knownDevices: new Set()
    });
  }
}

export function createSession({ userId, deviceId, ip, userAgent, mfaValid }) {
  const id = uuid();
  const now = Date.now();
  const session = {
    id,
    userId,
    deviceId,
    ip,
    userAgent,
    createdAt: now,
    lastSeenAt: now,
    mfaValid,
    suspicious: false
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id) {
  return sessions.get(id);
}

export function updateSession(id, patch) {
  const s = sessions.get(id);
  if (!s) return null;
  const updated = { ...s, ...patch, lastSeenAt: Date.now() };
  sessions.set(id, updated);
  return updated;
}

export function addLog(entry) {
  logs.push({ ts: new Date().toISOString(), ...entry });
}
