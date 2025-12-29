# TROUBLESHOOTING // DIAGNOSTICS PROTOCOL

```text
[ DOCUMENTATION: TROUBLESHOOTING.MD ]
[ STATUS: SUPPORT SYSTEMS ONLINE ]
```

## 🚨 COMMON ISSUES

### Installation & Setup

#### Issue: `npm install` fails

**Symptoms:**

```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solutions:**

1. **Clear npm cache:**

   ```bash
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

2. **Use legacy peer deps:**

   ```bash
   npm install --legacy-peer-deps
   ```

3. **Update npm:**

   ```bash
   npm install -g npm@latest
   ```

4. **Check Node version:**
   ```bash
   node --version  # Should be 18+
   nvm install 18  # If using nvm
   nvm use 18
   ```

---

#### Issue: Port 5173 already in use

**Symptoms:**

```
Port 5173 is in use, trying another one...
```

**Solutions:**

1. **Kill the process (macOS/Linux):**

   ```bash
   lsof -ti:5173 | xargs kill -9
   ```

2. **Kill the process (Windows):**

   ```cmd
   netstat -ano | findstr :5173
   taskkill /PID <PID> /F
   ```

3. **Use a different port:**
   ```bash
   npm run dev -- --port 3000
   ```

---

### Launch & Display

#### Issue: Blank white screen on launch

**Symptoms:**

- Browser shows blank page
- No grid visible
- Console may show errors

**Solutions:**

1. **Check browser console (F12):**
   - Look for JavaScript errors
   - Common errors and fixes below

2. **Clear browser cache:**

   ```
   Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
   Firefox: Cmd+Shift+Delete or Ctrl+Shift+Delete
   Safari: Cmd+Option+E
   ```

3. **Clear localStorage:**

   ```javascript
   // In browser console
   localStorage.clear();
   location.reload();
   ```

4. **Verify build output:**

   ```bash
   npm run build
   npm run preview
   ```

5. **Check for blocking extensions:**
   - Disable ad blockers
   - Disable privacy extensions
   - Try incognito/private mode

---

#### Issue: Widgets not appearing

**Symptoms:**

- Grid is visible but empty
- Specific widgets missing
- Dock buttons don't work

**Solutions:**

1. **Check if widgets are toggled on:**
   - Click LAUNCHER button
   - Verify widget is not disabled
   - Try toggling via Dock

2. **Reset layout:**
   - Open System Core widget
   - Settings tab → Factory Reset
   - Confirm action

3. **Check console for errors:**
   - Look for widget-specific errors
   - Verify component imports

4. **Verify widget registration:**
   ```typescript
   // In GridContainer.tsx
   // Ensure widget is in widgetComponents object
   ```

---

### AI Features

#### Issue: "Please add your Gemini API key"

**Symptoms:**

- AI features (Refine, Expand, etc.) show error
- Modal prompts for API key

**Solutions:**

1. **Add API key via UI:**
   - Open System Core widget
   - Navigate to Settings tab
   - Enter API key in input field
   - Click Save

2. **Verify API key format:**
   - Should start with `AIzaSy`
   - Length: ~39 characters
   - No spaces or special characters

3. **Test API key:**

   ```javascript
   // In browser console
   const apiKey = useAppStore.getState().settings.apiKey;
   console.log('API Key:', apiKey ? 'Set' : 'Not set');
   ```

4. **Generate new API key:**
   - Visit https://makersuite.google.com/app/apikey
   - Create new project or use existing
   - Generate new key
   - Copy to Omni-Grid

---

#### Issue: AI requests fail or timeout

**Symptoms:**

```
Error: Failed to fetch from Gemini API
Error: Request timeout
Error: Invalid response from AI service
```

**Solutions:**

1. **Check internet connection:**

   ```bash
   ping google.com
   ```

2. **Verify API quota:**
   - Visit Google AI Studio
   - Check quota limits
   - Free tier: 60 requests/minute

3. **Try different model:**

   ```typescript
   // In widget code, switch from 'pro' to 'flash'
   await callGemini(apiKey, prompt, 'flash');
   ```

4. **Check for firewall/proxy:**
   - Corporate networks may block AI APIs
   - Try from personal network
   - Contact IT for whitelisting

5. **Inspect network request:**
   - Open DevTools → Network tab
   - Filter for `generativelanguage.googleapis.com`
   - Check response status and error message

---

### Layout & Grid

#### Issue: Widgets overlapping or misaligned

**Symptoms:**

- Widgets stack on top of each other
- Layout looks broken
- Resize handles missing

**Solutions:**

1. **Toggle Compact Mode:**
   - Click AUTOFIT button (top-right)
   - Try both ON and OFF states

2. **Unlock layout:**
   - Ensure UNLOCKED (not LOCKED)
   - Try manual repositioning

3. **Reset layout:**
   - System Core → Settings → Factory Reset

4. **Clear layout cache:**
   ```javascript
   // Browser console
   const state = useAppStore.getState();
   state.updateLayout([]);
   location.reload();
   ```

---

#### Issue: Cannot drag or resize widgets

**Symptoms:**

- Widgets are static
- No drag handles appear
- Layout seems frozen

**Solutions:**

1. **Check layout lock:**
   - Look for LOCKED button (top-right)
   - Click to UNLOCK

2. **Check freeze status:**
   - Look for FREEZE/RESUME button
   - Click RESUME if frozen

3. **Verify browser compatibility:**
   - Update to latest browser version
   - Chrome 90+, Firefox 88+, Safari 14+

4. **Disable browser extensions:**
   - Some extensions interfere with drag events
   - Try incognito mode

---

### Performance

#### Issue: Slow performance or lag

**Symptoms:**

- UI feels sluggish
- Animations stutter
- High CPU/memory usage

**Solutions:**

1. **Reduce active widgets:**
   - Close unused widgets
   - Recommended max: 20 visible

2. **Disable visual effects:**
   - System Core → Settings
   - Turn off Scanlines
   - Turn off Matrix Rain

3. **Clear browser cache:**
   - Old cached files may cause issues

4. **Check browser memory:**

   ```javascript
   // Browser console
   console.log(performance.memory);
   ```

5. **Close other tabs:**
   - Free up system resources

6. **Update browser:**
   - Latest versions have performance improvements

---

#### Issue: High memory usage

**Symptoms:**

```javascript
// Browser console shows
performance.memory.usedJSHeapSize > 100MB
```

**Solutions:**

1. **Export and clear old data:**
   - Backup current state
   - Factory reset
   - Re-import only needed data

2. **Limit data in widgets:**
   - Scratchpad notes: Keep < 50
   - Task lists: Keep < 100
   - History: Clear periodically

3. **Restart browser:**
   - Full browser restart (not just tab)

---

### Data & Storage

#### Issue: Data not persisting

**Symptoms:**

- Settings reset on refresh
- Notes disappear
- Layout resets

**Solutions:**

1. **Check localStorage availability:**

   ```javascript
   // Browser console
   try {
     localStorage.setItem('test', 'test');
     localStorage.removeItem('test');
     console.log('localStorage: Available');
   } catch (e) {
     console.log('localStorage: Blocked', e);
   }
   ```

2. **Check browser settings:**
   - Ensure cookies/storage is enabled
   - Not in private/incognito mode (some browsers disable storage)

3. **Check storage quota:**

   ```javascript
   // Browser console
   navigator.storage.estimate().then(estimate => {
     console.log(`Used: ${estimate.usage} / ${estimate.quota}`);
   });
   ```

4. **Manual backup:**
   - Export data immediately after changes
   - Don't rely on auto-persistence if failing

---

#### Issue: "localStorage quota exceeded"

**Symptoms:**

```
QuotaExceededError: Failed to execute 'setItem' on 'Storage'
```

**Solutions:**

1. **Clear old backups:**
   - Export current state
   - Factory reset
   - Restore only essential data

2. **Reduce data size:**
   - Delete old notes
   - Clear task history
   - Remove unused widget data

3. **Check storage usage:**

   ```javascript
   const size = new Blob(Object.values(localStorage)).size;
   console.log(`Storage used: ${(size / 1024).toFixed(2)} KB`);
   ```

4. **Browser-specific limits:**
   - Chrome: ~10MB
   - Firefox: ~10MB
   - Safari: ~5MB (more restrictive)

---

### Backup & Restore

#### Issue: Backup file won't download

**Symptoms:**

- Click Backup button
- No file downloads
- No browser prompt

**Solutions:**

1. **Check browser download settings:**
   - Ensure downloads are not blocked
   - Check for download location permission

2. **Try manual export:**

   ```javascript
   // Browser console
   const state = useAppStore.getState();
   console.log(JSON.stringify(state, null, 2));
   // Copy output and save to file manually
   ```

3. **Check popup blocker:**
   - May be blocking download prompt
   - Allow popups for localhost/your domain

---

#### Issue: "Invalid backup file" error

**Symptoms:**

- Upload backup file
- Error message appears
- State not restored

**Solutions:**

1. **Verify JSON format:**
   - Open file in text editor
   - Should be valid JSON
   - Check for corruption

2. **Check backup structure:**

   ```json
   {
     "version": 1,
     "timestamp": "2025-...",
     "state": {
       /* AppState */
     }
   }
   ```

3. **Try older backup:**
   - If available, use previous backup
   - Compare structure with failed file

4. **Manual restore:**
   ```javascript
   // Browser console
   const backup = /* paste JSON */;
   useAppStore.getState().setGlobalState(backup.state);
   ```

---

### Network & External Services

#### Issue: Weather/Market data not loading

**Symptoms:**

- Widgets show "No data"
- External API calls fail

**Solutions:**

1. **Check internet connection**

2. **Verify API endpoints:**
   - Open DevTools → Network tab
   - Look for failed requests
   - Check status codes

3. **Check CORS issues:**
   - Some APIs require proxy
   - See Configuration guide for proxy setup

4. **API rate limits:**
   - Free APIs often have limits
   - Wait and retry
   - Consider paid tier

---

## 🔍 DEBUGGING TECHNIQUES

### Enable Verbose Logging

```javascript
// Add to App.tsx or widget file
useEffect(() => {
  console.log('State changed:', useAppStore.getState());
}, []);
```

### React DevTools

1. Install browser extension
2. Open DevTools → Components tab
3. Inspect component props/state
4. View component tree

### Zustand DevTools

```typescript
// Add to store.ts
import { devtools } from 'zustand/middleware';

export const useAppStore = create(devtools(persist(/* ... */), { name: 'Omni-Grid' }));
```

Then open Redux DevTools extension.

### Network Debugging

1. Open DevTools → Network tab
2. Filter by XHR/Fetch
3. Inspect request/response
4. Check timing and status

---

## 🆘 GETTING HELP

### Self-Help Resources

1. **Read Documentation:**
   - [Getting Started](./getting-started.md)
   - [Configuration](./configuration.md)
   - [FAQ](./faq.md)

2. **Search GitHub Issues:**
   - Someone may have reported similar issue
   - Check closed issues too

3. **Browser Console:**
   - F12 or Cmd+Option+I (Mac)
   - Check for error messages
   - Look for red text/warnings

### Reporting Issues

When reporting bugs, include:

**System Information:**

```
- OS: macOS 13.0 / Windows 11 / Ubuntu 22.04
- Browser: Chrome 120 / Firefox 121 / Safari 16
- Node: v18.17.0
- npm: v9.8.1
- Omni-Grid: v2.0
```

**Steps to Reproduce:**

1. Launch app
2. Open X widget
3. Click Y button
4. Observe error

**Expected vs. Actual:**

- Expected: Widget should show data
- Actual: Shows error message

**Console Output:**

```
Paste any error messages from browser console
```

**Screenshots:**
If visual bug, attach screenshot.

---

## 🔧 ADVANCED DIAGNOSTICS

### State Dump

```javascript
// Browser console - dump entire state
console.log(JSON.stringify(useAppStore.getState(), null, 2));
```

### Performance Profiling

```javascript
// Browser DevTools → Performance tab
// Record → Interact → Stop
// Analyze flame graph
```

### Memory Profiling

```javascript
// Browser DevTools → Memory tab
// Take heap snapshot
// Compare snapshots to find leaks
```

---

## 📚 FURTHER READING

- **[FAQ](./faq.md)** - Quick answers
- **[Configuration](./configuration.md)** - Settings guide
- **[Architecture](./architecture.md)** - Technical details

---

_Every bug is a feature request in disguise._

**[← Back to Documentation Hub](./README.md)**
