# CONFIGURATION // SYSTEM SETTINGS

```text
[ DOCUMENTATION: CONFIGURATION.MD ]
[ ACCESS LEVEL: OPERATOR ]
```

## 🎛️ OVERVIEW

Omni-Grid offers multiple configuration layers to customize your experience. This guide covers environment variables, in-app settings, and the **Secure Vault** used to protect API keys at rest.

---

## 🔑 ENVIRONMENT VARIABLES

### Setup Location

Create a `.env` file in the project root (optional for most users):

```
Omni-Grid-2.0/
├── .env              ← Create this file
├── package.json
├── vite.config.ts
└── ...
```

> **Important (v2.5.7+):** API keys are **not** injected into the client bundle via Vite `define`. Keys are entered in **System Core → Settings** and stored only via the Secure Vault. `.env` is useful for local tooling / server builds only.

### Available Variables

#### GEMINI_API_KEY / E2B_API_KEY (Optional for local tooling)

Preferred path for runtime AI features: paste keys in **System Core → Settings**.

Legacy env names may still appear in `.env.example` for documentation; they are not baked into the browser build.

#### PORT (Optional)

```env
PORT=5173
```

Default development port is **5173** (Vite).

### Security Best Practices

```bash
# .gitignore (already configured)
.env
.env.local
.env.production

# NEVER commit .env files to version control
```

**`.env.example` template:**

```env
# Optional — keys are normally entered in System Core Settings
GEMINI_API_KEY=your_google_gemini_api_key_here
E2B_API_KEY=your_e2b_api_key_here
```

---

## 🔐 SECURE VAULT (API KEYS & TOKENS)

### Where keys live

| Storage                                   | Content                                                       |
| ----------------------------------------- | ------------------------------------------------------------- |
| In-memory Zustand `settings`              | Plaintext only while vault is **unlocked** or **unprotected** |
| `localStorage` key `omni-grid-secrets`    | AES-256-GCM ciphertext only                                   |
| `localStorage` key `omni-grid-vault-meta` | Salt + wrapped DEK (when passphrase enabled)                  |
| IndexedDB `omni-grid-vault`               | Non-extractable device DEK (unprotected mode)                 |

### Enable a passphrase (recommended)

1. Open **System Core** widget → **Settings** tab
2. Under **Vault Passphrase**, enter a passphrase (≥ 8 characters) and confirm
3. Click **Enable Passphrase**

Crypto: PBKDF2-SHA256 with **600 000** iterations derives a KEK that wraps the AES-256 data key. The raw DEK is never stored unprotected once a passphrase is set.

### Unlock / Lock / Remove

- **Unlock** — required after each full page load when a passphrase is set
- **Lock Now** — clears the session DEK and wipes keys from memory
- **Remove** — requires current passphrase; returns to auto-unlock (device key) mode

When the vault is **locked**, the Gemini / E2B key inputs are disabled and store setters are no-ops.

### Status indicators

System Core **Status** tab shows vault state: `UNPROTECTED` | `LOCKED` | `UNLOCKED`.

---

## ⚙️ IN-APP SETTINGS

Access via **System Core** widget → **Settings** tab

### API Configuration

**Google Gemini API Key / E2B API Key**

- Location: System Core → Settings
- Storage: Secure Vault (encrypted at rest)
- Scope: Current browser profile
- Security: Use a vault passphrase on shared machines

### Visual Settings

#### Scanlines Effect

- **Toggle:** ON/OFF
- **Effect:** CRT monitor aesthetic with horizontal scanlines
- **Performance Impact:** Minimal

#### System Audio

- **Toggle:** ON/OFF

---

## 🎨 THEME CONFIGURATION

### Accessing Theme Engine

Open **Aesthetic Engine** widget (Dock: Wand icon) or Settings → Appearance.

### Built-in Presets

- Midnight Cyberpunk (default)
- Neon Night
- Minimal Light
- Matrix Green
- Nord, Dracula, and more

### AI Theme Generation

Describe a vibe or upload an image in Aesthetic Engine; Gemini extracts a palette when a key is available.

---

## 🖥️ LAYOUT CONFIGURATION

### Grid Settings

- **Compact Mode (AUTOFIT)** — top-right control
- **Layout Lock** — prevents drag/resize
- Responsive breakpoints: xxs → lg (2–12 columns)

### Factory Reset

System Core → Settings → **PURGE ALL DATA** (or `localStorage.clear()` + reload). This also clears the vault.

---

## 💾 DATA MANAGEMENT

### Manual Backup / Restore

Top-right **Backup** / **Restore** buttons export/import a JSON snapshot of the current Zustand state.

> If the vault is unlocked, the backup may contain plaintext keys. Store backups securely or lock the vault first.

### Storage Limits

Browser localStorage is typically ~5–10 MB. Ciphertext for secrets is small; the main pressure is widget data (notes, editor tabs, etc.).

---

## 🔐 PRIVACY CONFIGURATION

### Data Collection

- **Nothing.** Zero telemetry.

### What's Stored Locally

- Widget data, layouts, theme, non-secret settings
- Encrypted secrets (when keys are set)
- Optional vault metadata (salt + wrapped DEK)

### Third-Party Services

- Google Gemini / E2B only when you use AI or sandbox features and have provided keys

---

## 🚀 PERFORMANCE CONFIGURATION

- Disable Scanlines / Matrix Rain on low-end devices
- Limit concurrent visible widgets
- Upcoming: lazy-loaded heavy widgets (CyberEditor, NeuralChat, …) to improve TTI

---

## 📱 RESPONSIVE / PWA

PWA scaffolding is complete (`manifest.json`, service worker, icons). Mobile touch optimization is in progress.

---

## 🛠️ DEVELOPMENT CONFIGURATION

### Vite

```typescript
// vite.config.ts — keys are NOT defined here
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    open: true,
  },
});
```

### Scripts

```bash
npm run dev
npm run build
npm test
npm run lint
npm run format:check
npm run typecheck
```

---

## 📚 FURTHER READING

- **[State Management](./state-management.md)** — Zustand + Secure Vault
- **[Plugin Security](./plugin-security.md)** — Widget security rules
- **[Getting Started](./getting-started.md)** — Setup and installation
- **[Architecture](./architecture.md)** — System design

---

_Configuration is power. Own your grid — and your secrets._

**[← Back to Documentation Hub](./README.md)**
