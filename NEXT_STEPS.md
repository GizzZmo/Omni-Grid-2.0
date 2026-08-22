# Omni-Grid 2.0 - NEXT STEPS

## Completed (Aug 2026)

### Security
- [x] Secure Vault (AES-256-GCM + PBKDF2 passphrase)
- [x] Zustand partialize (secrets never in plain localStorage)
- [x] No client-side API key injection

### Performance
- [x] Widget lazy-loading (React.lazy + Suspense + WidgetSkeleton)
- [x] `scripts/measure-bundle.mjs` + `npm run measure:bundle` / `build:analyze`

### Mobile / PWA touch
- [x] `ResponsiveGrid` — breakpoints lg→xxs (12→2 cols)
- [x] Auto-compact on mobile; resize disabled under 768px
- [x] Drag via `.drag-handle` only; inputs/buttons cancelled
- [x] `useIsMobile` / `useContainerWidth` hooks
- [x] viewport-fit=cover + safe-area + 44px coarse-pointer targets
- [x] Docs: `docs/mobile-pwa.md`

### Cloud backup (vault crypto)
- [x] `services/cloudBackup.ts` — encrypted `.ogbak.json` + optional HTTPS PUT/GET endpoint
- [x] Unit tests: `test/cloudBackup.test.ts`
- [x] Docs: `docs/cloud-backup.md`
- [ ] Wire full UI in Settings → Data tab (API ready; polish remaining)

### Tests
- [x] `test/useMediaQuery.test.ts`
- [x] `test/cloudBackup.test.ts`
- [ ] E2E (Playwright) smoke for mobile viewport + vault unlock

## Next priorities

1. **Settings Data tab UI** for encrypted export/import + cloud endpoint
2. **App chrome** mobile menu for header controls (safe-area already in CSS)
3. **E2E** mobile + backup flows
4. **Lighthouse** mobile TTI after `npm run build:analyze`

## Commands

```bash
npm run test:run
npm run build:analyze   # vite build + bundle size report
npm run measure:bundle  # report only (needs dist/)
```

**Last Updated:** August 2026
