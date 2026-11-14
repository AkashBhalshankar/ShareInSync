# ShareInSync

**Private peer-to-peer file sharing and instant collaborative code rooms in the browser.**

[Open ShareInSync](https://shareinsync.akashbhalshankar.com) · [Report an issue](https://github.com/AkashBhalshankar/ShareInSync/issues) · [View deployments](https://github.com/AkashBhalshankar/ShareInSync/actions)

ShareInSync connects two devices with a fast QR scan and transfers files directly over an encrypted WebRTC connection. It also provides temporary, account-free live code rooms that can be shared with a six-character room ID or invite link.

No application installation is required. Open the site on both devices, scan once, verify the displayed safety code, and start sharing.

## ✨ Highlights

- Fast, static QR pairing with short-lived Cloudflare signaling sessions.
- Direct browser-to-browser file transfer over WebRTC.
- Sender and receiver can both share files after pairing.
- One-click reconnect appears only after a successfully verified pairing.
- Automatic friendly device labels such as `iPhone`, `Android phone`, `Windows PC`, and `Mac`.
- File, multi-file, folder, drag-and-drop, and pasted-image selection.
- Folder sharing as one ZIP archive by default, up to the in-memory limit.
- Remove individual queued files or discard the full unsent selection.
- Transfer queue ordering, pause/resume, cancellation, progress, speed, ETA, and bandwidth limits.
- Optional receive-folder selection and bounded auto-accept rules.
- Account-free live code rooms with syntax highlighting and line numbers.
- Dark theme by default, responsive mobile UI, and installable PWA shell.
- QR download, QR-image import, copy/paste fallback, and offline pairing fallback.
- English, Hindi, and Spanish interface labels.

## 🔄 How file sharing works

```text
Sender creates session
        │
        ▼
Cloudflare stores temporary WebRTC offer
        │
        ▼
Receiver scans short QR ──► posts WebRTC answer
        │
        ▼
Both devices compare verification code
        │
        ▼
Encrypted peer-to-peer WebRTC connection
        │
        ▼
Files move directly between the two devices
```

Cloudflare is used only to exchange temporary WebRTC connection descriptions. File bytes are not uploaded to or stored by the signaling Worker.

If signaling is unavailable, ShareInSync falls back to the larger compressed offer/answer QR and copy/paste pairing flow.

## 🚀 Using ShareInSync

### Send files

1. Open [ShareInSync](https://shareinsync.akashbhalshankar.com) on both devices.
2. On the sending device, choose **Send**.
3. On the other device, choose **Receive** and scan the displayed QR.
4. Confirm that the six-character safety code matches on both devices.
5. Select files, a folder, drag items into the drop zone, or paste an image.
6. Review the queue. Use **Remove file** or **Discard selection** if the wrong item was chosen.
7. Select **Send** for the queued item.
8. The receiver chooses a destination and accepts the transfer.

### Reconnect a verified device

After two devices complete pairing and verification at least once, a **Reconnect** banner becomes available on the home page.

1. Return to the home page on both previously paired devices.
2. Select **Reconnect** on both devices.
3. ShareInSync silently exchanges fresh WebRTC descriptions through the saved short-lived session.

Reconnect is intended for brief interruptions such as mobile screen lock or tab suspension. If the signaling session has expired, scan a new QR.

### Create a live code room

1. Select **Create new room** on the home page.
2. Copy the invite link or share the displayed six-character room ID.
3. A collaborator opens the link or enters the room ID and selects **Join room**.
4. Choose a language and edit together in real time.

Code-room content is synchronized through a Cloudflare Durable Object. Rooms require no account and expire after 24 hours of inactivity.

## 🔒 Privacy model

| Data | Where it goes | Retention |
|---|---|---|
| File bytes | Directly between paired browsers | Not stored by ShareInSync |
| Filenames and transfer progress | Current peer session | Cleared when the session ends |
| WebRTC offer/answer | Cloudflare Durable Object | Approximately 10 minutes |
| Live code-room text | Cloudflare Durable Object | 24 hours after last activity |
| Theme preference | Current browser | Until browser storage is cleared |
| Verified reconnect record | Current browser | Until browser storage is cleared |

WebRTC data channels use DTLS encryption. Users must compare the transcript-derived verification code before file and collaboration controls become trusted.

## Browser requirements

- Camera access requires HTTPS or localhost.
- Clipboard and service-worker features also require a secure context.
- Modern Chromium browsers provide the fullest experience.
- Safari on iPhone supports pairing and transfers but may suspend the connection when the screen locks.
- Browsers without File System Access support hold incoming data in memory and limit individual transfers to 256 MiB.
- Direct WebRTC may fail on restrictive NATs, VPNs, or enterprise firewalls because ShareInSync intentionally does not relay file traffic through a TURN server.

## 🏗️ Deployment architecture

ShareInSync has two deployment components:

### 1. GitHub Pages frontend

The static site is published from `site/` through `.github/workflows/pages.yml`.

```text
ShareInSync/
├── .github/
│   └── workflows/
│       └── pages.yml
├── site/
│   ├── index.html
│   ├── sw.js
│   ├── favicon.svg
│   ├── CNAME
│   └── .nojekyll
└── README.md
```

The production custom domain is configured through `site/CNAME`:

```text
shareinsync.akashbhalshankar.com
```

### 2. Cloudflare signaling Worker

The signaling and code-room API is deployed at:

```text
https://shareinsync-signaling.akashavinash364.workers.dev
```

It uses a SQLite-backed Durable Object binding named `SESSIONS` for reliable temporary state.

Supported endpoints:

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/session` | Create a short-lived pairing session |
| `POST` | `/session/:id` | Publish an offer or answer |
| `GET` | `/session/:id` | Read the current offer and answer |
| `POST` | `/code` | Create a live code room |
| `POST` | `/code/:id` | Update room text and language |
| `GET` | `/code/:id` | Read room text, language, and revision |

## GitHub Pages setup

1. Fork or clone the repository.
2. Open **Settings → Pages**.
3. Select **GitHub Actions** as the build source.
4. Push to the `main` branch or run the workflow manually from **Actions**.
5. Wait for **Deploy ShareInSync** to finish successfully.

For a custom domain, create this DNS record with your domain provider:

| Type | Host | Target |
|---|---|---|
| `CNAME` | `shareinsync` | `akashbhalshankar.github.io` |

Then enter the full domain in **Settings → Pages → Custom domain** and enable HTTPS after DNS verification.

## Local preview

Serve the `site` directory with any static server. For example, with VS Code Live Server, open `site/index.html`; with Python:

```bash
cd site
python -m http.server 5500
```

Open:

```text
http://localhost:5500
```

Localhost is treated as a secure context by modern browsers. For testing on another phone through a LAN IP, use HTTPS; plain `http://192.168.x.x:5500` cannot access the camera on most browsers.

If UI changes do not appear, unregister the old service worker or clear site data, then perform a hard refresh.

## ✅ Quality checks

The source project currently passes:

- 36 automated unit and persona-journey tests.
- Static build validation.
- Lint checks.
- Policy and quality checks.
- Live Worker create/read/write health checks.

Covered areas include signaling validation, QR fallback, peer verification, file integrity, safe paths, transfer queue behavior, folder ZIP creation, cloud code rooms, responsive UI structure, and lifecycle cleanup.

## Limits and trade-offs

- Pairing and reconnect signaling require internet access unless the offline QR fallback is used.
- File transfer remains peer-to-peer and requires both browsers to stay active.
- iOS may terminate WebRTC when Safari is backgrounded or the screen locks.
- Reconnect works while the saved signaling session remains valid; expired sessions require a fresh QR scan.
- Live code rooms are intentionally temporary and are not a permanent code-hosting service.
- Folder ZIP creation and fallback downloads are limited by available device memory.
- No TURN relay is configured, so some restrictive networks cannot establish a direct connection.

## 🛠️ Troubleshooting

### Camera does not open

- Confirm the URL begins with `https://`.
- Allow camera access in browser or iOS settings.
- Avoid opening the site inside an in-app browser.
- Use **QR image** or **Paste code** as a fallback.

### QR scanning is slow

- Keep the complete QR inside the scanner frame.
- Use good lighting and avoid screen glare.
- Hold both devices steady.
- Increase the brightness of the device displaying the QR.

### Files remain at 0%

- Verify that both devices show a connected and verified session.
- Keep both pages in the foreground.
- Disable VPNs that block direct WebRTC.
- Retry on the same Wi-Fi network or hotspot.

### Reconnect is not visible

Reconnect appears only after both peers finish the safety-code verification at least once.

### Latest UI is not visible

- Wait for the GitHub Actions deployment to finish.
- Hard-refresh the page.
- Clear site data or unregister the existing service worker.

## Security notes

- Pairing descriptions and room IDs are validated and size-limited.
- File paths reject traversal, absolute paths, and unsafe names.
- File integrity is verified with incremental SHA-256.
- Remote values are escaped before rendering.
- Incoming in-memory files are bounded to prevent unbounded allocation.
- Signaling and code-room objects expire automatically.
- Reconnect is offered only after a successfully verified pairing.

## Contributing

Bug reports and focused pull requests are welcome. When reporting a problem, include:

- Browser and operating-system versions.
- Sender and receiver device types.
- Whether both devices used the same Wi-Fi, hotspot, VPN, or different networks.
- Exact error text and the step where it appeared.
- Whether QR image or paste-code fallback worked.

Please do not include pairing codes, room content, filenames containing sensitive information, or other private data in public issues.

---

Built for quick, private sharing between the devices already in your hands.
