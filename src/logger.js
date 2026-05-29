// src/logger.js
import { addLog } from './store.js';

export function logAuth(event, data = {}) {
  addLog({ type: 'AUTH', event, ...data });
}

export function logMfa(event, data = {}) {
  addLog({ type: 'MFA', event, ...data });
}

export function logUnlock(event, data = {}) {
  addLog({ type: 'UNLOCK', event, ...data });
}
