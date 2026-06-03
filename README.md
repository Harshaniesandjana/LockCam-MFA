# LockCam Pro – MFA Mitigatie Prototype

Dit project is een werkende realisatie van de MFA‑maatregel voor het LockCam Pro‑ecosysteem.  
De applicatie demonstreert:

- Login met eerste factor  
- MFA‑validatie via TOTP  
- Sessiebeheer  
- Remote unlock met policy‑controle  
- Logging van alle gebeurtenissen  

De backend draait als een Node.js‑service en simuleert de cloud‑componenten P4 (Cloud Auth) en P5 (Policy Engine).

---

## Installatie

### Repository openen
Open de map in **VS Code**.

### Dependencies installeren
```bash
npm install
```
---

### Applicatie starten
```bash 
npm start
```

#### De server draait op:
http://localhost:3000


### MFA-secret ophalen:
`GET /api/owner/mfa-secret`

Je krijgt:
- `secret`: invoeren in Google Authenticator
- `otpauth`: QR-code generator gebruiken indien gewenst.


### API-endpoints:
1. Login : `POST /api/login`
    - Body: {
  "username": "YOUR_NAME",
  "password": "OWN_PASSWORD",
  "deviceId": "device-123(MAG OOK EIGEN)"
}

2. MFA-verificatie: `POST /api/mfa/verify`
    - Body: {
  "sessionId": "<session-id>",
  "token": "<6-digit TOTP>"
}

3. Remote unlock `POST /api/remote-unlock`
    - Body: {
  "sessionId": "<session-id>"
}

4. Logs ophalen: `GET /api/logs`

---

## Projectstructuur
lockcam-mfa/
├─ package.json
├─ src/
│  ├─ server.js
│  ├─ auth.js
│  ├─ policy.js
│  ├─ logger.js
│  └─ store.js

---

## Vereisten
- Node.js 18+
- Authenticator-app (Google Authenticator)

---

## Testen
Gebruik Postman, Thunder Client of curl om:
1. Login -> MFA required
2. MFA token invoeren
3. Remote unlock uitvoeren
4. Logs controleren
