# Colton's Word Lab

A dyslexia reading and spelling app built for a 13-year-old. PWA that runs on iPad, desktop, and phone.

## Running locally

```bash
npm start
```

Runs HTTPS on port 8443 locally (needs cert.pem/key.pem for mic access). On Railway, uses HTTP with PORT env var.

## Architecture

Vanilla JavaScript — no framework, no build step, no bundler. All files are served statically.

### File map

| File | What it does |
|---|---|
| `index.html` | All screens/modals as `<div class="screen">` sections. Screens toggle via `.active` class. |
| `app.js` | Main logic: state machine, all game modes, screen transitions, event handlers. The `state` object at the top tracks everything. |
| `words.js` | Word lists by difficulty level. Each word: `{ word, hint, syllables, sentence }`. 5 levels, 30 words each. |
| `passages.js` | Reading passages with sentences array and comprehension questions. Organized by difficulty category. |
| `lessons.js` | Structured Orton-Gillingham spelling lessons. Each has teach slides, practice words, and quiz words. |
| `storage.js` | Spaced repetition engine (SM-2 variant) using localStorage. Tracks word performance, stats, streaks. |
| `ai.js` | Anthropic Claude API integration for AI tutor feedback. Sends word attempts and gets personalized coaching. |
| `sound.js` | Text-to-speech: browser SpeechSynthesis + optional OpenAI TTS for premium voice. |
| `badges.js` | Achievement/badge system with unlock conditions and gallery display. |
| `styles.css` | All styling. Supports dyslexia-friendly fonts, adjustable spacing, multiple background colors, dark mode. |
| `serve.js` | Static file server. HTTPS locally (for mic/speech), HTTP on Railway. |
| `sw.js` | Service worker for offline PWA support. |
| `manifest.json` | PWA manifest. |

### How screens work

Each game mode has its own `<div id="xxx-screen" class="screen">` in index.html. Only one has `class="active"` at a time. The `showScreen(id)` function in app.js handles transitions.

The home screen uses a bottom nav bar with four sections: Practice, Learn, Skills, Create. Each section shows different sub-mode cards in the `submode-grid`.

### Adding new words

Edit `words.js`. Each level is a key in `WORD_LISTS`:

```js
{ word: "example", hint: "A thing shown to explain something", syllables: ["ex", "am", "ple"], sentence: "Can you give me an example of how this works?" }
```

### Adding reading passages

Edit `passages.js`. Each passage needs: id, title, text preview, sentences array, level, wordCount, and questions array for comprehension.

### Adding lessons

Edit `lessons.js`. Each lesson has: id, unit, title, teachSlides array (multi-step instruction), practice words, and quiz words. Lessons follow Orton-Gillingham methodology.

### Data storage

Everything uses localStorage:
- `coltons_app_srs` — spaced repetition word data
- `coltons_app_stats` — score, streaks, session history
- `coltons_app_pin` — PIN lock code (default: 132303)
- `coltons_app_api_key` — Anthropic API key for AI tutor
- `coltons_app_openai_key` — OpenAI key for premium TTS

### API keys

- The Anthropic API key is entered in Settings and kept in the browser's localStorage. Never put a key in the code: this repository is public and every file is served to visitors. (A key that used to be embedded in app.js was removed on 23 Oct 2026 and must stay revoked.)
- OpenAI TTS key is optional, set in Settings.

## Common tasks

**Add a new spelling category**: Add a new key to `WORD_LISTS` in words.js with icon, color, and words array.

**Add a new reading passage**: Add to the appropriate category in `PASSAGE_LISTS` in passages.js.

**Change display defaults**: Look for the settings initialization in app.js — font, spacing, colors.

**Modify the AI tutor personality**: Edit the system prompt in ai.js.

**Add a new badge**: Add to the badge definitions in badges.js with icon, name, description, and unlock condition.

**Change the PIN**: Default is 132303. Can be changed in Settings inside the app, or edit `PIN_DEFAULT` in index.html.

## Railway security incident, 21 October 2026

Railway disclosed that an attacker decrypted some customer environment variables
(https://blog.railway.com/p/preliminary-report-october-security-incident). This
app keeps no secrets in Railway variables, so there is nothing to rotate there.
Railway also cut its GitHub integration: reconnect GitHub on the Railway service
(Settings → Source) so pushes to `main` deploy again, then confirm the site loads.

Separately, a check on 23 October 2026 found an Anthropic API key embedded
(base64-encoded) in `app.js`. The repository is public and the file is served to
every visitor, so that key was exposed. It has been removed from the code; the
key itself must be deleted in the Claude Console and a new one entered in the
app's Settings on each device. It remains in this repository's git history,
which is why revoking it is the fix.
