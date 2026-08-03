# Encrypted Cloud Backup

```text
[ DOCUMENTATION: CLOUD-BACKUP.MD ]
```

## Model

Omni-Grid stays **local-first**. Cloud backup is **optional** and always encrypted with the same **AES-256-GCM** data-encryption key used by the [Secure Vault](./state-management.md).

### Formats

| Format | File | Encryption |
| ------ | ---- | ---------- |
| Legacy JSON | `omni-grid-backup-*.json` | None (session snapshot) |
| Encrypted | `*.ogbak.json` | AES-GCM via vault DEK |

### User-controlled endpoint

Settings → **Data** → **Cloud Endpoint**:

1. Paste an **HTTPS** URL that accepts `PUT` (upload) and `GET` (download)
2. Optional `Authorization` header (Bearer / basic)
3. **Upload** / **Restore** send only the encrypted envelope

Compatible with WebDAV files, S3 presigned URLs, or a tiny self-hosted static object store.

### API (`services/cloudBackup.ts`)

- `createEncryptedBackup` / `restoreEncryptedBackup`
- `downloadEncryptedBackup` / `parseBackupFile`
- `uploadToCloud` / `downloadFromCloud`
- `saveCloudEndpoint` / `loadCloudEndpoint`

Vault must be **unlocked** (or unprotected) to encrypt/decrypt backups.

---

**[← Back to Documentation Hub](./README.md)**
