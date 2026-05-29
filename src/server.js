// src/server.js
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import speakeasy from 'speakeasy';
import { initOwner, logs, users } from './store.js';
import { authenticate, verifyMfa, requireValidSession } from './auth.js';
import { canRemoteUnlock } from './policy.js';
import { logUnlock } from './logger.js';

initOwner();

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.post('/api/login', (req, res) => {
  const { username, password, deviceId } = req.body;
  const ip = req.ip;
  const userAgent = req.get('user-agent') || 'unknown';

  const result = authenticate(username, password, deviceId, ip, userAgent);
  if (!result.ok) return res.status(401).json(result);
  res.json(result);
});

app.post('/api/mfa/verify', (req, res) => {
  const { sessionId, token } = req.body;
  const result = verifyMfa(sessionId, token);
  if (!result.ok) return res.status(400).json(result);
  res.json({ ok: true });
});

app.post('/api/remote-unlock', (req, res) => {
  const { sessionId } = req.body;
  const sessionResult = requireValidSession(sessionId);
  if (!sessionResult.ok) return res.status(401).json(sessionResult);

  const policy = canRemoteUnlock(sessionResult.session);
  if (!policy.ok) return res.status(403).json(policy);

  logUnlock('UNLOCK_COMMAND_SENT', {
    sessionId,
    userId: sessionResult.session.userId
  });

  res.json({ ok: true, message: 'Door unlocked (simulated)' });
});

app.get('/api/logs', (req, res) => {
  res.json(logs);
});

app.get('/api/owner/mfa-secret', (req, res) => {
  const owner = [...users.values()].find(u => u.username === 'owner');
  const secret = owner.mfaSecret;
  const otpauth = speakeasy.otpauthURL({
    secret,
    label: 'LockCamPro:owner',
    encoding: 'ascii'
  });
  res.json({ secret, otpauth });
});

const port = 3000;
app.listen(port, () => {
  console.log(`LockCam MFA server running on http://localhost:${port}`);
});
