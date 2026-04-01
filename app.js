// ===== Auto-configure API key on first load =====
(function() {
    const _p = ["c2stYW50LWFwaTAzLUJFY0", "ZaRTdUZDg4UzVOV3l6OTZx", "VFFnV3Y3ZFhGTGhWeXNQc0", "FFSWFDM3EtajNFcE14TjBi", "ZWx3ekVjdDFRZHl0ZkpnUV", "AyQ1NNRkg0YjNRbU54R2ZR", "LVdwdzgzUUFB"];
    const _KEY_STORAGE = "coltons_app_api_key";
    if (!localStorage.getItem(_KEY_STORAGE)) {
        localStorage.setItem(_KEY_STORAGE, atob(_p.join("")));
    }
})();

// ===== State =====
const state = {
    section: "practice",    // "practice", "learn", "skills", "create"
    mode: "spell",          // "spell", "flash", or "lessons"
    currentCategory: null,
    isReviewMode: false,     // true when playing from review queue
    words: [],
    wordIndex: 0,
    placedLetters: [],
    bankLetters: [],
    score: 0,
    streak: 0,
    bestStreak: 0,
    level: 1,
    wordsCorrect: 0,
    wordsAttempted: 0,
    hintUsed: false,
    hintLevel: 0,
    attempts: 0,
    // Flashcard state
    flashFlipped: false,
    // Lesson state
    currentLesson: null,
    lessonStep: "teach",     // "teach", "practice", "quiz", "complete"
    // Quiz state
    quizWords: [],
    quizIndex: 0,
    quizCorrect: 0,
    quizTotal: 0,
    quizResults: [],         // [{word, correct, userAnswer}]
    // AI tracking
    wordResults: [],         // tracks {word, answer, correct} for session insight
    // Scramble state
    scrambleInput: "",
    // Daily challenge
    dailyChallengeWord: null,
    // Reading state
    currentPassage: null,
    passageIndex: 0,
    sentenceIndex: 0,
    readingStartTime: null,
    readingResults: [],        // [{word, correct, spokenAs}] per-word across all sentences
    readingStruggledWords: [], // unique struggled words for results screen
    recognitionActive: false,
    listenFirst: true,
    readSubMode: "read-listen",   // "read-listen" | "just-listen"
    justListenActive: false,
    justListenCancel: null,
    justListenStartIdx: 0,
    // Enhanced teach slides
    teachSlideIndex: 0,
    // Guided learning path
    guidedPath: null,  // { lessonId, category, step, words }
    // Spelling Bee
    spellingBee: null,  // { words, index, correct, total, results }
    // Word Review (after reading)
    wordReview: null,  // { words, index }
    // Phoneme game
    phonemeGame: null,  // { category, sounds, index, correct, total, results }
    // Morpheme builder
    morphemeGame: null, // { words, index, correct, total, builtParts, results }
    // Speed Drill
    speedDrill: null,   // { level, words, index, known, helped, startTime, wordStartTime, timerInterval, responseTimes }
    // Dictation
    dictation: null,    // { level, sentences, index, sentencesCorrect, totalWords, wordsCorrect, missedWords, results }
    // Comprehension
    comprehension: null, // { passage, questions, index, correct, total, results }
    // Interactive teach slides
    interactiveAnswered: false,
};

// ===== DOM Elements =====
const $ = (id) => document.getElementById(id);
const screens = {
    start: $("start-screen"),
    game: $("game-screen"),
    flash: $("flash-screen"),
    lesson: $("lesson-screen"),
    result: $("result-screen"),
    scramble: $("scramble-screen"),
    read: $("read-screen"),
    readResult: $("read-result-screen"),
    spellingbee: $("spellingbee-screen"),
    beeResult: $("bee-result-screen"),
    dashboard: $("dashboard-screen"),
    wordReview: $("word-review-screen"),
    phoneme: $("phoneme-screen"),
    phonemeResult: $("phoneme-result-screen"),
    morpheme: $("morpheme-screen"),
    morphemeResult: $("morpheme-result-screen"),
    speedLevel: $("speed-level-screen"),
    speedDrill: $("speed-drill-screen"),
    speedResult: $("speed-result-screen"),
    dictationSelect: $("dictation-select-screen"),
    dictation: $("dictation-screen"),
    dictationResult: $("dictation-result-screen"),
    comprehension: $("comprehension-screen"),
    comprehensionResult: $("comprehension-result-screen"),
    write: $("write-screen"),
    bdpq: $("bdpq-screen"),
    bdpqResult: $("bdpq-result-screen"),
};

// ===== Load Persistent Stats =====
function loadPersistentStats() {
    const saved = SRS.loadStats();
    state.score = saved.totalScore;
    state.level = saved.level;
    state.bestStreak = saved.bestStreak;
}

function savePersistentStats() {
    const saved = SRS.loadStats();
    saved.totalScore = state.score;
    saved.level = state.level;
    if (state.bestStreak > saved.bestStreak) saved.bestStreak = state.bestStreak;
    saved.totalWordsCorrect += state.wordsCorrect;
    saved.totalWordsAttempted += state.wordsAttempted;
    saved.sessionsPlayed++;
    SRS.saveStats(saved);
    SRS.recordDailyPractice();
    updateStreakDisplay();
}

// ===== Display / Dyslexia Settings =====
const DISPLAY_SETTINGS_KEY = "coltons_app_display";

const BG_THEMES = {
    default: { bg: "#fdf6e3", bgLight: "#f5eedc", surface: "#fff8ee", surfaceHover: "#f0e6d2", text: "#2c2416", textMuted: "#7a6e5d" },
    white:   { bg: "#ffffff", bgLight: "#f5f5f5", surface: "#ffffff", surfaceHover: "#f0f0f0", text: "#1a1a1a", textMuted: "#666" },
    blue:    { bg: "#e8f0fe", bgLight: "#d4e4fc", surface: "#f0f6ff", surfaceHover: "#dce8f8", text: "#1a2a3a", textMuted: "#5a6a7a" },
    green:   { bg: "#e8f5e9", bgLight: "#c8e6c9", surface: "#f1f8f1", surfaceHover: "#dcedc8", text: "#1b2e1b", textMuted: "#4a6a4a" },
    pink:    { bg: "#fce4ec", bgLight: "#f8bbd0", surface: "#fff0f5", surfaceHover: "#f5d5e0", text: "#2a1520", textMuted: "#7a5a6a" },
    yellow:  { bg: "#fffde7", bgLight: "#fff9c4", surface: "#fffff0", surfaceHover: "#f5f0d0", text: "#2c2816", textMuted: "#7a7660" },
    dark:    { bg: "#1a1a2e", bgLight: "#16213e", surface: "#0f3460", surfaceHover: "#1a3a6e", text: "#e0e0e0", textMuted: "#8899aa" },
};

function _loadDisplaySettings() {
    try {
        return JSON.parse(localStorage.getItem(DISPLAY_SETTINGS_KEY)) || {};
    } catch { return {}; }
}

function _saveDisplaySettings(s) {
    localStorage.setItem(DISPLAY_SETTINGS_KEY, JSON.stringify(s));
}

function applyDisplaySettings() {
    const s = _loadDisplaySettings();
    const root = document.documentElement;

    // Font
    const font = s.font || "Lexend";
    if (font === "OpenDyslexic") root.style.setProperty("--font", "'OpenDyslexic', sans-serif");
    else if (font === "system") root.style.setProperty("--font", "system-ui, -apple-system, sans-serif");
    else root.style.setProperty("--font", "'Lexend', sans-serif");

    // Font size
    root.style.setProperty("--user-font-size", (s.fontSize || 18) + "px");

    // Letter spacing
    const ls = s.letterSpacing || 2;
    root.style.setProperty("--user-letter-spacing", ls === 0 ? "normal" : (ls * 0.01) + "em");

    // Word spacing
    const ws = s.wordSpacing || 0;
    root.style.setProperty("--user-word-spacing", ws === 0 ? "normal" : (ws * 0.03) + "em");

    // Line height
    const lh = s.lineHeight || 16;
    root.style.setProperty("--user-line-height", (lh / 10).toFixed(1));

    // Background theme
    const theme = BG_THEMES[s.bgTheme || "default"];
    if (theme) {
        root.style.setProperty("--bg", theme.bg);
        root.style.setProperty("--bg-light", theme.bgLight);
        root.style.setProperty("--surface", theme.surface);
        root.style.setProperty("--surface-hover", theme.surfaceHover);
        root.style.setProperty("--text", theme.text);
        root.style.setProperty("--text-muted", theme.textMuted);
    }
    document.body.classList.toggle("theme-dark", s.bgTheme === "dark");

    // Bionic reading
    document.body.classList.toggle("bionic-mode", !!s.bionic);

    // Reading ruler
    const ruler = $("reading-ruler");
    if (ruler) {
        if (s.ruler) {
            ruler.classList.remove("hidden");
        } else {
            ruler.classList.add("hidden");
        }
    }
}

// Bionic text transform: bold first ~40% of each word
function bionicTransform(text) {
    if (!text) return text;
    return text.replace(/\b([a-zA-Z]+)\b/g, (match) => {
        const boldLen = Math.max(1, Math.ceil(match.length * 0.4));
        return `<b>${match.substring(0, boldLen)}</b>${match.substring(boldLen)}`;
    });
}

// Reading ruler — follows mouse/touch
function _initReadingRuler() {
    const WINDOW_HEIGHT = 60; // px — about 2-3 lines

    function updateRuler(y) {
        const top = Math.max(0, y - WINDOW_HEIGHT / 2);
        const rulerTop = $("ruler-top");
        const rulerWindow = $("ruler-window");
        const rulerBottom = $("ruler-bottom");
        if (!rulerTop) return;
        rulerTop.style.height = top + "px";
        rulerWindow.style.top = top + "px";
        rulerWindow.style.height = WINDOW_HEIGHT + "px";
        rulerBottom.style.top = (top + WINDOW_HEIGHT) + "px";
        rulerBottom.style.height = `calc(100vh - ${top + WINDOW_HEIGHT}px)`;
    }

    document.addEventListener("mousemove", (e) => {
        const s = _loadDisplaySettings();
        if (s.ruler) updateRuler(e.clientY);
    });

    document.addEventListener("touchmove", (e) => {
        const s = _loadDisplaySettings();
        if (s.ruler && e.touches[0]) updateRuler(e.touches[0].clientY);
    }, { passive: true });
}

// Initialize display settings on load
applyDisplaySettings();
_initReadingRuler();

// ===== Speech Engine =====
// Cloud TTS (OpenAI) when available, falls back to browser TTS.

let _cachedVoice = null;
let _voicesLoaded = false;
let _speechQueue = null; // track current speech chain so we can cancel

// --- Cloud TTS (OpenAI) ---
const OPENAI_TTS_URL = "https://api.openai.com/v1/audio/speech";
const OPENAI_KEY_STORAGE = "coltons_app_openai_key";
const OPENAI_VOICE_STORAGE = "coltons_app_openai_voice";
const _ttsAudioCache = new Map(); // text → Blob URL cache
let _currentAudio = null; // currently playing Audio element

function _getOpenAIKey() { return localStorage.getItem(OPENAI_KEY_STORAGE) || ""; }
function _setOpenAIKey(k) { localStorage.setItem(OPENAI_KEY_STORAGE, k.trim()); }
function _hasOpenAIKey() { return _getOpenAIKey().length > 0; }
function _getOpenAIVoice() { return localStorage.getItem(OPENAI_VOICE_STORAGE) || "nova"; }
function _setOpenAIVoice(v) { localStorage.setItem(OPENAI_VOICE_STORAGE, v); }

// Fetch audio from OpenAI TTS, returns a Blob URL (cached)
async function _cloudTTS(text, { speed = 1.0 } = {}) {
    if (!_hasOpenAIKey() || !text) return null;

    // Check cache
    const cacheKey = text.substring(0, 200) + "|" + _getOpenAIVoice() + "|" + speed;
    if (_ttsAudioCache.has(cacheKey)) return _ttsAudioCache.get(cacheKey);

    try {
        const resp = await fetch(OPENAI_TTS_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${_getOpenAIKey()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "tts-1",
                input: text,
                voice: _getOpenAIVoice(),
                speed: speed,
                response_format: "mp3",
            }),
        });
        if (!resp.ok) {
            console.warn("Cloud TTS error:", resp.status);
            return null;
        }
        const blob = await resp.blob();
        const url = URL.createObjectURL(blob);
        // Cache (limit cache size to 100 entries)
        if (_ttsAudioCache.size > 100) {
            const firstKey = _ttsAudioCache.keys().next().value;
            URL.revokeObjectURL(_ttsAudioCache.get(firstKey));
            _ttsAudioCache.delete(firstKey);
        }
        _ttsAudioCache.set(cacheKey, url);
        return url;
    } catch (err) {
        console.warn("Cloud TTS failed:", err);
        return null;
    }
}

// Play a cloud TTS audio URL, returns a Promise that resolves when done
function _playCloudAudio(url, { pause = 0 } = {}) {
    return new Promise(resolve => {
        if (_currentAudio) {
            _currentAudio.pause();
            _currentAudio = null;
        }
        const audio = new Audio(url);
        _currentAudio = audio;
        audio.onended = () => {
            _currentAudio = null;
            setTimeout(resolve, pause);
        };
        audio.onerror = () => {
            _currentAudio = null;
            setTimeout(resolve, pause);
        };
        audio.play().catch(() => setTimeout(resolve, pause));
    });
}

// Stop any playing cloud audio
function _stopCloudAudio() {
    if (_currentAudio) {
        _currentAudio.pause();
        _currentAudio.currentTime = 0;
        _currentAudio = null;
    }
}

// User-selected voice override (stored in localStorage)
const BROWSER_VOICE_STORAGE = "coltons_app_browser_voice";
function _getSavedBrowserVoice() { return localStorage.getItem(BROWSER_VOICE_STORAGE) || ""; }
function _setSavedBrowserVoice(name) { localStorage.setItem(BROWSER_VOICE_STORAGE, name); }

function _pickBestVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    // If user picked a specific voice, use it
    const saved = _getSavedBrowserVoice();
    if (saved) {
        const match = voices.find(v => v.name === saved);
        if (match) return match;
    }

    // Prefer English voices
    const enUS = voices.filter(v => v.lang === "en-US");
    const en = enUS.length > 0 ? enUS : voices.filter(v => v.lang.startsWith("en"));
    if (en.length === 0) return null;

    // Score each voice — higher is better, prefer most human-sounding
    function scoreVoice(v) {
        const n = v.name.toLowerCase();
        const isUS = v.lang === "en-US";
        const bonus = isUS ? 10 : 0;

        // Tier 0: Best-known Natural voices by exact name (Windows 11)
        if (/jenny.*natural/i.test(n))                 return 200 + bonus;
        if (/aria.*natural/i.test(n))                  return 195 + bonus;
        if (/guy.*natural/i.test(n))                   return 190 + bonus;
        if (/ana.*natural/i.test(n))                   return 188 + bonus;
        if (/andrew.*natural/i.test(n))                return 185 + bonus;
        if (/emma.*natural/i.test(n))                  return 183 + bonus;
        if (/brian.*natural/i.test(n))                 return 180 + bonus;
        if (/michelle.*natural/i.test(n))              return 178 + bonus;

        // Tier 1: Any Natural / Neural / Online voice
        if (/natural/i.test(n))                        return 160 + bonus;
        if (/neural/i.test(n))                         return 150 + bonus;
        if (/online/i.test(n) && /microsoft/i.test(n)) return 140 + bonus;

        // Tier 2: Apple high-quality voices
        if (/samantha.*enhanced|premium/i.test(n))     return 130 + bonus;
        if (/samantha/i.test(n))                       return 120 + bonus;
        if (/enhanced|premium/i.test(n))               return 115 + bonus;
        if (/alex/i.test(n))                           return 110 + bonus;

        // Tier 3: Google voices (Chrome)
        if (/google us english/i.test(n))              return 100;
        if (/google uk english/i.test(n))              return 90;
        if (/google/i.test(n))                         return 85 + bonus;

        // Tier 4: Other named voices
        if (/karen|daniel|moira|tessa|fiona/i.test(n)) return 70;

        // Tier 5: MS Desktop (robotic but usable)
        if (/zira/i.test(n))                           return 50 + bonus;
        if (/david/i.test(n))                          return 48 + bonus;
        if (/microsoft/i.test(n))                      return 45 + bonus;

        // Avoid these
        if (/(compact|espeak)/i.test(n))               return 5;
        return 30 + bonus;
    }

    en.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    console.log("[TTS] Selected voice:", en[0]?.name, "| Score:", scoreVoice(en[0]));
    return en[0];
}

// Get all English voices for the settings picker
function _getEnglishVoices() {
    return window.speechSynthesis.getVoices()
        .filter(v => v.lang.startsWith("en"))
        .sort((a, b) => a.name.localeCompare(b.name));
}

// Pre-process text for more natural speech
function _preprocessText(text) {
    let t = text;
    // Replace em-dashes with commas (creates a pause)
    t = t.replace(/\s*[—–]\s*/g, ", ");
    // Add micro-pause after "So" / "Now" / "OK" / "Alright" at start of sentences
    t = t.replace(/^(So|Now|OK|Okay|Alright|Well|Hey|Right)\b/i, "$1,");
    // Expand common abbreviations for clearer pronunciation
    t = t.replace(/\be\.g\./g, "for example");
    t = t.replace(/\bi\.e\./g, "that is");
    t = t.replace(/\betc\./g, "et cetera");
    // Add slight pause before "because", "but", "and then" for natural rhythm
    t = t.replace(/\s+(because|but|however|although)\s+/gi, ". $1 ");
    return t;
}

// Low-level: speak a single utterance, returns a Promise
function _utter(text, { rate = 0.88, pitch = 0.97, volume = 1, pause = 0 } = {}) {
    return new Promise(resolve => {
        const processed = _preprocessText(text);
        const u = new SpeechSynthesisUtterance(processed);
        u.rate = rate;
        u.pitch = pitch;
        u.volume = volume;
        const voice = _cachedVoice || _pickBestVoice();
        if (voice) {
            u.voice = voice;
            _cachedVoice = voice;
        }
        u.onend = () => setTimeout(resolve, pause);
        u.onerror = () => setTimeout(resolve, pause);
        window.speechSynthesis.speak(u);
    });
}

// Like _utter() but with onboundary support for word-level highlighting
function _utterWithBoundary(text, { rate = 0.85, pitch = 0.97, volume = 1, pause = 0, onWord = null } = {}) {
    return new Promise(resolve => {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate;
        u.pitch = pitch;
        u.volume = volume;
        const voice = _cachedVoice || _pickBestVoice();
        if (voice) u.voice = voice;

        let boundaryFired = false;
        if (onWord) {
            u.onboundary = (event) => {
                if (event.name === "word") {
                    boundaryFired = true;
                    onWord(event.charIndex);
                }
            };
        }

        u.onend = () => {
            // If onboundary never fired, signal fallback with -1
            if (onWord && !boundaryFired) {
                onWord(-1);
            }
            setTimeout(resolve, pause);
        };
        u.onerror = () => setTimeout(resolve, pause);
        window.speechSynthesis.speak(u);
    });
}

/**
 * speak() — short text (word names, "Correct!", etc.)
 * Uses cloud TTS if available, otherwise warm browser TTS.
 */
function speak(text, rate = 0.88) {
    _speechQueue = null;
    _stopCloudAudio();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    if (_hasOpenAIKey()) {
        // Cloud TTS for short text
        _cloudTTS(text, { speed: 1.0 }).then(url => {
            if (url) _playCloudAudio(url);
            else _browserSpeak(text, rate); // fallback
        });
    } else {
        _browserSpeak(text, rate);
    }
}

// Browser TTS fallback for speak()
function _browserSpeak(text, rate = 0.88) {
    if (!("speechSynthesis" in window)) return;
    setTimeout(() => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        const pitchVar = 0.98 + (Math.random() - 0.5) * 0.04;
        const rateVar = rate + (Math.random() - 0.5) * 0.04;
        _utter(text, { rate: rateVar, pitch: pitchVar });
    }, 50);
}

/**
 * speakNatural() — longer text (AI feedback, lesson content, session insights).
 * Uses cloud TTS for truly human sound, falls back to browser TTS with
 * clause-level chunking, pitch contour, and breathing pauses.
 */
function speakNatural(text) {
    if (!text) return;
    _stopCloudAudio();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if ("speechSynthesis" in window && window.speechSynthesis.paused) window.speechSynthesis.resume();

    // If cloud TTS available, use it — much more human
    if (_hasOpenAIKey()) {
        const token = {};
        _speechQueue = token;
        // For longer text, split into 2-3 sentence chunks for faster first response
        const sentences = text.replace(/([.!?])\s+/g, "$1|||").split("|||").map(s => s.trim()).filter(s => s);
        const chunks = [];
        let current = [];
        sentences.forEach(s => {
            current.push(s);
            if (current.length >= 2 || current.join(" ").length > 200) {
                chunks.push(current.join(" "));
                current = [];
            }
        });
        if (current.length > 0) chunks.push(current.join(" "));

        (async () => {
            for (let i = 0; i < chunks.length; i++) {
                if (_speechQueue !== token) return;
                const url = await _cloudTTS(chunks[i], { speed: 1.0 });
                if (_speechQueue !== token) return;
                if (url) {
                    await _playCloudAudio(url, { pause: i < chunks.length - 1 ? 250 : 0 });
                } else {
                    // Fallback to browser for this chunk
                    _browserSpeakNatural(chunks[i]);
                    return; // browser TTS handles the rest
                }
            }
        })();
        return;
    }

    // Browser TTS fallback
    _browserSpeakNatural(text);
}

function _browserSpeakNatural(text) {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();

    // Split on sentence-ending punctuation, then further split long sentences
    // at commas, dashes, colons, semicolons for more natural phrasing
    const rawSentences = text
        .replace(/([.!?])\s+/g, "$1|||")
        .split("|||")
        .map(s => s.trim())
        .filter(s => s.length > 0);

    // Break long sentences into clauses at natural pause points
    const chunks = [];
    rawSentences.forEach((sentence, sIdx) => {
        // If sentence is short enough, keep it whole
        if (sentence.length < 80) {
            chunks.push({ text: sentence, isEnd: true, sentenceIdx: sIdx, totalSentences: rawSentences.length });
            return;
        }
        // Split at commas, semicolons, colons, dashes — but keep punctuation
        const parts = sentence
            .split(/(?<=[,;:—–])\s+/)
            .map(p => p.trim())
            .filter(p => p.length > 0);
        parts.forEach((part, pIdx) => {
            chunks.push({
                text: part,
                isEnd: pIdx === parts.length - 1,
                isClause: pIdx < parts.length - 1,
                sentenceIdx: sIdx,
                totalSentences: rawSentences.length
            });
        });
    });

    // Cancel token
    const token = {};
    _speechQueue = token;

    (async () => {
        for (let i = 0; i < chunks.length; i++) {
            if (_speechQueue !== token) return;

            const chunk = chunks[i];
            const isFirst = i === 0;
            const isLast = i === chunks.length - 1;
            const isQuestion = chunk.text.endsWith("?");
            const isExclamation = chunk.text.endsWith("!");
            const progress = chunks.length > 1 ? i / (chunks.length - 1) : 0;

            // --- Rate: slower, warmer, teacher-paced ---
            let baseRate = 0.85;
            if (isFirst) baseRate = 0.78;                           // Start slow & warm
            else if (isLast) baseRate = 0.76;                       // Slow down to land the ending
            else if (chunk.isClause) baseRate = 0.87;               // Clauses flow a touch faster
            else baseRate = 0.80 + (Math.random() * 0.08);         // Vary between 0.80-0.88
            // Tiny per-chunk jitter
            const rate = baseRate + (Math.random() - 0.5) * 0.03;

            // --- Pitch: gentle contour, not too dramatic ---
            let pitch;
            if (isQuestion) pitch = 1.04;                           // Slight rise on questions
            else if (isExclamation) pitch = 1.02;                   // Warm energy
            else if (isFirst) pitch = 1.0;                          // Neutral, inviting start
            else if (isLast) pitch = 0.93;                          // Gentle drop to signal ending
            else {
                // Subtle arc — real teachers don't vary pitch wildly
                const arc = Math.sin(progress * Math.PI);
                pitch = 0.96 + arc * 0.04 + (Math.random() - 0.5) * 0.02;
            }

            // --- Pause: generous breathing room (slower = more human) ---
            let pause = 0;
            if (chunk.isClause) pause = 280 + Math.random() * 120;            // Breath at comma
            else if (chunk.isEnd && !isLast) pause = 500 + Math.random() * 250; // Real pause between sentences
            if (isQuestion && !isLast) pause += 200;                           // Let question land

            await _utter(chunk.text, { rate, pitch, pause });
        }
    })();
}

/**
 * speakWordTeach() — after missing a word.
 * Slow, clear, educational: word → syllables → letter-by-letter → word again.
 */
function speakWordTeach(word, syllables) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const token = {};
    _speechQueue = token;

    (async () => {
        // Step 1: "The word is: [word]" — slow and warm
        if (_speechQueue !== token) return;
        await _utter(`No worries, let's learn this one. The word is: ${word}`, { rate: 0.72, pitch: 0.95, pause: 650 });

        // Step 2: Syllable by syllable
        if (syllables && syllables.length > 1) {
            for (const syl of syllables) {
                if (_speechQueue !== token) return;
                await _utter(syl, { rate: 0.6, pitch: 0.97, pause: 420 });
            }
            await new Promise(r => setTimeout(r, 350));
        }

        // Step 3: Letter by letter
        for (const letter of word.split("")) {
            if (_speechQueue !== token) return;
            await _utter(letter.toUpperCase(), { rate: 0.85, pitch: 1.0, pause: 280 });
        }

        // Step 4: Full word one more time
        await new Promise(r => setTimeout(r, 450));
        if (_speechQueue !== token) return;
        await _utter(word, { rate: 0.85, pitch: 0.95, pause: 0 });
    })();
}

/**
 * speakWordAndSpell() — says the word, then spells it letter by letter.
 * E.g. "doubt" → "doubt ... D. O. U. B. T."
 * Optional onLetter(index) callback fires as each letter starts being spoken.
 * Optional onDone() callback fires when spelling is complete.
 */
function speakWordAndSpell(word, { onLetter, onDone } = {}) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();

    const token = {};
    _speechQueue = token;

    (async () => {
        // Step 1: Say the word
        if (_speechQueue !== token) return;
        await _utter(word, { rate: 0.7, pitch: 0.97, pause: 500 });

        // Step 2: Spell it letter by letter
        const letters = word.split("");
        for (let i = 0; i < letters.length; i++) {
            if (_speechQueue !== token) return;
            if (onLetter) onLetter(i);
            await _utter(letters[i].toUpperCase(), { rate: 0.85, pitch: 1.0, pause: 350 });
        }

        if (_speechQueue === token && onDone) onDone();
    })();
}

// Pre-load voices (browsers load them asynchronously)
if ("speechSynthesis" in window) {
    speechSynthesis.getVoices();
    speechSynthesis.onvoiceschanged = () => {
        _cachedVoice = _pickBestVoice();
        _voicesLoaded = true;
    };
    // Chrome bug workaround: speech synthesis can get stuck in "paused" state
    setInterval(() => {
        if (speechSynthesis.speaking && speechSynthesis.paused) {
            speechSynthesis.resume();
        }
    }, 1000);
}

// ===== Screen Management =====
function showScreen(name) {
    Object.values(screens).forEach((s) => { if (s) s.classList.remove("active"); });
    if (screens[name]) screens[name].classList.add("active");
}

// ================================================================
//  BOTTOM NAVIGATION + SUB-MODE CARDS
// ================================================================
const SECTION_MODES = {
    practice: [
        { mode: "spell",    icon: "🎯", name: "Spell It",      desc: "Drag letters to spell words" },
        { mode: "flash",    icon: "🃏", name: "Flashcards",    desc: "Flip and rate your knowledge" },
        { mode: "scramble", icon: "🔀", name: "Unscramble",    desc: "Put jumbled letters in order" },
        { mode: "speed",    icon: "⚡", name: "Speed Round",   desc: "How fast can you recognize words?" },
    ],
    learn: [
        { mode: "lessons",   icon: "📚", name: "Lessons",       desc: "Learn spelling rules step by step" },
        { mode: "read",      icon: "🎤", name: "Read Aloud",    desc: "Practice reading out loud" },
        { mode: "dictation", icon: "👂", name: "Listen & Type", desc: "Hear a sentence, type it out" },
    ],
    skills: [
        { mode: "phoneme",  icon: "🔊", name: "Sound Match",   desc: "Match sounds to spellings" },
        { mode: "morpheme", icon: "🧩", name: "Word Builder",  desc: "Build words from parts" },
        { mode: "bdpq",     icon: "🔤", name: "Letter Flip",   desc: "Train b/d/p/q recognition" },
    ],
    create: [
        { mode: "write", icon: "✏️", name: "Free Write", desc: "Write anything — use your voice or keyboard" },
    ],
};

// Bottom nav click handlers
document.querySelectorAll(".bottom-nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".bottom-nav-item").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        state.section = btn.dataset.section;

        // If only one mode in this section, go directly
        const modes = SECTION_MODES[state.section];
        if (modes && modes.length === 1) {
            state.mode = modes[0].mode;
            renderCategories();
        } else {
            // Show the home screen with sub-mode cards
            state.mode = "spell"; // reset
            showScreen("start");
            renderHomeScreen();
        }
    });
});

// Render the home screen: greeting + priority card + submode cards
function renderHomeScreen() {
    // Greeting
    const hour = new Date().getHours();
    let greeting = "Hey Colton";
    if (hour < 12) greeting = "Good morning, Colton";
    else if (hour < 17) greeting = "Hey Colton";
    else greeting = "Evening, Colton";

    const streak = SRS.getDailyStreak();
    let sub = "What do you want to work on?";
    if (streak >= 3) sub = `${streak}-day streak! Keep it going 🔥`;
    else if (SRS.getDueCount() > 0) sub = `You've got ${SRS.getDueCount()} words ready for review`;

    $("greeting-text").textContent = greeting;
    $("greeting-sub").textContent = sub;

    // Priority card
    renderPriorityCard();

    // Sub-mode cards
    renderSubModeCards();

    // Hide category grid until a mode is selected
    $("category-grid").innerHTML = "";
    const catTitle = $("category-title");
    if (catTitle) catTitle.style.display = "none";

    // Legacy: still call these for data loading
    loadAiRecommendation();
    renderDailyChallenge();

    // Show home elements, hide category elements
    $("home-greeting").style.display = "";
    $("submode-grid").style.display = "";
}

// Universal "go home" helper — use from all back buttons
function goHome() {
    state.mode = "spell";
    state.section = "practice";
    document.querySelectorAll(".mode-tab").forEach(t => t.classList.remove("active"));
    const spellTab = document.querySelector('.mode-tab[data-mode="spell"]');
    if (spellTab) spellTab.classList.add("active");
    // Reset bottom nav active state
    document.querySelectorAll(".bottom-nav-item").forEach(b => b.classList.remove("active"));
    const practiceBtn = document.querySelector('.bottom-nav-item[data-section="practice"]');
    if (practiceBtn) practiceBtn.classList.add("active");
    showScreen("start");
    updateReviewBanner();
    renderHomeScreen();
}

function renderPriorityCard() {
    const card = $("priority-card");
    const dueCount = SRS.getDueCount();
    const troubleWords = SRS.getTroubleWords(5);

    if (dueCount > 0) {
        card.classList.remove("hidden");
        card.innerHTML = `
            <span class="priority-card-icon">🔄</span>
            <div class="priority-card-body">
                <span class="priority-card-title">${dueCount} words ready for review</span>
                <span class="priority-card-sub">Keep your streak alive — quick review session</span>
            </div>
            <span class="priority-card-action">Let's go →</span>
        `;
        card.onclick = () => {
            $("btn-start-review").click();
        };
    } else if (troubleWords.length >= 3) {
        card.classList.remove("hidden");
        card.innerHTML = `
            <span class="priority-card-icon">🎯</span>
            <div class="priority-card-body">
                <span class="priority-card-title">${troubleWords.length} trouble words to practice</span>
                <span class="priority-card-sub">Words you've been working on</span>
            </div>
            <span class="priority-card-action">Practice →</span>
        `;
        card.onclick = () => {
            startTroubleWords();
        };
    } else {
        // Check daily challenge
        try {
            const dailyData = JSON.parse(localStorage.getItem("coltons_app_daily")) || {};
            const today = new Date().toISOString().split("T")[0];
            if (!dailyData.completedDate || dailyData.completedDate !== today) {
                card.classList.remove("hidden");
                card.innerHTML = `
                    <span class="priority-card-icon">📅</span>
                    <div class="priority-card-body">
                        <span class="priority-card-title">Daily Challenge</span>
                        <span class="priority-card-sub">One word a day keeps your skills sharp</span>
                    </div>
                    <span class="priority-card-action">Try it →</span>
                `;
                card.onclick = () => {
                    $("btn-daily-start").click();
                };
                return;
            }
        } catch {}
        card.classList.add("hidden");
    }
}

function renderSubModeCards() {
    const grid = $("submode-grid");
    grid.innerHTML = "";
    const modes = SECTION_MODES[state.section] || [];

    modes.forEach(m => {
        const card = document.createElement("button");
        card.className = "submode-card";
        card.innerHTML = `
            <span class="submode-icon">${m.icon}</span>
            <span class="submode-name">${m.name}</span>
            <span class="submode-desc">${m.desc}</span>
        `;
        card.addEventListener("click", () => {
            state.mode = m.mode;
            // Update hidden mode tabs for compatibility
            document.querySelectorAll(".mode-tab").forEach(t => t.classList.remove("active"));
            const matchTab = document.querySelector(`.mode-tab[data-mode="${m.mode}"]`);
            if (matchTab) matchTab.classList.add("active");
            renderCategories();
        });
        grid.appendChild(card);
    });
}

// Show/hide bottom nav based on screen
const _origShowScreen = showScreen;
showScreen = function(name) {
    _origShowScreen(name);
    const nav = $("bottom-nav");
    if (nav) {
        // Show bottom nav only on start screen
        nav.style.display = (name === "start") ? "flex" : "none";
    }
};

// Legacy mode-tab handler (still needed for back buttons that set mode tabs)
document.querySelectorAll(".mode-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
        document.querySelectorAll(".mode-tab").forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        state.mode = tab.dataset.mode;
        renderCategories();
    });
});

// ================================================================
//  REVIEW BANNER
// ================================================================
function updateReviewBanner() {
    const dueCount = SRS.getDueCount();
    const banner = $("review-banner");
    if (dueCount > 0) {
        banner.classList.remove("hidden");
        $("review-count").textContent = dueCount;
    } else {
        banner.classList.add("hidden");
    }
}

$("btn-start-review").addEventListener("click", () => {
    startReview();
});

function startReview() {
    const dueWords = SRS.getDueWords(12);
    if (dueWords.length === 0) return;

    state.isReviewMode = true;
    state.currentCategory = "Review";
    state.words = dueWords;
    state.wordIndex = 0;
    state.wordsCorrect = 0;
    state.wordsAttempted = 0;
    state.wordResults = [];

    if (state.mode === "flash") {
        showScreen("flash");
        $("flash-category-label").textContent = "🔄 Review";
        loadFlashcard();
    } else {
        showScreen("game");
        $("category-label").textContent = "🔄 Review";
        loadWord();
    }
}

// ================================================================
//  CATEGORY SCREEN
// ================================================================
function renderCategories() {
    const grid = $("category-grid");
    const title = document.querySelector(".screen-title");
    grid.innerHTML = "";

    // Hide home elements, show category elements
    if ($("home-greeting")) $("home-greeting").style.display = "none";
    if ($("submode-grid")) $("submode-grid").style.display = "none";
    if ($("priority-card")) $("priority-card").classList.add("hidden");
    if (title) title.style.display = "";
    const catTitle = $("category-title");
    if (catTitle) catTitle.style.display = "";

    // Refresh AI recommendation when returning to home screen
    loadAiRecommendation();

    // Show daily challenge
    renderDailyChallenge();

    // Phoneme mode shows category selection
    if (state.mode === "phoneme") {
        title.textContent = "Phoneme-Grapheme Mapping";
        const catColors = { "Digraphs": "#6c5ce7", "Blends": "#e17055", "Vowel Teams": "#00b894" };
        const catIcons = { "Digraphs": "\uD83D\uDD24", "Blends": "\uD83E\uDDE9", "Vowel Teams": "\uD83C\uDFB5" };
        Object.entries(PHONEME_DATA).forEach(([cat, sounds]) => {
            const card = document.createElement("button");
            card.className = "category-card";
            card.style.setProperty("--card-color", catColors[cat] || "#5b4bb5");
            card.innerHTML = `
                <span class="category-icon">${catIcons[cat] || "\uD83D\uDD0A"}</span>
                <span class="category-name">${cat}</span>
                <span class="category-count">${sounds.length} sounds</span>
            `;
            card.addEventListener("click", () => startPhonemeGame(cat));
            grid.appendChild(card);
        });
        return;
    }

    // Morpheme mode goes straight into the builder
    if (state.mode === "morpheme") {
        title.textContent = "Morpheme Word Builder";
        const card = document.createElement("button");
        card.className = "category-card";
        card.style.setProperty("--card-color", "#5b4bb5");
        card.innerHTML = `
            <span class="category-icon">\uD83E\uDDF1</span>
            <span class="category-name">Build Words</span>
            <span class="category-count">${MORPHEME_DATA.words.length} words</span>
        `;
        card.addEventListener("click", () => startMorphemeBuilder());
        grid.appendChild(card);

        // Legend
        const legend = document.createElement("div");
        legend.className = "morpheme-legend";
        legend.innerHTML = `
            <span class="morpheme-legend-item"><span class="morpheme-legend-dot prefix-dot"></span> Prefix</span>
            <span class="morpheme-legend-item"><span class="morpheme-legend-dot root-dot"></span> Root</span>
            <span class="morpheme-legend-item"><span class="morpheme-legend-dot suffix-dot"></span> Suffix</span>
        `;
        grid.appendChild(legend);
        return;
    }

    // Speed Drill mode goes to level selection
    if (state.mode === "speed") {
        showScreen("speedLevel");
        renderSpeedLevelSelect();
        return;
    }

    // Dictation mode goes to level selection
    if (state.mode === "dictation") {
        showScreen("dictationSelect");
        renderDictationLevelSelect();
        return;
    }

    // Write mode goes straight to writing screen
    if (state.mode === "write") {
        showScreen("write");
        initWriteMode();
        return;
    }

    // b/d/p/q mode goes straight to training
    if (state.mode === "bdpq") {
        startBdpqTraining();
        return;
    }

    // Scramble mode shows same categories but starts scramble game
    if (state.mode === "scramble") {
        title.textContent = "Choose a Category";
        Object.entries(WORD_LISTS).forEach(([name, data]) => {
            const card = document.createElement("button");
            card.className = "category-card";
            card.style.setProperty("--card-color", data.color);
            card.innerHTML = `
                <span class="category-icon">${data.icon}</span>
                <span class="category-name">${name}</span>
                <span class="category-count">${data.words.length} words</span>
            `;
            card.addEventListener("click", () => startScramble(name));
            grid.appendChild(card);
        });
        return;
    }

    // Lessons mode shows lessons list
    if (state.mode === "lessons") {
        title.textContent = "Spelling Lessons";
        renderLessonList(grid);
        return;
    }

    // Reading mode shows passage categories
    if (state.mode === "read") {
        title.textContent = "Choose a Passage";
        Object.entries(PASSAGE_LISTS).forEach(([name, data]) => {
            if (data.book) {
                // Books: show a header card, then individual chapter cards
                const header = document.createElement("div");
                header.className = "category-book-header";
                header.style.setProperty("--card-color", data.color);
                header.innerHTML = `
                    <span class="category-icon">${data.icon}</span>
                    <span class="category-name">${name}</span>
                    <span class="category-count">by ${data.author} \u2022 ${data.passages.length} chapters</span>
                `;
                grid.appendChild(header);

                data.passages.forEach((passage, idx) => {
                    const card = document.createElement("button");
                    card.className = "category-card category-card-chapter";
                    card.style.setProperty("--card-color", data.color);
                    card.innerHTML = `
                        <span class="category-icon">${data.icon}</span>
                        <span class="category-name">${passage.title}</span>
                        <span class="category-count">${passage.wordCount} words</span>
                    `;
                    card.addEventListener("click", () => startReading(name, idx));
                    grid.appendChild(card);
                });
            } else {
                // Short passage categories: one card per category, random passage
                const card = document.createElement("button");
                card.className = "category-card";
                card.style.setProperty("--card-color", data.color);
                card.innerHTML = `
                    <span class="category-icon">${data.icon}</span>
                    <span class="category-name">${name}</span>
                    <span class="category-count">${data.passages.length} passages</span>
                `;
                card.addEventListener("click", () => startReading(name));
                grid.appendChild(card);
            }
        });
        return;
    }

    title.textContent = "Choose a Category";

    // --- Trouble Words card (adaptive — always first if there are trouble words) ---
    const troubleWords = SRS.getTroubleWords(15);
    if (troubleWords.length >= 3) {
        const tCard = document.createElement("button");
        tCard.className = "category-card trouble-card";
        tCard.style.setProperty("--card-color", "#d63031");
        tCard.innerHTML = `
            <span class="category-icon">🎯</span>
            <span class="category-name">Trouble Words</span>
            <span class="category-count">${troubleWords.length} words to review</span>
            <span class="category-badge badge-trouble">Personalized</span>
        `;
        tCard.addEventListener("click", () => {
            if (state.mode === "flash") {
                startFlashcards("__trouble__");
            } else if (state.mode === "scramble") {
                startScramble("__trouble__");
            } else {
                startTroubleWords();
            }
        });
        grid.appendChild(tCard);
    }

    // --- Recommended Lessons banner ---
    const recLessons = SRS.getRecommendedLessons(2);
    if (recLessons.length > 0 && state.mode === "spell") {
        const weakPatterns = SRS.getWeakPatterns();
        if (weakPatterns.length > 0) {
            const recBanner = document.createElement("div");
            recBanner.className = "rec-banner";
            const patternText = weakPatterns.slice(0, 2).map(p => p.label).join(" & ");
            const lessonLinks = recLessons.map(r => {
                const lesson = typeof LESSONS !== "undefined" ? LESSONS.find(l => l.id === r.lessonId) : null;
                return lesson ? `<button class="btn btn-sm rec-lesson-btn" data-lesson-id="${r.lessonId}">${lesson.icon || "📖"} ${lesson.title}</button>` : "";
            }).filter(h => h).join("");

            recBanner.innerHTML = `
                <div class="rec-banner-text">
                    <span class="rec-banner-icon">💡</span>
                    <span>You've been struggling with <strong>${patternText}</strong>. Try these lessons:</span>
                </div>
                <div class="rec-banner-lessons">${lessonLinks}</div>
            `;
            grid.appendChild(recBanner);

            // Attach listeners
            recBanner.querySelectorAll(".rec-lesson-btn").forEach(btn => {
                btn.addEventListener("click", () => {
                    const lessonId = btn.dataset.lessonId;
                    const lesson = LESSONS.find(l => l.id === lessonId);
                    if (lesson) {
                        state.mode = "lessons";
                        startLesson(lesson);
                    }
                });
            });
        }
    }

    // --- Regular categories ---
    Object.entries(WORD_LISTS).forEach(([name, data]) => {
        const card = document.createElement("button");
        card.className = "category-card";
        card.style.setProperty("--card-color", data.color);

        // Count due words in this category
        const dueInCategory = SRS.getDueWords(100).filter(
            (w) => w._srsEntry.category === name
        ).length;
        const badgeHTML = dueInCategory > 0
            ? `<span class="category-badge">🔄 ${dueInCategory} due</span>`
            : "";

        card.innerHTML = `
            <span class="category-icon">${data.icon}</span>
            <span class="category-name">${name}</span>
            <span class="category-count">${data.words.length} words</span>
            ${badgeHTML}
        `;
        card.addEventListener("click", () => {
            if (state.mode === "flash") {
                startFlashcards(name);
            } else if (state.mode === "scramble") {
                startScramble(name);
            } else {
                startCategory(name);
            }
        });
        grid.appendChild(card);
    });
}

// ================================================================
//  SPELL MODE (existing word builder)
// ================================================================
// --- Trouble Words (adaptive practice) ---
function startTroubleWords() {
    const troubleWords = SRS.getTroubleWords(12);
    if (troubleWords.length === 0) return;

    state.isReviewMode = false;
    state.currentCategory = "Trouble Words";
    state.words = shuffle(troubleWords);
    state.wordIndex = 0;
    state.wordsCorrect = 0;
    state.wordsAttempted = 0;
    state.wordResults = [];
    showScreen("game");
    $("category-label").textContent = "🎯 Trouble Words";
    loadWord();
}

function startCategory(name) {
    state.isReviewMode = false;
    state.currentCategory = name;
    state.words = shuffle([...WORD_LISTS[name].words]);
    state.wordIndex = 0;
    state.wordsCorrect = 0;
    state.wordsAttempted = 0;
    state.wordResults = [];
    showScreen("game");
    $("category-label").textContent = `${WORD_LISTS[name].icon} ${name}`;
    loadWord();
}

function loadWord() {
    const wordData = state.words[state.wordIndex];
    state.placedLetters = [];
    state.hintUsed = false;
    state.hintLevel = 0;
    state.attempts = 0;

    $("word-counter").textContent = `${state.wordIndex + 1} / ${state.words.length}`;

    $("hint-text").textContent = wordData.hint;
    $("btn-hint").textContent = "Show Syllables";
    $("btn-hint").classList.remove("hidden");

    const wordLetters = wordData.word.toLowerCase().split("");
    const distractors = generateDistractors(wordData.word, Math.min(3, Math.ceil(wordLetters.length * 0.25)));
    state.bankLetters = shuffle([...wordLetters, ...distractors]).map((letter, i) => ({
        letter,
        id: `bank-${i}`,
        used: false,
    }));

    renderBank();
    renderDropZone();
    resetFeedback();

    const actions = document.querySelector(".actions");
    actions.innerHTML = `
        <button class="btn btn-clear" id="btn-clear">Clear</button>
        <button class="btn btn-check" id="btn-check">Check</button>
    `;
    $("btn-clear").addEventListener("click", clearDropZone);
    $("btn-check").addEventListener("click", checkAnswer);

    // Auto-speak the word then spell it out
    setTimeout(() => speakWordAndSpell(wordData.word), 300);
}

function generateDistractors(word, count) {
    const common = "etaoinsrhldcumfpgwybvkxjqz";
    const wordLetters = new Set(word.toLowerCase());
    const distractors = [];
    for (const ch of common) {
        if (distractors.length >= count) break;
        if (!wordLetters.has(ch)) distractors.push(ch);
    }
    return distractors;
}

function renderBank() {
    const bank = $("letter-bank");
    bank.innerHTML = "";

    state.bankLetters.forEach((item) => {
        const tile = document.createElement("div");
        tile.className = `letter-tile${item.used ? " used" : ""}`;
        tile.textContent = item.letter;
        tile.dataset.bankId = item.id;
        tile.setAttribute("role", "button");
        tile.setAttribute("aria-label", `Letter ${item.letter}`);
        tile.setAttribute("tabindex", "0");
        tile.draggable = true;

        tile.addEventListener("dragstart", onBankDragStart);
        tile.addEventListener("click", () => { if (!item.used) placeLetter(item); });
        tile.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!item.used) placeLetter(item);
            }
        });

        bank.appendChild(tile);
    });
}

function renderDropZone() {
    const slots = $("drop-slots");
    const placeholder = $("drop-placeholder");
    slots.innerHTML = "";

    if (state.placedLetters.length === 0) {
        placeholder.classList.remove("hidden");
    } else {
        placeholder.classList.add("hidden");
        state.placedLetters.forEach((item, index) => {
            const tile = document.createElement("div");
            tile.className = "letter-tile";
            tile.textContent = item.letter;
            tile.dataset.index = index;
            tile.setAttribute("role", "button");
            tile.setAttribute("aria-label", `Placed letter ${item.letter}, position ${index + 1}`);
            tile.setAttribute("tabindex", "0");
            tile.draggable = true;

            tile.addEventListener("click", () => removeLetter(index));
            tile.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " " || e.key === "Backspace") {
                    e.preventDefault();
                    removeLetter(index);
                }
            });
            tile.addEventListener("dragstart", onSlotDragStart);
            tile.addEventListener("dragover", onSlotDragOver);
            tile.addEventListener("drop", onSlotDrop);

            slots.appendChild(tile);
        });
    }
}

function placeLetter(bankItem) {
    bankItem.used = true;
    state.placedLetters.push({ letter: bankItem.letter, bankId: bankItem.id });
    renderBank();
    renderDropZone();
    resetFeedback();
}

function removeLetter(index) {
    const removed = state.placedLetters.splice(index, 1)[0];
    const bankItem = state.bankLetters.find((b) => b.id === removed.bankId);
    if (bankItem) bankItem.used = false;
    renderBank();
    renderDropZone();
    resetFeedback();
}

function clearDropZone() {
    state.placedLetters.forEach((placed) => {
        const bankItem = state.bankLetters.find((b) => b.id === placed.bankId);
        if (bankItem) bankItem.used = false;
    });
    state.placedLetters = [];
    renderBank();
    renderDropZone();
    resetFeedback();
}

// ===== Drag & Drop =====
let dragData = null;

function onBankDragStart(e) {
    const bankId = e.target.dataset.bankId;
    dragData = { type: "bank", bankId };
    e.dataTransfer.effectAllowed = "move";
    e.target.style.opacity = "0.5";
    setTimeout(() => (e.target.style.opacity = ""), 0);

    $("drop-zone").addEventListener("dragover", onDropZoneDragOver);
    $("drop-zone").addEventListener("dragleave", onDropZoneDragLeave);
    $("drop-zone").addEventListener("drop", onDropZoneDrop);
}

function onDropZoneDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    $("drop-zone").classList.add("drag-over");
}

function onDropZoneDragLeave() {
    $("drop-zone").classList.remove("drag-over");
}

function onDropZoneDrop(e) {
    e.preventDefault();
    $("drop-zone").classList.remove("drag-over");
    if (dragData?.type === "bank") {
        const bankItem = state.bankLetters.find((b) => b.id === dragData.bankId);
        if (bankItem && !bankItem.used) placeLetter(bankItem);
    }
    dragData = null;
}

function onSlotDragStart(e) {
    dragData = { type: "slot", index: parseInt(e.target.dataset.index) };
    e.dataTransfer.effectAllowed = "move";
}

function onSlotDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
}

function onSlotDrop(e) {
    e.preventDefault();
    if (dragData?.type === "slot") {
        const fromIndex = dragData.index;
        const toIndex = parseInt(e.target.dataset.index);
        if (fromIndex !== toIndex) {
            const [moved] = state.placedLetters.splice(fromIndex, 1);
            state.placedLetters.splice(toIndex, 0, moved);
            renderDropZone();
        }
    }
    dragData = null;
}

// ===== Touch Support =====
(function initTouchDrag() {
    let touchItem = null;
    let ghost = null;

    document.addEventListener("touchstart", (e) => {
        const tile = e.target.closest(".letter-bank .letter-tile:not(.used)");
        if (!tile) return;
        const bankId = tile.dataset.bankId;
        touchItem = state.bankLetters.find((b) => b.id === bankId);
        if (!touchItem) return;

        ghost = tile.cloneNode(true);
        ghost.className = "letter-tile drag-ghost";
        ghost.style.width = tile.offsetWidth + "px";
        ghost.style.height = tile.offsetHeight + "px";
        document.body.appendChild(ghost);

        const touch = e.touches[0];
        ghost.style.left = touch.clientX - tile.offsetWidth / 2 + "px";
        ghost.style.top = touch.clientY - tile.offsetHeight / 2 + "px";
    }, { passive: true });

    document.addEventListener("touchmove", (e) => {
        if (!ghost) return;
        const touch = e.touches[0];
        ghost.style.left = touch.clientX - ghost.offsetWidth / 2 + "px";
        ghost.style.top = touch.clientY - ghost.offsetHeight / 2 + "px";

        const dropZone = $("drop-zone");
        const rect = dropZone.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            dropZone.classList.add("drag-over");
        } else {
            dropZone.classList.remove("drag-over");
        }
    }, { passive: true });

    document.addEventListener("touchend", (e) => {
        if (!ghost || !touchItem) { cleanup(); return; }
        const dropZone = $("drop-zone");
        dropZone.classList.remove("drag-over");

        const touch = e.changedTouches[0];
        const rect = dropZone.getBoundingClientRect();
        if (touch.clientX >= rect.left && touch.clientX <= rect.right &&
            touch.clientY >= rect.top && touch.clientY <= rect.bottom) {
            if (!touchItem.used) placeLetter(touchItem);
        }
        cleanup();
    });

    function cleanup() {
        if (ghost) ghost.remove();
        ghost = null;
        touchItem = null;
    }
})();

// ===== Check Answer =====
function checkAnswer() {
    const wordData = state.words[state.wordIndex];
    const answer = state.placedLetters.map((l) => l.letter).join("");
    const correct = wordData.word.toLowerCase();

    state.attempts++;

    if (answer === correct) {
        onCorrect(wordData);
    } else {
        onIncorrect(wordData, answer, correct);
    }
}

function onCorrect(wordData) {
    state.wordsCorrect++;
    Sound.correct();
    state.wordsAttempted++;
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;

    let points = 10;
    if (state.attempts === 1) points += 5;
    if (!state.hintUsed) points += 5;
    state.score += points;
    state.level = Math.floor(state.score / 50) + 1;

    // Check for level up
    const prevLevel = Math.floor((state.score - points) / 50) + 1;
    if (state.level > prevLevel) Sound.levelUp();

    updateStats();

    // Record in SRS
    const category = state.isReviewMode ? wordData._srsEntry.category : state.currentCategory;
    SRS.recordResult(category, wordData, true, state.attempts);

    // Mark daily challenge complete
    if (state.dailyChallengeWord) {
        const d = getDailyChallenge();
        d.completed = true;
        localStorage.setItem("coltons_app_daily", JSON.stringify(d));
        state.dailyChallengeWord = null;
    }

    const slots = $("drop-slots");
    slots.querySelectorAll(".letter-tile").forEach((tile) => tile.classList.add("correct"));
    $("drop-zone").classList.add("correct");

    showFeedback("success", getCorrectMessage());

    // Show sentence context
    const wordData2 = state.words[state.wordIndex];
    if (wordData2.sentence) {
        $("sentence-display").classList.remove("hidden");
        $("sentence-text").textContent = wordData2.sentence;
    }

    speak(`Correct! ${wordData.word}`);

    // Track for session insight
    state.wordResults.push({ word: wordData.word, answer: wordData.word.toLowerCase(), correct: true });

    // AI feedback (async, non-blocking)
    $("ai-feedback").classList.add("hidden");
    showAiFeedback("ai-feedback", "ai-feedback-text", wordData, wordData.word.toLowerCase(), true, state.attempts, category);

    const actions = document.querySelector(".actions");
    if (state.wordIndex < state.words.length - 1) {
        actions.innerHTML = `<button class="btn btn-next" id="btn-next">Next Word</button>`;
        $("btn-next").addEventListener("click", nextWord);
    } else {
        actions.innerHTML = `<button class="btn btn-next" id="btn-finish">See Results</button>`;
        $("btn-finish").addEventListener("click", showResults);
    }
}

function onIncorrect(wordData, answer, correct) {
    state.streak = 0;
    Sound.incorrect();
    updateStats();

    const slots = $("drop-slots").querySelectorAll(".letter-tile");
    slots.forEach((tile, i) => {
        if (i < correct.length && answer[i] === correct[i]) {
            tile.classList.add("correct");
        } else {
            tile.classList.add("incorrect");
        }
    });
    $("drop-zone").classList.add("incorrect");

    // Analyze the specific error
    const errorTip = analyzeSpellingError(wordData.word, answer);

    if (state.attempts >= 3) {
        state.wordsAttempted++;
        showFeedbackWithTip("feedback", "error", `Tough word! The answer was: ${wordData.word}`, errorTip);
        speakWordTeach(wordData.word, wordData.syllables);

        // Record failure in SRS
        const category = state.isReviewMode ? wordData._srsEntry.category : state.currentCategory;
        SRS.recordResult(category, wordData, false, state.attempts);

        // Track for session insight
        state.wordResults.push({ word: wordData.word, answer, correct: false });

        // AI feedback (async, non-blocking)
        $("ai-feedback").classList.add("hidden");
        showAiFeedback("ai-feedback", "ai-feedback-text", wordData, answer, false, state.attempts, category);

        const actions = document.querySelector(".actions");
        if (state.wordIndex < state.words.length - 1) {
            actions.innerHTML = `<button class="btn btn-next" id="btn-next">Next Word</button>`;
            $("btn-next").addEventListener("click", nextWord);
        } else {
            actions.innerHTML = `<button class="btn btn-next" id="btn-finish">See Results</button>`;
            $("btn-finish").addEventListener("click", showResults);
        }
    } else {
        showFeedbackWithTip("feedback", "error", null, errorTip);

        if (state.hintLevel < 2) {
            state.hintLevel = 2;
            state.hintUsed = true;
            showSyllableHint(wordData);
        }

        setTimeout(() => {
            $("drop-zone").classList.remove("incorrect");
            slots.forEach((tile) => tile.classList.remove("incorrect"));
        }, 800);
    }
}

function nextWord() {
    state.wordIndex++;
    $("drop-zone").classList.remove("correct", "incorrect");
    loadWord();
}

// ===== Hints =====
$("btn-hint").addEventListener("click", () => {
    const wordData = state.words[state.wordIndex];
    state.hintUsed = true;
    state.hintLevel++;

    if (state.hintLevel >= 2) {
        showSyllableHint(wordData);
        $("btn-hint").classList.add("hidden");
    }
});

function showSyllableHint(wordData) {
    const syllableHTML = wordData.syllables
        .map((s) => `<span class="syllable">${s}</span>`)
        .join("");
    $("hint-text").innerHTML = `${wordData.hint}<br>${syllableHTML}`;
    $("btn-hint").classList.add("hidden");
}

// ===== Hear Word (Spell Mode) =====
$("btn-hear").addEventListener("click", () => {
    const wordData = state.words[state.wordIndex];
    speakWordAndSpell(wordData.word);
});

// ===== Back Button (Spell Mode) =====
$("btn-back").addEventListener("click", () => {
    savePersistentStats();
    goHome();
});

// ================================================================
//  FLASHCARD MODE
// ================================================================
function startFlashcards(name) {
    state.isReviewMode = false;
    state.currentCategory = name;
    state.words = shuffle([...WORD_LISTS[name].words]);
    state.wordIndex = 0;
    state.wordsCorrect = 0;
    state.wordsAttempted = 0;
    state.wordResults = [];
    showScreen("flash");
    $("flash-category-label").textContent = `${WORD_LISTS[name].icon} ${name}`;
    loadFlashcard();
}

function loadFlashcard() {
    const wordData = state.words[state.wordIndex];
    state.flashFlipped = false;

    $("flash-counter").textContent = `${state.wordIndex + 1} / ${state.words.length}`;

    // Front
    $("flash-word").textContent = wordData.word;
    $("flash-hint").textContent = wordData.hint;

    // Back
    const syllableHTML = wordData.syllables
        .map((s) => `<span class="syllable">${s}</span>`)
        .join("");
    $("flash-syllables").innerHTML = syllableHTML;
    $("flash-spelling").textContent = wordData.word;
    $("flash-back-hint").textContent = wordData.hint;

    // Reset card
    $("flashcard").classList.remove("flipped");
    $("flash-rating").classList.remove("visible");
    $("flash-ai-feedback").classList.add("hidden");
    $("flash-continue").classList.add("hidden");

    // Set up spell-along
    initSpellAlong(wordData.word);

    // Auto-speak the word then spell it out with letter callbacks
    setTimeout(() => {
        speakWordAndSpell(wordData.word, {
            onLetter: (idx) => highlightSpellSlot(idx),
            onDone: () => finishSpellAlong(),
        });
    }, 300);
}

// ===== Flashcard Spell-Along =====
let _spellAlongWord = "";
let _spellAlongIndex = 0;
let _spellAlongDone = false;

function initSpellAlong(word) {
    _spellAlongWord = word.toLowerCase();
    _spellAlongIndex = 0;
    _spellAlongDone = false;

    const container = $("flash-spell-letters");
    container.innerHTML = "";

    // Create a slot for each letter
    word.split("").forEach((letter, i) => {
        const slot = document.createElement("div");
        slot.className = "flash-spell-slot";
        slot.dataset.index = i;
        slot.textContent = "_";
        container.appendChild(slot);
    });

    // Show the spell-along area, hide result
    $("flash-spell-along").classList.remove("hidden");
    $("flash-spell-result").classList.add("hidden");
    $("flash-spell-result").textContent = "";

    // Highlight first slot
    const first = container.querySelector('[data-index="0"]');
    if (first) first.classList.add("current");

    // Focus the input
    const input = $("flash-spell-input");
    input.value = "";
    input.disabled = false;
    setTimeout(() => input.focus(), 400);
}

function highlightSpellSlot(idx) {
    // Move the "current" highlight as the letter is being spoken
    document.querySelectorAll(".flash-spell-slot").forEach(el => {
        el.classList.remove("current");
    });
    const slot = document.querySelector(`.flash-spell-slot[data-index="${idx}"]`);
    if (slot && !slot.classList.contains("correct") && !slot.classList.contains("incorrect")) {
        slot.classList.add("current");
    }
}

function finishSpellAlong() {
    _spellAlongDone = true;
    // Remove current highlight from any remaining slots
    // (user may still be typing)
}

function handleSpellAlongInput(typed) {
    if (_spellAlongIndex >= _spellAlongWord.length) return;

    const expected = _spellAlongWord[_spellAlongIndex];
    const slot = document.querySelector(`.flash-spell-slot[data-index="${_spellAlongIndex}"]`);
    if (!slot) return;

    slot.textContent = typed;
    slot.classList.remove("current");

    if (typed === expected) {
        slot.classList.add("correct", "filled");
    } else {
        slot.classList.add("incorrect", "filled");
        // Show the correct letter after a brief moment
        setTimeout(() => {
            slot.textContent = expected;
            slot.classList.remove("incorrect");
            slot.classList.add("correct");
        }, 600);
    }

    _spellAlongIndex++;

    // Highlight next slot
    if (_spellAlongIndex < _spellAlongWord.length) {
        const next = document.querySelector(`.flash-spell-slot[data-index="${_spellAlongIndex}"]`);
        if (next) next.classList.add("current");
    }

    // Check if complete
    if (_spellAlongIndex >= _spellAlongWord.length) {
        $("flash-spell-input").disabled = true;
        // Count correct letters
        const correctCount = document.querySelectorAll(".flash-spell-slot.correct").length;
        const total = _spellAlongWord.length;
        const resultEl = $("flash-spell-result");
        resultEl.classList.remove("hidden", "success", "retry");

        if (correctCount === total) {
            resultEl.textContent = "Perfect spelling!";
            resultEl.classList.add("success");
            Sound.correct();
        } else {
            resultEl.textContent = `${correctCount}/${total} letters — keep practicing!`;
            resultEl.classList.add("retry");
        }
    }

    // Clear input for next letter
    $("flash-spell-input").value = "";
}

// Spell-along input handler
$("flash-spell-input").addEventListener("input", (e) => {
    const val = (e.target.value || "").toLowerCase().trim();
    if (val.length > 0) {
        handleSpellAlongInput(val[0]);
    }
});

// Also handle keyboard for mobile compatibility
$("flash-spell-input").addEventListener("keydown", (e) => {
    // Let input event handle the character
    // But handle Backspace — do nothing special
});

function flipFlashcard() {
    state.flashFlipped = !state.flashFlipped;
    $("flashcard").classList.toggle("flipped", state.flashFlipped);

    if (state.flashFlipped) {
        $("flash-rating").classList.add("visible");
        $("flash-spell-along").classList.add("hidden");
        // Speak the word again on flip
        const wordData = state.words[state.wordIndex];
        speak(wordData.word, 0.7);
    } else {
        $("flash-rating").classList.remove("visible");
        $("flash-spell-along").classList.remove("hidden");
    }
}

// Flashcard click to flip
$("flashcard").addEventListener("click", (e) => {
    // Don't flip if clicking the hear button
    if (e.target.closest("#btn-flash-hear")) return;
    flipFlashcard();
});

// Flashcard hear button
$("btn-flash-hear").addEventListener("click", (e) => {
    e.stopPropagation();
    const wordData = state.words[state.wordIndex];
    speakWordAndSpell(wordData.word, {
        onLetter: (idx) => highlightSpellSlot(idx),
        onDone: () => finishSpellAlong(),
    });
});

// Flashcard rating buttons
document.querySelectorAll(".btn-rating").forEach((btn) => {
    btn.addEventListener("click", (e) => {
        const rating = e.target.dataset.rating;
        const wordData = state.words[state.wordIndex];
        const category = state.isReviewMode ? wordData._srsEntry.category : state.currentCategory;

        state.wordsAttempted++;

        if (rating === "easy") {
            state.wordsCorrect++;
            state.streak++;
            state.score += 10;
            SRS.recordResult(category, wordData, true, 1);
            state.wordResults.push({ word: wordData.word, answer: wordData.word, correct: true });
        } else if (rating === "ok") {
            state.wordsCorrect++;
            state.score += 5;
            SRS.recordResult(category, wordData, true, 2);
            state.wordResults.push({ word: wordData.word, answer: wordData.word, correct: true });
        } else {
            // hard
            state.streak = 0;
            SRS.recordResult(category, wordData, false, 3);
            state.wordResults.push({ word: wordData.word, answer: "?", correct: false });
        }

        state.level = Math.floor(state.score / 50) + 1;
        updateStats();

        // AI feedback for flashcard mode
        if (AI.hasApiKey()) {
            const wasCorrect = rating !== "hard";
            const aiAttempts = rating === "easy" ? 1 : (rating === "ok" ? 2 : 3);
            const aiAnswer = rating === "hard" ? "?" : wordData.word;

            // Hide rating, show AI feedback + continue button
            $("flash-rating").classList.remove("visible");
            $("flash-ai-feedback").classList.remove("hidden");
            $("flash-continue").classList.remove("hidden");

            showAiFeedback("flash-ai-feedback", "flash-ai-feedback-text", wordData, aiAnswer, wasCorrect, aiAttempts, category);
            return; // Wait for Continue click before advancing
        }

        // No API key — advance immediately
        if (state.wordIndex < state.words.length - 1) {
            state.wordIndex++;
            loadFlashcard();
        } else {
            showResults();
        }
    });
});

// Flashcard continue button (advances after reading AI feedback)
$("btn-flash-continue").addEventListener("click", () => {
    $("flash-ai-feedback").classList.add("hidden");
    $("flash-continue").classList.add("hidden");

    if (state.wordIndex < state.words.length - 1) {
        state.wordIndex++;
        loadFlashcard();
    } else {
        showResults();
    }
});

// Flashcard back button
$("btn-flash-back").addEventListener("click", () => {
    savePersistentStats();
    goHome();
});

// ================================================================
//  LESSON MODE
// ================================================================

function getLessonProgress() {
    try {
        return JSON.parse(localStorage.getItem("coltons_app_lessons")) || {};
    } catch { return {}; }
}

function saveLessonProgress(lessonId, data) {
    const progress = getLessonProgress();
    progress[lessonId] = { ...progress[lessonId], ...data };
    localStorage.setItem("coltons_app_lessons", JSON.stringify(progress));
}

function renderLessonList(grid) {
    const progress = getLessonProgress();

    Object.entries(LESSON_UNITS).forEach(([unitNum, lessons]) => {
        // Unit header
        const header = document.createElement("div");
        header.className = "unit-header";
        header.textContent = `Unit ${unitNum}: ${UNIT_NAMES[unitNum]}`;
        grid.appendChild(header);

        lessons.forEach((lesson) => {
            const card = document.createElement("button");
            card.className = "lesson-card";
            card.style.setProperty("--lesson-color", lesson.color);

            const prog = progress[lesson.id];
            const completed = prog?.completed;
            const bestPct = prog?.bestAccuracy || 0;

            // Progress ring or check mark
            let progressHTML;
            if (completed) {
                progressHTML = `<span class="lesson-check">✓</span>`;
            } else if (bestPct > 0) {
                const circumference = 2 * Math.PI * 16;
                const offset = circumference - (bestPct / 100) * circumference;
                progressHTML = `
                    <svg class="lesson-progress-ring" viewBox="0 0 40 40">
                        <circle class="lesson-progress-bg" cx="20" cy="20" r="16"/>
                        <circle class="lesson-progress-fill" cx="20" cy="20" r="16"
                            stroke-dasharray="${circumference}"
                            stroke-dashoffset="${offset}"
                            style="stroke: ${lesson.color}"/>
                    </svg>`;
            } else {
                progressHTML = "";
            }

            card.innerHTML = `
                <span class="lesson-card-icon">${lesson.icon}</span>
                <div class="lesson-card-info">
                    <span class="lesson-card-title">${lesson.title}</span>
                    <span class="lesson-card-desc">${lesson.words.length} practice words</span>
                </div>
                <div class="lesson-card-progress">${progressHTML}</div>
            `;
            card.addEventListener("click", () => startLesson(lesson));
            grid.appendChild(card);
        });
    });
}

function startLesson(lesson) {
    state.currentLesson = lesson;
    state.currentCategory = `Lesson: ${lesson.title}`;
    state.isReviewMode = false;
    state.words = shuffle([...lesson.words]);
    state.wordIndex = 0;
    state.wordsCorrect = 0;
    state.wordsAttempted = 0;
    state.wordResults = [];
    state.lessonStep = "teach";

    // Set up guided path if this lesson has a matching word list
    if (lesson.id === "floss-rule" && WORD_LISTS["FLOSS Words"]) {
        state.guidedPath = {
            lessonId: lesson.id,
            category: "FLOSS Words",
            step: "lesson",
            words: WORD_LISTS["FLOSS Words"].words,
        };
    } else {
        state.guidedPath = null;
    }

    showScreen("lesson");
    $("lesson-title-bar").textContent = `${lesson.icon} ${lesson.title}`;
    $("lesson-step-counter").textContent = "";

    // Hide all lesson sections
    $("lesson-teach").classList.add("hidden");
    $("lesson-teach-enhanced").classList.add("hidden");
    $("lesson-practice").classList.add("hidden");
    $("lesson-quiz").classList.add("hidden");
    $("lesson-complete").classList.add("hidden");

    // Branch: enhanced teach slides or regular teach
    if (lesson.teachSlides && lesson.teachSlides.length > 0) {
        state.teachSlideIndex = 0;
        $("lesson-teach-enhanced").classList.remove("hidden");
        renderTeachSlide();
    } else {
        $("lesson-teach").classList.remove("hidden");
        // Fill in rule
        $("lesson-rule-text").textContent = lesson.rule;
        // Fill in examples
        const examplesEl = $("lesson-examples");
        examplesEl.innerHTML = "";
        lesson.examples.forEach((ex) => {
            const div = document.createElement("div");
            div.className = "lesson-example";
            div.innerHTML = `
                <span class="example-wrong">${ex.without}</span>
                <span class="example-arrow">→</span>
                <span class="example-right">${ex.with}</span>
                <span class="example-why">${ex.explanation}</span>
            `;
            examplesEl.appendChild(div);
        });
        // Auto-read the rule aloud for basic teach too
        setTimeout(() => speakNatural(lesson.rule), 400);
    }
}

// ===== Enhanced Teach Slides =====

function renderTeachSlide() {
    const lesson = state.currentLesson;
    const slide = lesson.teachSlides[state.teachSlideIndex];
    const total = lesson.teachSlides.length;
    const slideType = slide.type || "teach";

    $("teach-slide-counter").textContent = `${state.teachSlideIndex + 1} / ${total}`;
    $("teach-slide-title").textContent = slide.title;
    // Apply bionic reading to lesson content if enabled
    const isBionicLesson = _loadDisplaySettings().bionic;
    if (isBionicLesson && slide.content) {
        $("teach-slide-content").innerHTML = bionicTransform(slide.content);
    } else {
        $("teach-slide-content").textContent = slide.content || "";
    }

    // Clear interactive area
    const interEl = $("teach-slide-interactive");
    interEl.innerHTML = "";
    interEl.classList.add("hidden");
    state.interactiveAnswered = false;

    // Render diagram
    const diagramEl = $("teach-slide-diagram");
    if (slide.diagram) {
        diagramEl.innerHTML = renderDiagramHTML(slide.diagram);
        diagramEl.classList.remove("hidden");
    } else {
        diagramEl.innerHTML = "";
        diagramEl.classList.add("hidden");
    }

    // Render interactive content based on slide type
    if (slideType === "listen-and-choose") {
        renderListenAndChoose(slide, interEl);
    } else if (slideType === "tap-the-pattern") {
        renderTapThePattern(slide, interEl);
    } else if (slideType === "fill-the-gap") {
        renderFillTheGap(slide, interEl);
    } else if (slideType === "sort-it") {
        renderSortIt(slide, interEl);
    }

    // Nav buttons
    const isLast = state.teachSlideIndex === total - 1;
    $("btn-teach-next").textContent = isLast ? "Start Practice →" : "Next →";
    $("btn-teach-prev").classList.toggle("hidden", state.teachSlideIndex === 0);

    // Disable next until interactive is answered
    if (["listen-and-choose", "tap-the-pattern", "fill-the-gap", "sort-it"].includes(slideType)) {
        $("btn-teach-next").disabled = true;
        $("btn-teach-next").classList.add("disabled");
    } else {
        $("btn-teach-next").disabled = false;
        $("btn-teach-next").classList.remove("disabled");
    }

    // Render progress dots
    renderTeachProgressDots(total, state.teachSlideIndex, lesson.teachSlides);

    // Auto-read aloud
    if (slide.content) {
        window._teachSpeechTimeout = setTimeout(() => speakNatural(slide.content), 400);
    }
    // For listen-and-choose, also speak the target word after content
    if (slideType === "listen-and-choose" && slide.audioWord) {
        setTimeout(() => speak(slide.audioWord, 0.7), slide.content ? 3000 : 400);
    }
}

function enableTeachNext() {
    state.interactiveAnswered = true;
    $("btn-teach-next").disabled = false;
    $("btn-teach-next").classList.remove("disabled");
}

function renderTeachProgressDots(total, current, slides) {
    const dotsEl = $("teach-slide-progress");
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    for (let i = 0; i < total; i++) {
        const dot = document.createElement("span");
        const sType = (slides[i].type || "teach");
        const isInteractive = ["listen-and-choose", "tap-the-pattern", "fill-the-gap", "sort-it"].includes(sType);
        dot.className = `teach-dot${i === current ? " active" : ""}${i < current ? " completed" : ""}${isInteractive ? " interactive" : ""}`;
        dotsEl.appendChild(dot);
    }
}

// ===== Interactive Slide Renderers =====

function renderListenAndChoose(slide, container) {
    container.classList.remove("hidden");
    let html = `<div class="teach-listen-choose">`;
    html += `<button class="btn btn-hear teach-listen-btn" id="btn-teach-listen-word">&#128264; Hear the word</button>`;
    html += `<div class="teach-choices">`;
    slide.choices.forEach((c, i) => {
        html += `<button class="teach-choice-btn" data-idx="${i}">${c}</button>`;
    });
    html += `</div></div>`;
    container.innerHTML = html;

    // Wire events
    $("btn-teach-listen-word").addEventListener("click", () => speak(slide.audioWord, 0.7));
    container.querySelectorAll(".teach-choice-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (state.interactiveAnswered) return;
            const idx = parseInt(btn.dataset.idx);
            const correct = idx === slide.correctChoice;
            container.querySelectorAll(".teach-choice-btn").forEach((b, j) => {
                b.classList.add("disabled");
                if (j === slide.correctChoice) b.classList.add("correct");
                if (j === idx && !correct) b.classList.add("incorrect");
            });
            if (correct) speak("That's right!");
            else speak(`The correct answer is ${slide.choices[slide.correctChoice]}`);
            enableTeachNext();
        });
    });
}

function renderTapThePattern(slide, container) {
    container.classList.remove("hidden");
    const word = slide.tapWord;
    const target = slide.tapTarget;
    const targetIdx = word.toLowerCase().indexOf(target.toLowerCase());

    let html = `<div class="teach-tap-word">`;
    // Split word into segments: before target, the target, after target
    if (targetIdx >= 0) {
        const before = word.substring(0, targetIdx);
        const match = word.substring(targetIdx, targetIdx + target.length);
        const after = word.substring(targetIdx + target.length);
        if (before) html += `<span class="teach-tap-segment" data-part="other">${before}</span>`;
        html += `<span class="teach-tap-segment target" data-part="target">${match}</span>`;
        if (after) html += `<span class="teach-tap-segment" data-part="other">${after}</span>`;
    } else {
        html += `<span class="teach-tap-segment">${word}</span>`;
    }
    html += `</div>`;
    html += `<p class="teach-tap-hint">Tap the part that matches the rule!</p>`;
    container.innerHTML = html;

    container.querySelectorAll(".teach-tap-segment").forEach(seg => {
        seg.addEventListener("click", () => {
            if (state.interactiveAnswered) return;
            if (seg.dataset.part === "target") {
                seg.classList.add("highlighted");
                const explain = slide.tapExplanation || "Correct!";
                container.querySelector(".teach-tap-hint").textContent = explain;
                speak("That's the one!");
                enableTeachNext();
            } else {
                seg.classList.add("wrong-tap");
                setTimeout(() => seg.classList.remove("wrong-tap"), 600);
                speak("Try again, look for the pattern.");
            }
        });
    });
}

function renderFillTheGap(slide, container) {
    container.classList.remove("hidden");
    let html = `<div class="teach-fill-gap">`;
    html += `<div class="teach-gap-word">${slide.gapWord.replace("_", `<span class="teach-gap-blank">___</span>`)}</div>`;
    html += `<div class="teach-gap-options">`;
    slide.gapOptions.forEach((opt, i) => {
        html += `<button class="teach-gap-btn" data-idx="${i}">${opt}</button>`;
    });
    html += `</div></div>`;
    container.innerHTML = html;

    container.querySelectorAll(".teach-gap-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            if (state.interactiveAnswered) return;
            const correct = btn.textContent === slide.gapAnswer;
            container.querySelectorAll(".teach-gap-btn").forEach(b => {
                b.classList.add("disabled");
                if (b.textContent === slide.gapAnswer) b.classList.add("correct");
            });
            if (!correct) btn.classList.add("incorrect");
            // Show the completed word
            const blankEl = container.querySelector(".teach-gap-blank");
            if (blankEl) {
                blankEl.textContent = slide.gapAnswer;
                blankEl.classList.add("filled");
            }
            if (correct) speak("Perfect!");
            else speak(`It's ${slide.gapAnswer}`);
            enableTeachNext();
        });
    });
}

function renderSortIt(slide, container) {
    container.classList.remove("hidden");
    const cats = slide.sortCategories;
    let html = `<div class="teach-sort-container">`;
    html += `<div class="teach-sort-columns">`;
    cats.forEach((cat, i) => {
        html += `<div class="teach-sort-column" data-cat="${i}"><div class="teach-sort-header">${cat}</div><div class="teach-sort-items" id="sort-col-${i}"></div></div>`;
    });
    html += `</div>`;
    html += `<div class="teach-sort-pool" id="sort-pool">`;
    // Shuffle items
    const items = [...slide.sortItems].sort(() => Math.random() - 0.5);
    items.forEach((item, i) => {
        html += `<button class="teach-sort-word" data-word="${item.word}" data-cat="${item.category}">${item.word}</button>`;
    });
    html += `</div></div>`;
    container.innerHTML = html;

    let sortedCount = 0;
    const totalItems = slide.sortItems.length;

    container.querySelectorAll(".teach-sort-word").forEach(wordBtn => {
        let selectedCol = null;
        // Tap word, then tap column
        wordBtn.addEventListener("click", () => {
            if (wordBtn.classList.contains("sorted")) return;
            // Highlight this word
            container.querySelectorAll(".teach-sort-word").forEach(w => w.classList.remove("selected"));
            wordBtn.classList.add("selected");
        });
    });

    container.querySelectorAll(".teach-sort-column").forEach(col => {
        col.addEventListener("click", () => {
            const selected = container.querySelector(".teach-sort-word.selected");
            if (!selected) return;
            const correctCat = parseInt(selected.dataset.cat);
            const chosenCat = parseInt(col.dataset.cat);
            if (correctCat === chosenCat) {
                selected.classList.remove("selected");
                selected.classList.add("sorted", "correct");
                col.querySelector(".teach-sort-items").appendChild(selected);
                sortedCount++;
                if (sortedCount >= totalItems) {
                    speak("Great sorting!");
                    enableTeachNext();
                }
            } else {
                selected.classList.add("wrong-sort");
                setTimeout(() => selected.classList.remove("wrong-sort"), 600);
                speak("Try the other column.");
            }
        });
    });
}

function renderDiagramHTML(diagram) {
    if (diagram.type === "doubling") {
        const examplesHTML = diagram.examples
            .map(w => {
                const match = w.match(/(.*?)(ff|ll|ss|zz)$/);
                if (match) return `<span class="diagram-example-word">${match[1]}<strong class="doubled-highlight">${match[2]}</strong></span>`;
                return `<span class="diagram-example-word">${w}</span>`;
            })
            .join("");
        return `
            <div class="doubling-diagram">
                <div class="diagram-word-build">
                    <span class="diagram-base">${diagram.base}</span>
                    <span class="diagram-plus">+</span>
                    <span class="diagram-single-letter">${diagram.ending}</span>
                    <span class="diagram-arrow-right">→</span>
                    <span class="diagram-doubled-letter">${diagram.doubled}</span>
                </div>
                <div class="diagram-rule-label">
                    short vowel <span class="diagram-vowel-badge">${diagram.vowel}</span>
                    → double the <strong>${diagram.ending.toUpperCase()}</strong>
                </div>
                <div class="diagram-examples">${examplesHTML}</div>
            </div>
        `;
    }
    if (diagram.type === "floss-acronym") {
        return `
            <div class="floss-acronym-diagram">
                <div class="floss-letter" style="--floss-color: #e74c3c;"><span class="floss-char">F</span><span class="floss-means">→ ff (stuff, cliff, sniff)</span></div>
                <div class="floss-letter" style="--floss-color: #3498db;"><span class="floss-char">L</span><span class="floss-means">→ ll (skill, spell, drill)</span></div>
                <div class="floss-letter" style="--floss-color: #f39c12;"><span class="floss-char">O</span><span class="floss-means">→ the short vowel!</span></div>
                <div class="floss-letter" style="--floss-color: #2ecc71;"><span class="floss-char">S</span><span class="floss-means">→ ss (press, glass, floss)</span></div>
                <div class="floss-letter" style="--floss-color: #9b59b6;"><span class="floss-char">S</span><span class="floss-means">→ zz (buzz, fizz, jazz)</span></div>
            </div>
        `;
    }
    if (diagram.type === "highlight-word") {
        return `<div class="highlight-word-diagram">${diagram.words.map(w => {
            const idx = w.word.toLowerCase().indexOf(w.highlight.toLowerCase());
            if (idx < 0) return `<div class="hw-item"><span class="hw-word">${w.word}</span><span class="hw-note">${w.note}</span></div>`;
            const before = w.word.substring(0, idx);
            const match = w.word.substring(idx, idx + w.highlight.length);
            const after = w.word.substring(idx + w.highlight.length);
            return `<div class="hw-item"><span class="hw-word">${before}<mark class="hw-mark" style="--hw-color:${w.color}">${match}</mark>${after}</span><span class="hw-note">${w.note}</span></div>`;
        }).join("")}</div>`;
    }
    if (diagram.type === "prefix-breakdown") {
        return `<div class="prefix-breakdown-diagram">
            <span class="pbd-prefix">${diagram.prefix}-</span>
            <span class="pbd-plus">+</span>
            <span class="pbd-base">${diagram.base}</span>
            <span class="pbd-arrow">→</span>
            <span class="pbd-result">${diagram.result}</span>
            <div class="pbd-meaning">${diagram.meaning}</div>
        </div>`;
    }
    if (diagram.type === "suffix-transform") {
        return `<div class="suffix-transform-diagram">
            <span class="std-base">${diagram.base}</span>
            <span class="std-plus">+</span>
            <span class="std-suffix">-${diagram.suffix}</span>
            <span class="std-arrow">→</span>
            <span class="std-result">${diagram.result}</span>
            ${diagram.note ? `<div class="std-note">${diagram.note}</div>` : ""}
        </div>`;
    }
    if (diagram.type === "comparison-table") {
        return `<div class="comparison-table-diagram">
            <div class="ct-row ct-header"><span>${diagram.headers[0]}</span><span>${diagram.headers[1]}</span></div>
            ${diagram.rows.map(r => `<div class="ct-row"><span>${r[0]}</span><span>${r[1]}</span></div>`).join("")}
            ${diagram.ruleNote ? `<div class="ct-note">${diagram.ruleNote}</div>` : ""}
        </div>`;
    }
    if (diagram.type === "sound-map") {
        return `<div class="sound-map-diagram">
            <div class="sm-pattern">${diagram.pattern}</div>
            <div class="sm-branches">${diagram.variants.map(v => `
                <div class="sm-branch">
                    <span class="sm-sound">"${v.sound}"</span>
                    <span class="sm-examples">${v.examples.join(", ")}</span>
                </div>
            `).join("")}</div>
        </div>`;
    }
    if (diagram.type === "root-tree") {
        return `<div class="root-tree-diagram">
            <div class="rt-root"><span class="rt-root-word">${diagram.root}</span><span class="rt-meaning">= ${diagram.meaning}</span></div>
            <div class="rt-branches">${diagram.branches.map(b => `<span class="rt-branch">${b}</span>`).join("")}</div>
        </div>`;
    }
    if (diagram.type === "vowel-team") {
        return `<div class="vowel-team-diagram">
            <div class="vt-team"><span class="vt-letters">${diagram.team}</span><span class="vt-sound">makes the ${diagram.sound} sound</span></div>
            <div class="vt-examples">${diagram.examples.map(w => {
                const idx = w.toLowerCase().indexOf(diagram.team.toLowerCase());
                if (idx < 0) return `<span class="vt-word">${w}</span>`;
                const before = w.substring(0, idx);
                const match = w.substring(idx, idx + diagram.team.length);
                const after = w.substring(idx + diagram.team.length);
                return `<span class="vt-word">${before}<mark class="vt-mark">${match}</mark>${after}</span>`;
            }).join("")}</div>
        </div>`;
    }
    return "";
}

// Replay audio button
if ($("btn-teach-replay")) {
    $("btn-teach-replay").addEventListener("click", () => {
        const lesson = state.currentLesson;
        if (!lesson || !lesson.teachSlides) return;
        const slide = lesson.teachSlides[state.teachSlideIndex];
        if (slide.content) speakNatural(slide.content);
    });
}

$("btn-teach-next").addEventListener("click", () => {
    const lesson = state.currentLesson;
    if (!lesson.teachSlides) return;
    if (state.teachSlideIndex < lesson.teachSlides.length - 1) {
        state.teachSlideIndex++;
        renderTeachSlide();
    } else {
        // Move to practice
        state.lessonStep = "practice";
        $("lesson-teach-enhanced").classList.add("hidden");
        $("lesson-practice").classList.remove("hidden");
        loadLessonWord();
    }
});

$("btn-teach-prev").addEventListener("click", () => {
    if (state.teachSlideIndex > 0) {
        state.teachSlideIndex--;
        renderTeachSlide();
    }
});

// "Start Practice" button (for regular single-card teach)
$("btn-lesson-practice").addEventListener("click", () => {
    state.lessonStep = "practice";
    $("lesson-teach").classList.add("hidden");
    $("lesson-practice").classList.remove("hidden");
    $("lesson-quiz").classList.add("hidden");
    $("lesson-complete").classList.add("hidden");
    loadLessonWord();
});

// Back from lesson
$("btn-lesson-back").addEventListener("click", () => {
    savePersistentStats();
    goHome();
});

// ===== Lesson Practice (uses its own DOM elements) =====
function loadLessonWord() {
    const wordData = state.words[state.wordIndex];
    state.placedLetters = [];
    state.hintUsed = false;
    state.hintLevel = 0;
    state.attempts = 0;

    $("lesson-step-counter").textContent = `${state.wordIndex + 1} / ${state.words.length}`;

    $("lesson-hint-text").textContent = wordData.hint;
    $("btn-lesson-hint").textContent = "Show Syllables";
    $("btn-lesson-hint").classList.remove("hidden");

    const wordLetters = wordData.word.toLowerCase().split("");
    const distractors = generateDistractors(wordData.word, Math.min(3, Math.ceil(wordLetters.length * 0.25)));
    state.bankLetters = shuffle([...wordLetters, ...distractors]).map((letter, i) => ({
        letter,
        id: `bank-${i}`,
        used: false,
    }));

    renderLessonBank();
    renderLessonDropZone();
    resetLessonFeedback();

    const actions = document.querySelector(".lesson-actions");
    actions.innerHTML = `
        <button class="btn btn-clear" id="btn-lesson-clear">Clear</button>
        <button class="btn btn-check" id="btn-lesson-check">Check</button>
    `;
    $("btn-lesson-clear").addEventListener("click", lessonClearDropZone);
    $("btn-lesson-check").addEventListener("click", lessonCheckAnswer);
}

function renderLessonBank() {
    const bank = $("lesson-letter-bank");
    bank.innerHTML = "";
    state.bankLetters.forEach((item) => {
        const tile = document.createElement("div");
        tile.className = `letter-tile${item.used ? " used" : ""}`;
        tile.textContent = item.letter;
        tile.dataset.bankId = item.id;
        tile.setAttribute("role", "button");
        tile.setAttribute("tabindex", "0");
        tile.addEventListener("click", () => { if (!item.used) lessonPlaceLetter(item); });
        tile.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!item.used) lessonPlaceLetter(item);
            }
        });
        bank.appendChild(tile);
    });
}

function renderLessonDropZone() {
    const slots = $("lesson-drop-slots");
    const placeholder = $("lesson-drop-placeholder");
    slots.innerHTML = "";
    if (state.placedLetters.length === 0) {
        placeholder.classList.remove("hidden");
    } else {
        placeholder.classList.add("hidden");
        state.placedLetters.forEach((item, index) => {
            const tile = document.createElement("div");
            tile.className = "letter-tile";
            tile.textContent = item.letter;
            tile.dataset.index = index;
            tile.setAttribute("role", "button");
            tile.setAttribute("tabindex", "0");
            tile.addEventListener("click", () => lessonRemoveLetter(index));
            tile.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " " || e.key === "Backspace") {
                    e.preventDefault();
                    lessonRemoveLetter(index);
                }
            });
            slots.appendChild(tile);
        });
    }
}

function lessonPlaceLetter(bankItem) {
    bankItem.used = true;
    state.placedLetters.push({ letter: bankItem.letter, bankId: bankItem.id });
    renderLessonBank();
    renderLessonDropZone();
    resetLessonFeedback();
}

function lessonRemoveLetter(index) {
    const removed = state.placedLetters.splice(index, 1)[0];
    const bankItem = state.bankLetters.find((b) => b.id === removed.bankId);
    if (bankItem) bankItem.used = false;
    renderLessonBank();
    renderLessonDropZone();
    resetLessonFeedback();
}

function lessonClearDropZone() {
    state.placedLetters.forEach((placed) => {
        const bankItem = state.bankLetters.find((b) => b.id === placed.bankId);
        if (bankItem) bankItem.used = false;
    });
    state.placedLetters = [];
    renderLessonBank();
    renderLessonDropZone();
    resetLessonFeedback();
}

function lessonCheckAnswer() {
    const wordData = state.words[state.wordIndex];
    const answer = state.placedLetters.map((l) => l.letter).join("");
    const correct = wordData.word.toLowerCase();
    state.attempts++;

    if (answer === correct) {
        lessonOnCorrect(wordData);
    } else {
        lessonOnIncorrect(wordData, answer, correct);
    }
}

function lessonOnCorrect(wordData) {
    state.wordsCorrect++;
    Sound.correct();
    state.wordsAttempted++;
    state.streak++;
    if (state.streak > state.bestStreak) state.bestStreak = state.streak;

    let points = 10;
    if (state.attempts === 1) points += 5;
    if (!state.hintUsed) points += 5;
    state.score += points;
    state.level = Math.floor(state.score / 50) + 1;

    // Check for level up
    const prevLevel = Math.floor((state.score - points) / 50) + 1;
    if (state.level > prevLevel) Sound.levelUp();

    updateStats();

    SRS.recordResult(state.currentLesson.id, wordData, true, state.attempts);

    const slots = $("lesson-drop-slots");
    slots.querySelectorAll(".letter-tile").forEach((t) => t.classList.add("correct"));
    $("lesson-drop-zone").classList.add("correct");

    showLessonFeedback("success", getCorrectMessage());

    // Show sentence context
    if (wordData.sentence) {
        $("lesson-sentence-display").classList.remove("hidden");
        $("lesson-sentence-text").textContent = wordData.sentence;
    }

    speak(`Correct! ${wordData.word}`);

    // Track for session insight
    state.wordResults.push({ word: wordData.word, answer: wordData.word.toLowerCase(), correct: true });

    // AI feedback (async, non-blocking)
    $("lesson-ai-feedback").classList.add("hidden");
    showAiFeedback("lesson-ai-feedback", "lesson-ai-feedback-text", wordData, wordData.word.toLowerCase(), true, state.attempts, state.currentLesson.id);

    const actions = document.querySelector(".lesson-actions");
    if (state.wordIndex < state.words.length - 1) {
        actions.innerHTML = `<button class="btn btn-next" id="btn-lesson-next">Next Word</button>`;
        $("btn-lesson-next").addEventListener("click", lessonNextWord);
    } else {
        actions.innerHTML = `<button class="btn btn-next" id="btn-lesson-finish">See Results</button>`;
        $("btn-lesson-finish").addEventListener("click", showLessonComplete);
    }
}

function lessonOnIncorrect(wordData, answer, correct) {
    state.streak = 0;
    Sound.incorrect();
    updateStats();

    const slots = $("lesson-drop-slots").querySelectorAll(".letter-tile");
    slots.forEach((tile, i) => {
        if (i < correct.length && answer[i] === correct[i]) {
            tile.classList.add("correct");
        } else {
            tile.classList.add("incorrect");
        }
    });
    $("lesson-drop-zone").classList.add("incorrect");

    // Analyze the specific error
    const errorTip = analyzeSpellingError(wordData.word, answer);

    if (state.attempts >= 3) {
        state.wordsAttempted++;
        showFeedbackWithTip("lesson-feedback", "error", `Tough word! The answer was: ${wordData.word}`, errorTip);
        speakWordTeach(wordData.word, wordData.syllables);

        SRS.recordResult(state.currentLesson.id, wordData, false, state.attempts);

        // Track for session insight
        state.wordResults.push({ word: wordData.word, answer, correct: false });

        // AI feedback (async, non-blocking)
        $("lesson-ai-feedback").classList.add("hidden");
        showAiFeedback("lesson-ai-feedback", "lesson-ai-feedback-text", wordData, answer, false, state.attempts, state.currentLesson.id);

        const actions = document.querySelector(".lesson-actions");
        if (state.wordIndex < state.words.length - 1) {
            actions.innerHTML = `<button class="btn btn-next" id="btn-lesson-next">Next Word</button>`;
            $("btn-lesson-next").addEventListener("click", lessonNextWord);
        } else {
            actions.innerHTML = `<button class="btn btn-next" id="btn-lesson-finish">See Results</button>`;
            $("btn-lesson-finish").addEventListener("click", showLessonComplete);
        }
    } else {
        showFeedbackWithTip("lesson-feedback", "error", null, errorTip);

        if (state.hintLevel < 2) {
            state.hintLevel = 2;
            state.hintUsed = true;
            const syllableHTML = wordData.syllables
                .map((s) => `<span class="syllable">${s}</span>`)
                .join("");
            $("lesson-hint-text").innerHTML = `${wordData.hint}<br>${syllableHTML}`;
            $("btn-lesson-hint").classList.add("hidden");
        }

        setTimeout(() => {
            $("lesson-drop-zone").classList.remove("incorrect");
            slots.forEach((tile) => tile.classList.remove("incorrect"));
        }, 800);
    }
}

function lessonNextWord() {
    state.wordIndex++;
    $("lesson-drop-zone").classList.remove("correct", "incorrect");
    loadLessonWord();
}

function showLessonFeedback(type, message) {
    const fb = $("lesson-feedback");
    fb.textContent = message;
    fb.className = `feedback ${type}`;
    // Read lesson feedback aloud
    if (message) speak(message);
}

function resetLessonFeedback() {
    $("lesson-feedback").className = "feedback hidden";
    $("lesson-drop-zone").classList.remove("correct", "incorrect");
    $("lesson-ai-feedback").classList.add("hidden");
    $("lesson-sentence-display").classList.add("hidden");
}

// Lesson hint button
$("btn-lesson-hint").addEventListener("click", () => {
    const wordData = state.words[state.wordIndex];
    state.hintUsed = true;
    state.hintLevel = 2;
    const syllableHTML = wordData.syllables
        .map((s) => `<span class="syllable">${s}</span>`)
        .join("");
    $("lesson-hint-text").innerHTML = `${wordData.hint}<br>${syllableHTML}`;
    $("btn-lesson-hint").classList.add("hidden");
});

// Lesson hear button
$("btn-lesson-hear").addEventListener("click", () => {
    const wordData = state.words[state.wordIndex];
    speak(wordData.word, 0.7);
});

// Lesson complete — now start the quiz
function showLessonComplete() {
    // Save practice stats before quiz
    savePersistentStats();

    // Start quiz with all lesson words (shuffled)
    state.lessonStep = "quiz";
    state.quizWords = shuffle([...state.currentLesson.words]);
    state.quizIndex = 0;
    state.quizCorrect = 0;
    state.quizTotal = state.quizWords.length;
    state.quizResults = [];
    state.placedLetters = [];

    $("lesson-teach").classList.add("hidden");
    $("lesson-practice").classList.add("hidden");
    $("lesson-quiz").classList.remove("hidden");
    $("lesson-complete").classList.add("hidden");

    speak("Quiz time! Let's see what you remember.");
    loadQuizWord();
}

// ===== Quiz Functions =====
function loadQuizWord() {
    const wordData = state.quizWords[state.quizIndex];
    state.placedLetters = [];
    state.attempts = 0;

    $("quiz-counter").textContent = `${state.quizIndex + 1} / ${state.quizTotal}`;
    $("quiz-word-prompt").textContent = wordData.hint;

    const wordLetters = wordData.word.toLowerCase().split("");
    const distractors = generateDistractors(wordData.word, Math.min(3, Math.ceil(wordLetters.length * 0.25)));
    state.bankLetters = shuffle([...wordLetters, ...distractors]).map((letter, i) => ({
        letter,
        id: `quiz-bank-${i}`,
        used: false,
    }));

    renderQuizBank();
    renderQuizDropZone();
    $("quiz-feedback").className = "feedback hidden";
    $("quiz-drop-zone").classList.remove("correct", "incorrect");

    const actions = document.querySelector(".quiz-actions");
    actions.innerHTML = `
        <button class="btn btn-clear" id="btn-quiz-clear">Clear</button>
        <button class="btn btn-check" id="btn-quiz-check">Check</button>
    `;
    $("btn-quiz-clear").addEventListener("click", quizClearDropZone);
    $("btn-quiz-check").addEventListener("click", quizCheckAnswer);

    // Say the word so he can hear it
    speak(wordData.word, 0.7);
}

function renderQuizBank() {
    const bank = $("quiz-letter-bank");
    bank.innerHTML = "";
    state.bankLetters.forEach((item) => {
        const tile = document.createElement("div");
        tile.className = `letter-tile${item.used ? " used" : ""}`;
        tile.textContent = item.letter;
        tile.dataset.bankId = item.id;
        tile.setAttribute("role", "button");
        tile.setAttribute("tabindex", "0");
        tile.addEventListener("click", () => { if (!item.used) quizPlaceLetter(item); });
        tile.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!item.used) quizPlaceLetter(item);
            }
        });
        bank.appendChild(tile);
    });
}

function renderQuizDropZone() {
    const slots = $("quiz-drop-slots");
    const placeholder = $("quiz-drop-placeholder");
    slots.innerHTML = "";
    if (state.placedLetters.length === 0) {
        placeholder.classList.remove("hidden");
    } else {
        placeholder.classList.add("hidden");
        state.placedLetters.forEach((item, index) => {
            const tile = document.createElement("div");
            tile.className = "letter-tile";
            tile.textContent = item.letter;
            tile.dataset.index = index;
            tile.setAttribute("role", "button");
            tile.setAttribute("tabindex", "0");
            tile.addEventListener("click", () => quizRemoveLetter(index));
            tile.addEventListener("keydown", (e) => {
                if (e.key === "Enter" || e.key === " " || e.key === "Backspace") {
                    e.preventDefault();
                    quizRemoveLetter(index);
                }
            });
            slots.appendChild(tile);
        });
    }
}

function quizPlaceLetter(bankItem) {
    bankItem.used = true;
    state.placedLetters.push({ letter: bankItem.letter, bankId: bankItem.id });
    renderQuizBank();
    renderQuizDropZone();
    $("quiz-feedback").className = "feedback hidden";
    $("quiz-drop-zone").classList.remove("correct", "incorrect");
}

function quizRemoveLetter(index) {
    const removed = state.placedLetters.splice(index, 1)[0];
    const bankItem = state.bankLetters.find((b) => b.id === removed.bankId);
    if (bankItem) bankItem.used = false;
    renderQuizBank();
    renderQuizDropZone();
    $("quiz-feedback").className = "feedback hidden";
    $("quiz-drop-zone").classList.remove("correct", "incorrect");
}

function quizClearDropZone() {
    state.placedLetters.forEach((placed) => {
        const bankItem = state.bankLetters.find((b) => b.id === placed.bankId);
        if (bankItem) bankItem.used = false;
    });
    state.placedLetters = [];
    renderQuizBank();
    renderQuizDropZone();
    $("quiz-feedback").className = "feedback hidden";
    $("quiz-drop-zone").classList.remove("correct", "incorrect");
}

function quizCheckAnswer() {
    const wordData = state.quizWords[state.quizIndex];
    const answer = state.placedLetters.map((l) => l.letter).join("");
    const correct = wordData.word.toLowerCase();
    state.attempts++;

    if (answer === correct) {
        // Correct
        state.quizCorrect++;
        Sound.correct();
        state.quizResults.push({ word: wordData.word, correct: true, userAnswer: answer });

        const slots = $("quiz-drop-slots");
        slots.querySelectorAll(".letter-tile").forEach((t) => t.classList.add("correct"));
        $("quiz-drop-zone").classList.add("correct");

        const fb = $("quiz-feedback");
        fb.textContent = "Correct!";
        fb.className = "feedback success";
        speak(`Correct! ${wordData.word}`);

        const actions = document.querySelector(".quiz-actions");
        if (state.quizIndex < state.quizWords.length - 1) {
            actions.innerHTML = `<button class="btn btn-next" id="btn-quiz-next">Next</button>`;
            $("btn-quiz-next").addEventListener("click", quizNextWord);
        } else {
            actions.innerHTML = `<button class="btn btn-next" id="btn-quiz-finish">See Grade</button>`;
            $("btn-quiz-finish").addEventListener("click", showLessonFinalResults);
        }
    } else {
        // Incorrect
        Sound.incorrect();
        const slots = $("quiz-drop-slots").querySelectorAll(".letter-tile");
        slots.forEach((tile, i) => {
            if (i < correct.length && answer[i] === correct[i]) {
                tile.classList.add("correct");
            } else {
                tile.classList.add("incorrect");
            }
        });
        $("quiz-drop-zone").classList.add("incorrect");

        if (state.attempts >= 2) {
            // Max 2 tries on quiz, then move on
            state.quizResults.push({ word: wordData.word, correct: false, userAnswer: answer });

            const fb = $("quiz-feedback");
            fb.textContent = `The answer was: ${wordData.word}`;
            fb.className = "feedback error";
            speak(`The answer was ${wordData.word}`);

            // Record struggle in SRS
            SRS.recordResult(state.currentLesson.id, wordData, false, state.attempts);

            const actions = document.querySelector(".quiz-actions");
            if (state.quizIndex < state.quizWords.length - 1) {
                actions.innerHTML = `<button class="btn btn-next" id="btn-quiz-next">Next</button>`;
                $("btn-quiz-next").addEventListener("click", quizNextWord);
            } else {
                actions.innerHTML = `<button class="btn btn-next" id="btn-quiz-finish">See Grade</button>`;
                $("btn-quiz-finish").addEventListener("click", showLessonFinalResults);
            }
        } else {
            const fb = $("quiz-feedback");
            fb.textContent = "Not quite — try once more!";
            fb.className = "feedback error";

            setTimeout(() => {
                $("quiz-drop-zone").classList.remove("incorrect");
                slots.forEach((tile) => tile.classList.remove("incorrect"));
            }, 800);
        }
    }
}

function quizNextWord() {
    state.quizIndex++;
    state.placedLetters = [];
    $("quiz-drop-zone").classList.remove("correct", "incorrect");
    loadQuizWord();
}

// ===== Calculate Letter Grade =====
function getLetterGrade(pct) {
    if (pct >= 90) return { grade: "A", class: "grade-a", msg: "Outstanding!" };
    if (pct >= 80) return { grade: "B", class: "grade-b", msg: "Great work!" };
    if (pct >= 70) return { grade: "C", class: "grade-c", msg: "Good effort!" };
    if (pct >= 60) return { grade: "D", class: "grade-d", msg: "Keep practicing!" };
    return { grade: "F", class: "grade-f", msg: "Let's review this one again." };
}

// ===== Struggle Pattern Tracker =====
const STRUGGLE_KEY = "coltons_app_struggles";

function loadStruggles() {
    try {
        return JSON.parse(localStorage.getItem(STRUGGLE_KEY)) || {};
    } catch {
        return {};
    }
}

function saveStruggles(data) {
    localStorage.setItem(STRUGGLE_KEY, JSON.stringify(data));
}

function recordStrugglePatterns(quizResults, lessonId) {
    const struggles = loadStruggles();
    const missed = quizResults.filter(r => !r.correct);

    missed.forEach(r => {
        const key = r.word.toLowerCase();
        if (!struggles[key]) {
            struggles[key] = { word: r.word, count: 0, lessons: [], lastMissed: null, attempts: [] };
        }
        struggles[key].count++;
        struggles[key].lastMissed = Date.now();
        if (!struggles[key].lessons.includes(lessonId)) {
            struggles[key].lessons.push(lessonId);
        }
        // Track what they spelled it as
        struggles[key].attempts.push(r.userAnswer);
        if (struggles[key].attempts.length > 10) struggles[key].attempts.shift();
    });

    saveStruggles(struggles);
    return struggles;
}

function getRepeatedStruggles(minCount = 2) {
    const struggles = loadStruggles();
    return Object.values(struggles)
        .filter(s => s.count >= minCount)
        .sort((a, b) => b.count - a.count);
}

// ===== Final Lesson Results (after quiz) =====
function showLessonFinalResults() {
    state.lessonStep = "complete";
    $("lesson-teach").classList.add("hidden");
    $("lesson-practice").classList.add("hidden");
    $("lesson-quiz").classList.add("hidden");
    $("lesson-complete").classList.remove("hidden");

    // Practice stats
    const practicePct = state.wordsAttempted > 0
        ? Math.round((state.wordsCorrect / state.wordsAttempted) * 100)
        : 0;

    // Quiz stats
    const quizPct = state.quizTotal > 0
        ? Math.round((state.quizCorrect / state.quizTotal) * 100)
        : 0;
    const gradeInfo = getLetterGrade(quizPct);

    // Save lesson progress using quiz score
    const prevProgress = getLessonProgress()[state.currentLesson.id];
    const bestAccuracy = Math.max(quizPct, prevProgress?.bestAccuracy || 0);
    saveLessonProgress(state.currentLesson.id, {
        completed: quizPct >= 70,
        bestAccuracy,
        lastPlayed: Date.now(),
        lastQuizGrade: gradeInfo.grade,
    });

    // Record struggle patterns
    recordStrugglePatterns(state.quizResults, state.currentLesson.id);

    let title = "Lesson complete — nice work!";
    if (quizPct === 100) title = "Perfect quiz — you owned that lesson!";
    else if (quizPct >= 80) title = "Great job on the quiz!";
    else if (quizPct < 70) title = "Tough quiz, but you stuck with it.";

    // AI Session Insight (Lessons)
    $("lesson-ai-insight").classList.add("hidden");
    showAiSessionInsight("lesson-ai-insight", "lesson-ai-insight-text");

    $("lesson-result-title").textContent = title;
    $("lesson-result-stats").innerHTML = `
        <div class="result-stat">
            <span class="result-stat-value">${state.wordsCorrect}/${state.wordsAttempted}</span>
            <span class="result-stat-label">Practice</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${state.quizCorrect}/${state.quizTotal}</span>
            <span class="result-stat-label">Quiz</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${quizPct}%</span>
            <span class="result-stat-label">Quiz Score</span>
        </div>
    `;

    // Show quiz grade
    const gradeEl = $("quiz-grade-display");
    gradeEl.textContent = gradeInfo.grade;
    gradeEl.className = `quiz-grade-display ${gradeInfo.class}`;
    $("quiz-grade-detail").textContent = `${gradeInfo.msg} — ${state.quizCorrect} out of ${state.quizTotal} correct on the quiz.`;
    $("quiz-grade-card").style.display = "block";

    // Show repeated struggle patterns
    const repeatedStruggles = getRepeatedStruggles(2);
    const quizMissed = state.quizResults.filter(r => !r.correct);
    const patternsEl = $("struggle-patterns");
    const listEl = $("struggle-list");

    if (repeatedStruggles.length > 0 || quizMissed.length > 0) {
        patternsEl.classList.remove("hidden");
        listEl.innerHTML = "";

        // Show repeated struggles first (words missed multiple times across sessions)
        repeatedStruggles.slice(0, 5).forEach(s => {
            const li = document.createElement("li");
            li.innerHTML = `<span class="struggle-word">${s.word}</span> — missed ${s.count} times across sessions<br><span class="struggle-detail">Last attempts: ${s.attempts.slice(-3).map(a => `"${a}"`).join(", ")}</span>`;
            listEl.appendChild(li);
        });

        // Show quiz misses that aren't already in repeated
        const repeatedWords = new Set(repeatedStruggles.map(s => s.word.toLowerCase()));
        quizMissed.forEach(r => {
            if (!repeatedWords.has(r.word.toLowerCase())) {
                const li = document.createElement("li");
                li.innerHTML = `<span class="struggle-word">${r.word}</span> — missed on this quiz <span class="struggle-detail">(spelled as "${r.userAnswer}")</span>`;
                listEl.appendChild(li);
            }
        });
    } else {
        patternsEl.classList.add("hidden");
    }

    // Speak the grade
    speak(`Quiz grade: ${gradeInfo.grade}. ${gradeInfo.msg}`);

    // Wire buttons (clone to remove old listeners)
    const nextBtn = $("btn-next-lesson");
    const listBtn = $("btn-lesson-list");
    const newNext = nextBtn.cloneNode(true);
    const newList = listBtn.cloneNode(true);
    nextBtn.replaceWith(newNext);
    listBtn.replaceWith(newList);

    if (state.guidedPath && state.guidedPath.step === "lesson") {
        // Guided path: continue to flashcards
        newNext.textContent = "Continue to Flashcards →";
        newNext.addEventListener("click", () => {
            state.guidedPath.step = "flashcards";
            startGuidedFlashcards();
        });
        newList.textContent = "Exit to Menu";
        newList.addEventListener("click", () => {
            state.guidedPath = null;
            goHome();
        });
    } else {
        // Normal lesson flow
        const currentIdx = LESSONS.findIndex((l) => l.id === state.currentLesson.id);
        const nextLesson = LESSONS[currentIdx + 1];

        if (nextLesson) {
            newNext.textContent = "Next Lesson";
            newNext.addEventListener("click", () => startLesson(nextLesson));
        } else {
            newNext.textContent = "Replay Lesson";
            newNext.addEventListener("click", () => startLesson(state.currentLesson));
        }

        newList.addEventListener("click", () => {
            goHome();
        });
    }

    checkBadges();
}

// ================================================================
//  FEEDBACK MESSAGES
// ================================================================
const correctMessages = [
    "Nice work!", "Nailed it!", "You got it!",
    "Look at you go!", "Crushed it!", "That's the one!",
    "Boom — perfect!", "You knew that!", "Sharp spelling!",
    "Locked in!", "Too easy for you!", "No hesitation!",
    "That's how it's done!", "Clean!",
];

function getCorrectMessage() {
    return correctMessages[Math.floor(Math.random() * correctMessages.length)];
}

// ================================================================
//  SPELLING ERROR ANALYSIS
//  Detects WHY the student misspelled and gives a targeted tip
// ================================================================
function analyzeSpellingError(correctWord, userAttempt) {
    const correct = correctWord.toLowerCase();
    const attempt = userAttempt.toLowerCase();

    if (attempt.length === 0) return "No worries — listen to the word one more time and give it another shot.";

    const tips = [];

    // --- 1. Letter swap / transposition (very common in dyslexia) ---
    for (let i = 0; i < correct.length - 1; i++) {
        if (i < attempt.length - 1 &&
            correct[i] === attempt[i + 1] &&
            correct[i + 1] === attempt[i]) {
            tips.push({
                priority: 1,
                msg: `You swapped "${correct[i]}" and "${correct[i + 1]}" — that's super common. Try saying the word slowly, one letter at a time.`,
            });
            break;
        }
    }

    // --- 2. Silent letter omission ---
    const silentLetterTips = {
        kn: `Sneaky one — the "k" is silent before "n," like in knife, know, and knight.`,
        wr: `Tricky — the "w" is silent before "r," like in write, wrong, and wrist.`,
        gn: `This one's sneaky — the "g" hides before "n," like in sign and gnaw.`,
        mb: `Quiet letter alert — the "b" is silent after "m," like in climb and thumb.`,
        ps: `Weird one, right? The "p" is silent before "s," like in psychology and psalm.`,
    };
    for (const [combo, tip] of Object.entries(silentLetterTips)) {
        if (correct.includes(combo) && !attempt.includes(combo)) {
            tips.push({ priority: 1, msg: tip });
            break;
        }
    }

    // Silent "gh" (trickier — need to check it's not the "f" sound)
    if (correct.includes("gh")) {
        const ghIdx = correct.indexOf("gh");
        const fSoundGH = correct.includes("ough") && correct.endsWith("gh");
        if (!fSoundGH && !attempt.includes("gh") && correct.includes("igh")) {
            tips.push({ priority: 1, msg: `The "gh" is silent here — it's part of the "-igh" pattern, like light and night. English is wild sometimes.` });
        } else if (!fSoundGH && !attempt.includes("gh")) {
            tips.push({ priority: 2, msg: `This word has a sneaky silent "gh" — honestly one of English's weirdest patterns.` });
        }
    }

    // --- 3. ie/ei confusion ---
    if ((correct.includes("ie") && attempt.includes("ei")) ||
        (correct.includes("ei") && attempt.includes("ie"))) {
        const eiIdx = correct.indexOf("ei");
        const afterC = eiIdx > 0 && correct[eiIdx - 1] === "c";
        if (correct.includes("ei") && afterC) {
            tips.push({ priority: 1, msg: `Classic rule: "i before e, except after c" — there's a "c" right before, so it flips to "ei" here.` });
        } else if (correct.includes("ie")) {
            tips.push({ priority: 1, msg: `Good old "i before e, except after c" — no "c" here, so it stays "ie."` });
        } else {
            tips.push({ priority: 1, msg: `This one breaks the rule — it uses "ei" even without a "c." English likes to keep us on our toes.` });
        }
    }

    // --- 4. Double letter issues ---
    const doubleRe = /(.)\1/g;
    const correctDoubles = new Set([...correct.matchAll(doubleRe)].map(m => m[1]));
    const attemptDoubles = new Set([...attempt.matchAll(doubleRe)].map(m => m[1]));

    // Missing a double
    for (const letter of correctDoubles) {
        if (!attemptDoubles.has(letter)) {
            tips.push({ priority: 2, msg: `This word has a double "${letter}" — picture "${letter}${letter}" hanging out together in "${correctWord}."` });
            break;
        }
    }
    // Extra double that shouldn't be there
    for (const letter of attemptDoubles) {
        if (!correctDoubles.has(letter)) {
            tips.push({ priority: 2, msg: `Close — you doubled the "${letter}," but this word only needs one.` });
            break;
        }
    }

    // --- 5. Common ending confusions ---
    // tion vs sion
    if ((correct.endsWith("tion") && attempt.includes("sion")) ||
        (correct.endsWith("sion") && attempt.includes("tion"))) {
        tips.push({
            priority: 1,
            msg: correct.endsWith("tion")
                ? `This one ends in "-tion," not "-sion." Most words go with "-tion," so that's a good default to remember.`
                : `This one uses "-sion" instead of "-tion" — they sound almost the same, which makes it tricky.`,
        });
    }

    // able vs ible
    if ((correct.endsWith("able") && attempt.includes("ible")) ||
        (correct.endsWith("ible") && attempt.includes("able"))) {
        tips.push({
            priority: 2,
            msg: correct.endsWith("able")
                ? `This one uses "-able," not "-ible." A good trick: if the root is a real word on its own, it's usually "-able."`
                : `This one uses "-ible," not "-able" — not the most obvious, but you'll get the feel for it.`,
        });
    }

    // ous vs us
    if (correct.endsWith("ous") && attempt.endsWith("us") && !attempt.endsWith("ous")) {
        tips.push({ priority: 2, msg: `Almost — this word ends in "-ous," not just "-us." That sneaky "o" hides in there.` });
    }

    // ence vs ance (and ent vs ant)
    if ((correct.includes("ence") && attempt.includes("ance")) ||
        (correct.includes("ance") && attempt.includes("ence"))) {
        tips.push({
            priority: 2,
            msg: correct.includes("ence")
                ? `This one uses "-ence," not "-ance" — they sound the same, so don't sweat mixing them up.`
                : `This one uses "-ance," not "-ence" — those two are easy to mix up.`,
        });
    }

    // --- 6. "ough" and "augh" patterns ---
    if (correct.includes("ough") && !attempt.includes("ough")) {
        tips.push({ priority: 1, msg: `The "ough" pattern strikes again — honestly one of the trickiest combos in English. You're not alone on this one.` });
    }
    if (correct.includes("augh") && !attempt.includes("augh")) {
        tips.push({ priority: 1, msg: `This word uses the "augh" pattern — same as caught and daughter. Weird spelling, but you'll lock it in.` });
    }

    // --- 7. Phonetic substitutions ---
    // ph → f
    if (correct.includes("ph") && !attempt.includes("ph")) {
        const fIdx = attempt.indexOf("f");
        const phIdx = correct.indexOf("ph");
        if (fIdx !== -1 && Math.abs(fIdx - phIdx) <= 1) {
            tips.push({ priority: 1, msg: `This word uses "ph" for the "f" sound — it comes from Greek, which is why it looks different than you'd expect.` });
        }
    }

    // ck vs k vs c
    if (correct.includes("ck") && !attempt.includes("ck")) {
        tips.push({ priority: 2, msg: `This word uses "ck" — the "c" and "k" are a team here. Once you spot the pattern, it clicks.` });
    }

    // que pattern
    if (correct.includes("que") && !attempt.includes("que")) {
        tips.push({ priority: 2, msg: `This word uses "que" — borrowed from French, which is why it looks fancy. Makes a "k" sound.` });
    }

    // --- 8. Vowel confusion (a/e, e/i, etc.) ---
    if (tips.length === 0) {
        const vowels = "aeiou";
        for (let i = 0; i < Math.min(correct.length, attempt.length); i++) {
            if (correct[i] !== attempt[i] &&
                vowels.includes(correct[i]) && vowels.includes(attempt[i])) {
                tips.push({
                    priority: 3,
                    msg: `Check the vowel in position ${i + 1} — you wrote "${attempt[i]}" but it should be "${correct[i]}". Vowels are honestly the hardest part — they all sound so similar. You were close though.`,
                });
                break;
            }
        }
    }

    // --- 9. Missing letters ---
    if (tips.length === 0 && attempt.length < correct.length) {
        const missing = correct.length - attempt.length;
        // Try to find which specific letters are missing
        const correctArr = correct.split("");
        const attemptArr = attempt.split("");
        const missingLetters = [];
        const tempCorrect = [...correctArr];
        for (const ch of attemptArr) {
            const idx = tempCorrect.indexOf(ch);
            if (idx !== -1) tempCorrect.splice(idx, 1);
        }
        if (tempCorrect.length <= 3) {
            tips.push({
                priority: 3,
                msg: `You're missing "${tempCorrect.join('", "')}" — the full word has ${correct.length} letters. You're almost there.`,
            });
        } else {
            tips.push({
                priority: 3,
                msg: `You're close but missing ${missing} letter${missing > 1 ? "s" : ""}. The word has ${correct.length} letters — try breaking it into syllables and matching each sound to its letters.`,
            });
        }
    }

    // --- 10. Extra letters ---
    if (tips.length === 0 && attempt.length > correct.length) {
        const extra = attempt.length - correct.length;
        tips.push({
            priority: 3,
            msg: `You added ${extra} extra letter${extra > 1 ? "s" : ""}. The word only has ${correct.length} letters — see if you can spot which ones don't belong. You're really close.`,
        });
    }

    // --- 11. Position-specific fallback ---
    if (tips.length === 0) {
        const wrong = [];
        for (let i = 0; i < Math.max(correct.length, attempt.length); i++) {
            if (i >= correct.length || i >= attempt.length || correct[i] !== attempt[i]) {
                wrong.push(i);
            }
        }
        if (wrong.length === 1 && wrong[0] < correct.length && wrong[0] < attempt.length) {
            const pos = wrong[0];
            tips.push({
                priority: 3,
                msg: `So close! Just letter ${pos + 1} is off — it should be "${correct[pos]}" instead of "${attempt[pos]}."`,
            });
        } else if (wrong.length <= 3) {
            tips.push({
                priority: 3,
                msg: `You're almost there — just positions ${wrong.map(w => w + 1).join(", ")} need a tweak.`,
            });
        } else {
            tips.push({
                priority: 4,
                msg: `Try breaking it into chunks — say each syllable and match the sounds to letters. You'll get it.`,
            });
        }
    }

    // Return the highest-priority (lowest number) tip
    tips.sort((a, b) => a.priority - b.priority);
    return tips[0].msg;
}

function showFeedback(type, message) {
    const fb = $("feedback");
    fb.textContent = message;
    fb.className = `feedback ${type}`;
    // Read feedback aloud
    if (message) speak(message);
}

// Show feedback with a spelling analysis tip underneath
function showFeedbackWithTip(feedbackId, type, mainMessage, tip) {
    const fb = $(feedbackId);
    if (mainMessage) {
        fb.innerHTML = `<div class="feedback-main">${mainMessage}</div><div class="feedback-tip">💡 ${tip}</div>`;
        // Read main message + tip aloud
        speakNatural(`${mainMessage}. ${tip}`);
    } else {
        fb.innerHTML = `<div class="feedback-tip">💡 ${tip}</div>`;
        // Read the tip aloud
        speak(tip);
    }
    fb.className = `feedback ${type}`;
}

function resetFeedback() {
    const fb = $("feedback");
    fb.className = "feedback hidden";
    $("drop-zone").classList.remove("correct", "incorrect");
    $("ai-feedback").classList.add("hidden");
    $("sentence-display").classList.add("hidden");
}

// ================================================================
//  STATS
// ================================================================
function updateStats() {
    $("streak").textContent = state.streak;
    $("score").textContent = state.score;
    $("level").textContent = state.level;
}

// ================================================================
//  RESULTS SCREEN
// ================================================================
function showResults() {
    savePersistentStats();
    showScreen("result");

    const pct = state.wordsAttempted > 0
        ? Math.round((state.wordsCorrect / state.wordsAttempted) * 100)
        : 0;

    let title = "Nice session!";
    if (pct === 100) title = "Perfect round — you crushed it!";
    else if (pct >= 80) title = "Really solid work!";
    else if (pct >= 50) title = "Good effort — you're getting there!";
    else title = "Tough round, but you showed up and that matters.";

    const modeLabel = state.mode === "flash" ? "Flashcards" : "Spelling";
    const reviewLabel = state.isReviewMode ? " (Review)" : "";

    $("result-title").textContent = title;
    $("result-stats").innerHTML = `
        <div class="result-stat">
            <span class="result-stat-value">${state.wordsCorrect}</span>
            <span class="result-stat-label">Correct</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${state.wordsAttempted}</span>
            <span class="result-stat-label">Total</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${pct}%</span>
            <span class="result-stat-label">Accuracy</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${state.bestStreak}</span>
            <span class="result-stat-label">Best Streak</span>
        </div>
    `;

    // AI Session Insight
    $("ai-session-insight").classList.add("hidden");
    showAiSessionInsight("ai-session-insight", "ai-session-insight-text");

    // Remove old listeners by replacing buttons
    const replayBtn = $("btn-replay");
    const catBtn = $("btn-categories");
    const newReplay = replayBtn.cloneNode(true);
    const newCat = catBtn.cloneNode(true);
    replayBtn.replaceWith(newReplay);
    catBtn.replaceWith(newCat);

    if (state.guidedPath) {
        if (state.guidedPath.step === "flashcards") {
            newReplay.textContent = "Continue to Scramble →";
            newReplay.addEventListener("click", () => {
                state.guidedPath.step = "scramble";
                startGuidedScramble();
            });
        } else if (state.guidedPath.step === "scramble") {
            newReplay.textContent = "🐝 Time for the Spelling Bee!";
            newReplay.addEventListener("click", () => {
                startGuidedSpellingBee();
            });
        } else {
            newReplay.addEventListener("click", () => {
                goHome();
            });
        }
        newCat.textContent = "Exit to Menu";
        newCat.addEventListener("click", () => {
            state.guidedPath = null;
            goHome();
        });
    } else {
        newReplay.addEventListener("click", () => {
            if (state.isReviewMode) {
                startReview();
            } else if (state.mode === "lessons" && state.currentLesson) {
                startLesson(state.currentLesson);
            } else if (state.mode === "flash") {
                startFlashcards(state.currentCategory);
            } else {
                startCategory(state.currentCategory);
            }
        });
        newCat.addEventListener("click", () => {
            goHome();
        });
    }

    checkBadges();
}

// ================================================================
//  BADGE SYSTEM
// ================================================================
function checkBadges() {
    if (typeof BADGES === "undefined") return;
    const stats = BADGES.gatherStats();
    const newBadges = BADGES.checkForNew(stats);
    if (newBadges.length > 0) {
        Sound.badgeUnlock();
        showBadgePopup(newBadges[0]);
    }
}

function showBadgePopup(badge) {
    $("badge-popup-icon").textContent = badge.icon;
    $("badge-popup-name").textContent = badge.name;
    const popup = $("badge-popup");
    popup.classList.remove("hidden");
    // Trigger animation
    requestAnimationFrame(() => {
        popup.classList.add("show");
    });
    setTimeout(() => {
        popup.classList.remove("show");
        setTimeout(() => popup.classList.add("hidden"), 500);
    }, 3000);
}

function renderBadgeGallery() {
    const grid = $("badge-grid");
    const unlocked = BADGES.getUnlocked();
    const unlockedSet = new Set(unlocked);
    grid.innerHTML = "";

    $("badge-gallery-count").textContent = `${unlocked.length} / ${BADGES.definitions.length} unlocked`;

    BADGES.definitions.forEach(badge => {
        const card = document.createElement("div");
        const isUnlocked = unlockedSet.has(badge.id);
        card.className = `badge-card ${isUnlocked ? "unlocked" : "locked"}`;
        card.innerHTML = `
            <span class="badge-card-icon">${badge.icon}</span>
            <span class="badge-card-name">${badge.name}</span>
            <span class="badge-card-desc">${badge.description}</span>
        `;
        grid.appendChild(card);
    });
}

// ================================================================
//  UTILITY
// ================================================================
function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// ================================================================
//  KEYBOARD SHORTCUTS
// ================================================================
document.addEventListener("keydown", (e) => {
    // Spell mode shortcuts
    if (screens.game.classList.contains("active")) {
        if (e.key === "Enter") {
            const checkBtn = $("btn-check");
            const nextBtn = $("btn-next") || $("btn-finish");
            if (nextBtn) nextBtn.click();
            else if (checkBtn) checkBtn.click();
        }

        if (e.key === "Backspace") {
            if (state.placedLetters.length > 0) {
                removeLetter(state.placedLetters.length - 1);
            }
        }

        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key) &&
            !e.ctrlKey && !e.metaKey && !e.altKey) {
            const target = e.key.toLowerCase();
            const bankItem = state.bankLetters.find((b) => !b.used && b.letter === target);
            if (bankItem) placeLetter(bankItem);
        }
    }

    // Lesson mode shortcuts
    if (screens.lesson.classList.contains("active") && state.lessonStep === "practice") {
        if (e.key === "Enter") {
            const checkBtn = $("btn-lesson-check");
            const nextBtn = $("btn-lesson-next") || $("btn-lesson-finish");
            if (nextBtn) nextBtn.click();
            else if (checkBtn) checkBtn.click();
        }

        if (e.key === "Backspace") {
            if (state.placedLetters.length > 0) {
                lessonRemoveLetter(state.placedLetters.length - 1);
            }
        }

        if (e.key.length === 1 && /[a-zA-Z]/.test(e.key) &&
            !e.ctrlKey && !e.metaKey && !e.altKey) {
            const target = e.key.toLowerCase();
            const bankItem = state.bankLetters.find((b) => !b.used && b.letter === target);
            if (bankItem) lessonPlaceLetter(bankItem);
        }
    }

    // Flashcard mode shortcuts
    if (screens.flash.classList.contains("active")) {
        if (e.key === " ") {
            e.preventDefault();
            flipFlashcard();
        }
        // Rating shortcuts (1=hard, 2=ok, 3=easy) — only when card is flipped
        if (state.flashFlipped) {
            if (e.key === "1") document.querySelector('[data-rating="hard"]').click();
            if (e.key === "2") document.querySelector('[data-rating="ok"]').click();
            if (e.key === "3") document.querySelector('[data-rating="easy"]').click();
        }
    }

    // Scramble mode shortcuts
    if (screens.scramble && screens.scramble.classList.contains("active")) {
        if (e.key === "Enter") {
            checkScrambleAnswer();
        }
    }
});

// ================================================================
//  SETTINGS PANEL
// ================================================================
// Parent gate for settings reset buttons
let parentGateA = 0, parentGateB = 0;
function resetParentGate() {
    parentGateA = Math.floor(Math.random() * 20) + 10;
    parentGateB = Math.floor(Math.random() * 20) + 10;
    const qEl = $("parent-gate-question");
    if (qEl) qEl.textContent = parentGateA + " + " + parentGateB + " = ";
    const aEl = $("parent-gate-answer");
    if (aEl) aEl.value = "";
    const gate = $("parent-gate");
    if (gate) gate.classList.remove("hidden");
    const btns = $("reset-buttons");
    if (btns) btns.classList.add("hidden");
}

if ($("btn-parent-gate-unlock")) {
    $("btn-parent-gate-unlock").addEventListener("click", () => {
        const answer = parseInt($("parent-gate-answer").value, 10);
        if (answer === parentGateA + parentGateB) {
            $("parent-gate").classList.add("hidden");
            $("reset-buttons").classList.remove("hidden");
        } else {
            $("parent-gate-answer").value = "";
            $("parent-gate-answer").placeholder = "Try again";
        }
    });
}

$("btn-settings").addEventListener("click", () => {
    $("settings-overlay").classList.remove("hidden");

    // --- Display settings ---
    const ds = _loadDisplaySettings();
    // Font
    document.querySelectorAll(".font-pick").forEach(b => {
        b.classList.toggle("active", (b.dataset.font === (ds.font || "Lexend")));
    });
    // Sliders
    $("font-size-slider").value = ds.fontSize || 18;
    $("font-size-val").textContent = (ds.fontSize || 18) + "px";
    $("letter-spacing-slider").value = ds.letterSpacing || 2;
    $("letter-spacing-val").textContent = (ds.letterSpacing || 2) === 0 ? "Normal" : "+" + ((ds.letterSpacing || 2) * 0.01).toFixed(2) + "em";
    $("word-spacing-slider").value = ds.wordSpacing || 0;
    $("word-spacing-val").textContent = (ds.wordSpacing || 0) === 0 ? "Normal" : "+" + ((ds.wordSpacing || 0) * 0.03).toFixed(2) + "em";
    $("line-height-slider").value = ds.lineHeight || 16;
    $("line-height-val").textContent = ((ds.lineHeight || 16) / 10).toFixed(1);
    // Background
    document.querySelectorAll(".bg-color-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.bg === (ds.bgTheme || "default"));
    });
    // Toggles
    $("toggle-bionic").checked = !!ds.bionic;
    $("toggle-ruler").checked = !!ds.ruler;
    $("toggle-hide-timer").checked = !!ds.hideTimer;

    // --- Voice settings ---
    const key = AI.getApiKey();
    $("api-key-input").value = key;
    $("api-key-status").textContent = key ? "Key saved." : "";
    $("api-key-status").className = key ? "settings-hint success" : "settings-hint";
    const oKey = _getOpenAIKey();
    $("openai-key-input").value = oKey;
    $("openai-key-status").textContent = oKey ? "Key saved — human voice active!" : "";
    $("openai-key-status").className = oKey ? "settings-hint success" : "settings-hint";
    $("voice-select-field").style.display = oKey ? "block" : "none";
    const activeVoice = _getOpenAIVoice();
    document.querySelectorAll(".voice-pick").forEach(b => {
        b.classList.toggle("active", b.dataset.voice === activeVoice);
    });
    _populateBrowserVoiceSelect();
    renderProfileStats();
    renderCustomWordList();
    resetParentGate();
});

$("btn-settings-close").addEventListener("click", () => {
    $("settings-overlay").classList.add("hidden");
});

$("settings-overlay").addEventListener("click", (e) => {
    if (e.target === $("settings-overlay")) {
        $("settings-overlay").classList.add("hidden");
    }
});

// --- Browser Voice Picker ---
function _populateBrowserVoiceSelect() {
    const sel = $("browser-voice-select");
    const voices = _getEnglishVoices();
    const saved = _getSavedBrowserVoice();
    // Keep the "Auto" option, clear the rest
    sel.innerHTML = '<option value="">Auto (best available)</option>';
    voices.forEach(v => {
        const opt = document.createElement("option");
        opt.value = v.name;
        const quality = /natural/i.test(v.name) ? " ★★★" : /neural|enhanced|premium/i.test(v.name) ? " ★★" : /google/i.test(v.name) ? " ★" : "";
        opt.textContent = `${v.name}${quality}`;
        if (v.name === saved) opt.selected = true;
        sel.appendChild(opt);
    });
    // Show current auto-selected voice info
    const current = _cachedVoice || _pickBestVoice();
    if (!saved && current) {
        $("browser-voice-info").textContent = `Currently using: ${current.name}`;
    } else {
        $("browser-voice-info").textContent = "";
    }
}

$("browser-voice-select").addEventListener("change", (e) => {
    const name = e.target.value;
    _setSavedBrowserVoice(name);
    _cachedVoice = null; // Force re-pick
    _cachedVoice = _pickBestVoice();
    $("browser-voice-info").textContent = _cachedVoice ? `Now using: ${_cachedVoice.name}` : "";
});

$("btn-test-browser-voice").addEventListener("click", () => {
    _cachedVoice = null;
    _cachedVoice = _pickBestVoice();
    // Use browser TTS directly (bypass cloud) to test the device voice
    _browserSpeak("Hi Colton! This is how I sound. Let's practice some spelling together!", 0.82);
});

// Reload voices when they become available (Chrome loads async)
if ("speechSynthesis" in window) {
    window.speechSynthesis.onvoiceschanged = () => {
        _cachedVoice = null;
        _voicesLoaded = true;
    };
}

// ===== Display Settings Event Handlers =====

// Font picker
document.querySelectorAll(".font-pick").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".font-pick").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const s = _loadDisplaySettings();
        s.font = btn.dataset.font;
        _saveDisplaySettings(s);
        applyDisplaySettings();
    });
});

// Font size slider
$("font-size-slider").addEventListener("input", (e) => {
    const v = parseInt(e.target.value);
    $("font-size-val").textContent = v + "px";
    const s = _loadDisplaySettings();
    s.fontSize = v;
    _saveDisplaySettings(s);
    applyDisplaySettings();
});

// Letter spacing slider
$("letter-spacing-slider").addEventListener("input", (e) => {
    const v = parseInt(e.target.value);
    $("letter-spacing-val").textContent = v === 0 ? "Normal" : "+" + (v * 0.01).toFixed(2) + "em";
    const s = _loadDisplaySettings();
    s.letterSpacing = v;
    _saveDisplaySettings(s);
    applyDisplaySettings();
});

// Word spacing slider
$("word-spacing-slider").addEventListener("input", (e) => {
    const v = parseInt(e.target.value);
    $("word-spacing-val").textContent = v === 0 ? "Normal" : "+" + (v * 0.03).toFixed(2) + "em";
    const s = _loadDisplaySettings();
    s.wordSpacing = v;
    _saveDisplaySettings(s);
    applyDisplaySettings();
});

// Line height slider
$("line-height-slider").addEventListener("input", (e) => {
    const v = parseInt(e.target.value);
    $("line-height-val").textContent = (v / 10).toFixed(1);
    const s = _loadDisplaySettings();
    s.lineHeight = v;
    _saveDisplaySettings(s);
    applyDisplaySettings();
});

// Background color
document.querySelectorAll(".bg-color-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        document.querySelectorAll(".bg-color-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const s = _loadDisplaySettings();
        s.bgTheme = btn.dataset.bg;
        _saveDisplaySettings(s);
        applyDisplaySettings();
    });
});

// Bionic reading toggle
$("toggle-bionic").addEventListener("change", (e) => {
    const s = _loadDisplaySettings();
    s.bionic = e.target.checked;
    _saveDisplaySettings(s);
    applyDisplaySettings();
});

// Reading ruler toggle
$("toggle-ruler").addEventListener("change", (e) => {
    const s = _loadDisplaySettings();
    s.ruler = e.target.checked;
    _saveDisplaySettings(s);
    applyDisplaySettings();
});

// Hide timer toggle
$("toggle-hide-timer").addEventListener("change", (e) => {
    const s = _loadDisplaySettings();
    s.hideTimer = e.target.checked;
    _saveDisplaySettings(s);
});

// --- OpenAI Voice Key ---
$("btn-save-openai-key").addEventListener("click", () => {
    const key = $("openai-key-input").value.trim();
    if (!key) {
        $("openai-key-status").textContent = "Please enter an OpenAI API key.";
        $("openai-key-status").className = "settings-hint error";
        $("voice-select-field").style.display = "none";
        return;
    }
    _setOpenAIKey(key);
    $("openai-key-status").textContent = "Key saved — human voice active!";
    $("openai-key-status").className = "settings-hint success";
    $("voice-select-field").style.display = "block";
    // Highlight active voice
    const activeVoice = _getOpenAIVoice();
    document.querySelectorAll(".voice-pick").forEach(b => {
        b.classList.toggle("active", b.dataset.voice === activeVoice);
    });
});

// --- Voice Selection ---
document.querySelectorAll(".voice-pick").forEach(btn => {
    btn.addEventListener("click", () => {
        _setOpenAIVoice(btn.dataset.voice);
        document.querySelectorAll(".voice-pick").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        // Clear cache so new voice is used
        _ttsAudioCache.forEach(url => URL.revokeObjectURL(url));
        _ttsAudioCache.clear();
        // Preview the voice
        speak("Hi Colton! I'm your new reading coach. Let's learn together!");
    });
});

// --- Test Voice ---
$("btn-test-voice").addEventListener("click", () => {
    speakNatural("Hey Colton! This is what I sound like when I read your lessons. Pretty cool, right? Let's get started!");
});

// --- Anthropic AI Key ---
$("btn-save-key").addEventListener("click", () => {
    const key = $("api-key-input").value.trim();
    if (!key) {
        $("api-key-status").textContent = "Please enter an API key.";
        $("api-key-status").className = "settings-hint error";
        return;
    }
    AI.setApiKey(key);
    $("api-key-status").textContent = "Key saved! AI tutor is now active.";
    $("api-key-status").className = "settings-hint success";
});

$("btn-reset-profile").addEventListener("click", () => {
    if (confirm("Reset your learning profile? This clears all AI-tracked patterns. Your scores and progress are kept.")) {
        localStorage.removeItem(AI.PROFILE_STORAGE);
        $("ai-analysis").classList.add("hidden");
        renderProfileStats();
    }
});

// --- PIN Change ---
$("btn-change-pin").addEventListener("click", () => {
    const newPin = $("pin-change-input").value.trim();
    if (!/^\d{4,8}$/.test(newPin)) {
        $("pin-change-status").textContent = "PIN must be 4-8 digits.";
        $("pin-change-status").className = "settings-hint error";
        return;
    }
    setAppPin(newPin);
    $("pin-change-input").value = "";
    $("pin-change-status").textContent = "PIN updated!";
    $("pin-change-status").className = "settings-hint success";
});

$("btn-reset-everything").addEventListener("click", () => {
    if (confirm("Start completely fresh? This erases ALL your progress — scores, badges, reading history, custom words, everything. This can't be undone!")) {
        SRS.resetEverything();
        // Reset in-memory state
        state.score = 0;
        state.streak = 0;
        state.level = 1;
        $("score").textContent = "0";
        $("streak").textContent = "0";
        $("level").textContent = "1";
        // Close settings and go home
        $("settings-overlay").classList.add("hidden");
        goHome();
        alert("All done — fresh start! 💪");
    }
});

$("btn-ai-analysis").addEventListener("click", async () => {
    const btn = $("btn-ai-analysis");
    const el = $("ai-analysis");
    btn.textContent = "Analyzing...";
    btn.disabled = true;
    el.classList.remove("hidden");
    el.textContent = "Thinking...";

    const result = await AI.getProfileAnalysis();
    if (result) {
        el.textContent = result;
    } else {
        el.textContent = "Couldn't get analysis. Check your API key.";
    }
    btn.textContent = "Get AI Analysis";
    btn.disabled = false;
});

function renderProfileStats() {
    const profile = AI.getProfile();
    const accuracy = profile.totalAttempts > 0
        ? Math.round((profile.totalCorrect / profile.totalAttempts) * 100)
        : 0;

    const topErrors = Object.entries(profile.errorPatterns)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 3);

    $("profile-stats").innerHTML = `
        <div class="profile-stat-card">
            <span class="profile-stat-value">${profile.totalAttempts}</span>
            <span class="profile-stat-label">Words Attempted</span>
        </div>
        <div class="profile-stat-card">
            <span class="profile-stat-value">${accuracy}%</span>
            <span class="profile-stat-label">AI Accuracy</span>
        </div>
        <div class="profile-stat-card">
            <span class="profile-stat-value">${profile.masteredWords.length}</span>
            <span class="profile-stat-label">Mastered</span>
        </div>
        <div class="profile-stat-card">
            <span class="profile-stat-value">${topErrors.length > 0 ? topErrors[0][0].replace(/_/g, " ") : "—"}</span>
            <span class="profile-stat-label">Top Challenge</span>
        </div>
    `;

    // Show analysis button if there's enough data and an API key
    if (AI.hasApiKey() && profile.totalAttempts >= 5) {
        $("btn-ai-analysis").style.display = "inline-flex";
    } else {
        $("btn-ai-analysis").style.display = "none";
    }
}

// ================================================================
//  BADGE GALLERY
// ================================================================
$("btn-badges").addEventListener("click", () => {
    renderBadgeGallery();
    $("badge-overlay").classList.remove("hidden");
});

$("btn-badge-close").addEventListener("click", () => {
    $("badge-overlay").classList.add("hidden");
});

$("badge-overlay").addEventListener("click", (e) => {
    if (e.target === $("badge-overlay")) {
        $("badge-overlay").classList.add("hidden");
    }
});

// ================================================================
//  DAILY CHALLENGE
// ================================================================
function getDailyChallenge() {
    const today = new Date().toISOString().slice(0, 10);
    const saved = JSON.parse(localStorage.getItem("coltons_app_daily") || "{}");

    if (saved.date === today) {
        return saved;
    }

    // Pick a word based on date (deterministic)
    const allWords = [];
    Object.entries(WORD_LISTS).forEach(([cat, data]) => {
        data.words.forEach(w => allWords.push({ ...w, _category: cat }));
    });

    // Simple hash of date string to pick word
    let hash = 0;
    for (let i = 0; i < today.length; i++) {
        hash = ((hash << 5) - hash) + today.charCodeAt(i);
        hash |= 0;
    }
    const index = Math.abs(hash) % allWords.length;
    const word = allWords[index];

    const daily = {
        date: today,
        word: word.word,
        hint: word.hint,
        category: word._category,
        syllables: word.syllables,
        sentence: word.sentence || "",
        completed: false,
    };
    localStorage.setItem("coltons_app_daily", JSON.stringify(daily));
    return daily;
}

function renderDailyChallenge() {
    const daily = getDailyChallenge();
    const el = $("daily-challenge");

    $("daily-word").textContent = "\u{1f524} " + daily.hint;
    $("daily-hint").textContent = `Category: ${daily.category}`;

    if (daily.completed) {
        $("btn-daily-start").classList.add("hidden");
        $("daily-done").classList.remove("hidden");
    } else {
        $("btn-daily-start").classList.remove("hidden");
        $("daily-done").classList.add("hidden");
    }

    el.classList.remove("hidden");
}

$("btn-daily-start").addEventListener("click", () => {
    const daily = getDailyChallenge();
    // Start a single-word spelling session
    state.isReviewMode = false;
    state.currentCategory = daily.category;
    state.words = [{
        word: daily.word,
        hint: daily.hint,
        syllables: daily.syllables,
        sentence: daily.sentence,
    }];
    state.wordIndex = 0;
    state.wordsCorrect = 0;
    state.wordsAttempted = 0;
    state.wordResults = [];
    state.dailyChallengeWord = daily;
    showScreen("game");
    $("category-label").textContent = "\u{1f4c5} Daily Challenge";
    loadWord();
});

// ================================================================
//  SCRAMBLE MODE
// ================================================================
function startScramble(name) {
    state.isReviewMode = false;
    state.currentCategory = name;
    state.words = shuffle([...WORD_LISTS[name].words]);
    state.wordIndex = 0;
    state.wordsCorrect = 0;
    state.wordsAttempted = 0;
    state.wordResults = [];
    showScreen("scramble");
    $("scramble-category-label").textContent = `${WORD_LISTS[name].icon} ${name}`;
    loadScrambleWord();
}

function loadScrambleWord() {
    const wordData = state.words[state.wordIndex];
    state.attempts = 0;

    $("scramble-counter").textContent = `${state.wordIndex + 1} / ${state.words.length}`;
    $("scramble-hint-text").textContent = wordData.hint;
    $("scramble-input").value = "";
    $("scramble-feedback").className = "feedback hidden";
    $("scramble-ai-feedback").classList.add("hidden");
    $("scramble-sentence-display").classList.add("hidden");
    $("scramble-input").disabled = false;
    $("btn-scramble-check").textContent = "Check";

    // Create scrambled letters display
    const letters = shuffle(wordData.word.toLowerCase().split(""));
    const jumble = $("scramble-jumble");
    jumble.innerHTML = "";
    letters.forEach(letter => {
        const span = document.createElement("span");
        span.className = "scramble-letter";
        span.textContent = letter;
        jumble.appendChild(span);
    });

    $("scramble-input").focus();
    setTimeout(() => speak(wordData.word, 0.7), 300);
}

function checkScrambleAnswer() {
    // Handle "Next Word" / "See Results" button click (input disabled = word resolved)
    if ($("scramble-input").disabled) {
        if (state.wordIndex < state.words.length - 1) {
            state.wordIndex++;
            loadScrambleWord();
        } else {
            showResults();
        }
        return;
    }

    const wordData = state.words[state.wordIndex];
    const answer = $("scramble-input").value.trim().toLowerCase();
    const correct = wordData.word.toLowerCase();
    state.attempts++;

    if (answer === correct) {
        state.wordsCorrect++;
        state.wordsAttempted++;
        state.streak++;
        if (state.streak > state.bestStreak) state.bestStreak = state.streak;

        let points = 10;
        if (state.attempts === 1) points += 5;
        state.score += points;
        const prevLevel = state.level;
        state.level = Math.floor(state.score / 50) + 1;
        if (state.level > prevLevel) Sound.levelUp();

        updateStats();
        Sound.correct();

        const category = state.currentCategory;
        SRS.recordResult(category, wordData, true, state.attempts);
        state.wordResults.push({ word: wordData.word, answer: correct, correct: true });

        const fb = $("scramble-feedback");
        fb.textContent = getCorrectMessage();
        fb.className = "feedback success";
        speak("Correct! " + wordData.word);

        // Show sentence context
        if (wordData.sentence) {
            $("scramble-sentence-display").classList.remove("hidden");
            $("scramble-sentence-text").textContent = wordData.sentence;
        }

        // AI feedback (async, non-blocking)
        $("scramble-ai-feedback").classList.add("hidden");
        showAiFeedback("scramble-ai-feedback", "scramble-ai-feedback-text", wordData, correct, true, state.attempts, category);

        // Mark daily challenge complete if applicable
        if (state.dailyChallengeWord) {
            const d = getDailyChallenge();
            d.completed = true;
            localStorage.setItem("coltons_app_daily", JSON.stringify(d));
            state.dailyChallengeWord = null;
        }

        // Show Next/Results button (user-controlled, so they can read AI feedback)
        $("scramble-input").disabled = true;
        $("btn-scramble-check").textContent = state.wordIndex < state.words.length - 1 ? "Next Word \u2192" : "See Results";
    } else {
        state.streak = 0;
        Sound.incorrect();
        updateStats();

        if (state.attempts >= 3) {
            state.wordsAttempted++;
            const fb = $("scramble-feedback");
            fb.innerHTML = `<div class="feedback-main">Tough word! The answer was: ${wordData.word}</div><div class="feedback-tip">\u{1f4a1} ${analyzeSpellingError(wordData.word, answer)}</div>`;
            fb.className = "feedback error";
            speakWordTeach(wordData.word, wordData.syllables);

            SRS.recordResult(state.currentCategory, wordData, false, state.attempts);
            state.wordResults.push({ word: wordData.word, answer, correct: false });

            // AI feedback (async, non-blocking)
            $("scramble-ai-feedback").classList.add("hidden");
            showAiFeedback("scramble-ai-feedback", "scramble-ai-feedback-text", wordData, answer, false, state.attempts, state.currentCategory);

            // Show Next/Results button (user-controlled, so they can read AI feedback)
            $("scramble-input").disabled = true;
            $("btn-scramble-check").textContent = state.wordIndex < state.words.length - 1 ? "Next Word \u2192" : "See Results";
        } else {
            const fb = $("scramble-feedback");
            fb.innerHTML = `<div class="feedback-tip">\u{1f4a1} ${analyzeSpellingError(wordData.word, answer)}</div>`;
            fb.className = "feedback error";
            $("scramble-input").value = "";
            $("scramble-input").focus();
        }
    }
}

$("btn-scramble-check").addEventListener("click", checkScrambleAnswer);

$("scramble-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkScrambleAnswer();
});

$("btn-scramble-hear").addEventListener("click", () => {
    const wordData = state.words[state.wordIndex];
    speak(wordData.word, 0.7);
});

$("btn-scramble-back").addEventListener("click", () => {
    savePersistentStats();
    goHome();
});

// ================================================================
//  CUSTOM WORD LISTS
// ================================================================
const CUSTOM_STORAGE_KEY = "coltons_app_custom_words";

function getCustomWords() {
    try {
        return JSON.parse(localStorage.getItem(CUSTOM_STORAGE_KEY)) || [];
    } catch { return []; }
}

function saveCustomWords(words) {
    localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(words));
    syncCustomCategory();
}

function syncCustomCategory() {
    const words = getCustomWords();
    if (words.length > 0) {
        WORD_LISTS["My Words"] = {
            icon: "\u2b50",
            color: "#fdcb6e",
            words: words.map(w => ({
                word: w.word,
                hint: w.hint || "Custom word",
                syllables: w.word.split(/(?=[aeiou])/i).filter(Boolean),
                sentence: "",
            })),
        };
    } else {
        delete WORD_LISTS["My Words"];
    }
}

function renderCustomWordList() {
    const words = getCustomWords();
    const list = $("custom-word-list");
    list.innerHTML = "";
    words.forEach((w, i) => {
        const item = document.createElement("div");
        item.className = "custom-word-item";
        item.innerHTML = `
            <div>
                <span class="custom-word-item-text">${w.word}</span>
                <span class="custom-word-item-hint">${w.hint || ""}</span>
            </div>
            <button class="btn-remove-word" data-index="${i}" aria-label="Remove word">\u00d7</button>
        `;
        list.appendChild(item);
    });

    // Wire remove buttons
    list.querySelectorAll(".btn-remove-word").forEach(btn => {
        btn.addEventListener("click", () => {
            const idx = parseInt(btn.dataset.index);
            const updated = getCustomWords();
            updated.splice(idx, 1);
            saveCustomWords(updated);
            renderCustomWordList();
        });
    });
}

$("btn-add-custom-word").addEventListener("click", () => {
    const wordInput = $("custom-word-input");
    const hintInput = $("custom-hint-input");
    const word = wordInput.value.trim().toLowerCase();
    if (!word) return;

    const words = getCustomWords();
    if (words.some(w => w.word === word)) return; // no duplicates

    words.push({ word, hint: hintInput.value.trim() });
    saveCustomWords(words);
    renderCustomWordList();

    wordInput.value = "";
    hintInput.value = "";
    wordInput.focus();
});

// Initialize custom words on load
syncCustomCategory();

// ================================================================
//  PROGRESS DASHBOARD
// ================================================================
function renderDashboard() {
    const srsStats = SRS.loadStats();
    const profile = AI.getProfile();
    const struggling = SRS.getStrugglingWords(10);
    const lessonProgress = getLessonProgress();

    const lessonsCompleted = Object.values(lessonProgress).filter(p => p.completed).length;
    const accuracy = srsStats.totalWordsAttempted > 0
        ? Math.round((srsStats.totalWordsCorrect / srsStats.totalWordsAttempted) * 100) : 0;

    let html = "";

    // Overview stats
    html += `
    <div class="dashboard-card">
        <span class="dashboard-card-title">Overall Stats</span>
        <div class="dashboard-stats-row">
            <div class="dashboard-stat">
                <span class="dashboard-stat-value">${srsStats.totalWordsCorrect}</span>
                <span class="dashboard-stat-label">Words Correct</span>
            </div>
            <div class="dashboard-stat">
                <span class="dashboard-stat-value">${accuracy}%</span>
                <span class="dashboard-stat-label">Accuracy</span>
            </div>
            <div class="dashboard-stat">
                <span class="dashboard-stat-value">${srsStats.bestStreak}</span>
                <span class="dashboard-stat-label">Best Streak</span>
            </div>
            <div class="dashboard-stat">
                <span class="dashboard-stat-value">${srsStats.sessionsPlayed}</span>
                <span class="dashboard-stat-label">Sessions</span>
            </div>
        </div>
    </div>`;

    // Level & Score
    html += `
    <div class="dashboard-card">
        <span class="dashboard-card-title">Level Progress</span>
        <div class="dashboard-stats-row">
            <div class="dashboard-stat">
                <span class="dashboard-stat-value">${srsStats.level || 1}</span>
                <span class="dashboard-stat-label">Current Level</span>
            </div>
            <div class="dashboard-stat">
                <span class="dashboard-stat-value">${srsStats.totalScore || 0}</span>
                <span class="dashboard-stat-label">Total Score</span>
            </div>
            <div class="dashboard-stat">
                <span class="dashboard-stat-value">${lessonsCompleted}/${LESSONS.length}</span>
                <span class="dashboard-stat-label">Lessons Done</span>
            </div>
            <div class="dashboard-stat">
                <span class="dashboard-stat-value">${BADGES.getUnlocked().length}</span>
                <span class="dashboard-stat-label">Badges</span>
            </div>
        </div>
    </div>`;

    // Error patterns
    const topErrors = Object.entries(profile.errorPatterns)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 5);

    if (topErrors.length > 0) {
        const maxCount = topErrors[0][1].count;
        html += `
        <div class="dashboard-card">
            <span class="dashboard-card-title">Common Error Patterns</span>
            <div class="dashboard-bar-chart">
                ${topErrors.map(([type, data]) => `
                    <div class="dashboard-bar-row">
                        <span class="dashboard-bar-label">${type.replace(/_/g, " ")}</span>
                        <div class="dashboard-bar-track">
                            <div class="dashboard-bar-fill" style="width: ${(data.count / maxCount) * 100}%; background: var(--error);"></div>
                        </div>
                        <span class="dashboard-bar-value">${data.count}\u00d7</span>
                    </div>
                `).join("")}
            </div>
        </div>`;
    }

    // Struggling words
    if (struggling.length > 0) {
        html += `
        <div class="dashboard-card">
            <span class="dashboard-card-title">Words to Practice</span>
            <div class="dashboard-word-list">
                ${struggling.map(w => `<span class="dashboard-word-tag struggling">${w.word}</span>`).join("")}
            </div>
        </div>`;
    }

    // Mastered words
    if (profile.masteredWords.length > 0) {
        html += `
        <div class="dashboard-card">
            <span class="dashboard-card-title">Mastered Words</span>
            <div class="dashboard-word-list">
                ${profile.masteredWords.map(w => `<span class="dashboard-word-tag mastered">${w}</span>`).join("")}
            </div>
        </div>`;
    }

    // Growth chart — weekly progress
    html += _buildGrowthChart();

    $("dashboard-content").innerHTML = html;
}

function _buildGrowthChart() {
    // Gather weekly data from multiple sources
    const readingStats = SRS.getReadingStats();
    const srsData = SRS._loadData();
    const practiceHistory = SRS.getPracticeHistory(56); // 8 weeks

    // Build weekly buckets (last 8 weeks)
    const weeks = [];
    const now = new Date();
    for (let w = 7; w >= 0; w--) {
        const weekStart = new Date(now);
        weekStart.setDate(weekStart.getDate() - (w * 7 + now.getDay()));
        weekStart.setHours(0, 0, 0, 0);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekLabel = `${weekStart.getMonth() + 1}/${weekStart.getDate()}`;

        // Count words mastered (correctCount >= 3, streak >= 2) that were last seen this week
        let mastered = 0;
        for (const entry of Object.values(srsData)) {
            if (entry.lastSeen >= weekStart.getTime() && entry.lastSeen < weekEnd.getTime()) {
                if (entry.correctCount >= 3 && entry.streak >= 2) mastered++;
            }
        }

        // Reading accuracy this week
        const weekReadingSessions = readingStats.sessions.filter(s =>
            s.date >= weekStart.getTime() && s.date < weekEnd.getTime()
        );
        const readingAccuracy = weekReadingSessions.length > 0
            ? Math.round(weekReadingSessions.reduce((sum, s) => sum + (s.wordsCorrect / Math.max(1, s.wordsTotal)), 0) / weekReadingSessions.length * 100)
            : null;

        // Practice days this week
        const practiceDays = practiceHistory.filter(d => {
            const dt = new Date(d + "T00:00:00");
            return dt >= weekStart && dt < weekEnd;
        }).length;

        weeks.push({ label: weekLabel, mastered, readingAccuracy, practiceDays });
    }

    // Check if there's any data at all
    const hasData = weeks.some(w => w.mastered > 0 || w.readingAccuracy !== null || w.practiceDays > 0);
    if (!hasData) {
        return `
        <div class="dashboard-card">
            <span class="dashboard-card-title">Growth Over Time</span>
            <p class="settings-desc" style="text-align:center;padding:1rem;">Keep practicing! Your growth chart will appear here after a few sessions.</p>
        </div>`;
    }

    // SVG chart dimensions
    const W = 320, H = 160, PAD = 30, PADT = 10;
    const chartW = W - PAD * 2;
    const chartH = H - PAD - PADT;
    const barW = chartW / weeks.length;

    // Max values for scaling
    const maxMastered = Math.max(1, ...weeks.map(w => w.mastered));

    // Build bars
    let bars = "";
    let labels = "";
    let dots = "";
    weeks.forEach((w, i) => {
        const x = PAD + i * barW + barW / 2;

        // Mastered words bar
        const barH = (w.mastered / maxMastered) * chartH;
        bars += `<rect x="${x - barW * 0.3}" y="${PADT + chartH - barH}" width="${barW * 0.6}" height="${barH}" rx="3" fill="var(--success)" opacity="0.7"/>`;

        // Value on top of bar
        if (w.mastered > 0) {
            bars += `<text x="${x}" y="${PADT + chartH - barH - 4}" text-anchor="middle" font-size="10" fill="var(--success)" font-weight="600">${w.mastered}</text>`;
        }

        // Reading accuracy line dots
        if (w.readingAccuracy !== null) {
            const dotY = PADT + chartH - (w.readingAccuracy / 100) * chartH;
            dots += `<circle cx="${x}" cy="${dotY}" r="4" fill="var(--accent)" stroke="#fff" stroke-width="1.5"/>`;
            // Connect to previous dot
            if (i > 0 && weeks[i - 1].readingAccuracy !== null) {
                const prevX = PAD + (i - 1) * barW + barW / 2;
                const prevY = PADT + chartH - (weeks[i - 1].readingAccuracy / 100) * chartH;
                dots += `<line x1="${prevX}" y1="${prevY}" x2="${x}" y2="${dotY}" stroke="var(--accent)" stroke-width="2" opacity="0.6"/>`;
            }
        }

        // Practice day indicators (small dots at bottom)
        for (let d = 0; d < Math.min(w.practiceDays, 7); d++) {
            bars += `<circle cx="${x - 9 + d * 3}" cy="${PADT + chartH + 12}" r="1.5" fill="${d < w.practiceDays ? 'var(--accent)' : 'rgba(0,0,0,0.1)'}"/>`;
        }

        // Week label
        labels += `<text x="${x}" y="${H - 2}" text-anchor="middle" font-size="9" fill="var(--text-muted)">${w.label}</text>`;
    });

    return `
    <div class="dashboard-card">
        <span class="dashboard-card-title">Growth Over Time</span>
        <div class="growth-chart-legend">
            <span class="growth-legend-item"><span class="growth-dot" style="background:var(--success);"></span> Words mastered</span>
            <span class="growth-legend-item"><span class="growth-dot" style="background:var(--accent);"></span> Reading accuracy</span>
            <span class="growth-legend-item"><span class="growth-dots-icon">●●●</span> Practice days</span>
        </div>
        <svg viewBox="0 0 ${W} ${H}" class="growth-chart-svg">
            <!-- Grid lines -->
            <line x1="${PAD}" y1="${PADT}" x2="${PAD}" y2="${PADT + chartH}" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
            <line x1="${PAD}" y1="${PADT + chartH}" x2="${W - PAD}" y2="${PADT + chartH}" stroke="rgba(0,0,0,0.08)" stroke-width="1"/>
            ${bars}
            ${dots}
            ${labels}
        </svg>
    </div>`;
}

$("btn-open-dashboard").addEventListener("click", () => {
    $("settings-overlay").classList.add("hidden");
    renderDashboard();
    showScreen("dashboard");
});

$("btn-dashboard-back").addEventListener("click", () => {
    goHome();
});

// ================================================================
//  AI FEEDBACK HELPERS
// ================================================================
async function showAiFeedback(elementId, textId, wordData, userAnswer, wasCorrect, attempts, category) {
    if (!AI.hasApiKey()) return;

    const container = $(elementId);
    const textEl = $(textId);
    container.classList.remove("hidden");
    container.classList.add("loading");
    textEl.textContent = "";

    const feedback = await AI.getWordFeedback(wordData, userAnswer, wasCorrect, attempts, category);
    container.classList.remove("loading");
    if (feedback) {
        textEl.textContent = feedback;
        // Read the AI feedback aloud (sentence-by-sentence for natural sound)
        speakNatural(feedback);
    } else {
        container.classList.add("hidden");
    }
}

async function showAiSessionInsight(elementId, textId) {
    if (!AI.hasApiKey()) return;

    const container = $(elementId);
    const textEl = $(textId);
    container.classList.remove("hidden");
    container.classList.add("loading");
    textEl.textContent = "";

    const insight = await AI.getSessionInsight(state.wordsCorrect, state.wordsAttempted, state.wordResults);
    container.classList.remove("loading");
    if (insight) {
        textEl.textContent = insight;
        // Read the session insight aloud (sentence-by-sentence for natural sound)
        speakNatural(insight);
    } else {
        container.classList.add("hidden");
    }
}

async function loadAiRecommendation() {
    if (!AI.hasApiKey()) {
        $("ai-recommendation").classList.add("hidden");
        return;
    }

    const profile = AI.getProfile();
    if (profile.totalAttempts < 3) {
        $("ai-recommendation").classList.add("hidden");
        return;
    }

    $("ai-recommendation").classList.remove("hidden");
    $("ai-recommendation-text").textContent = "Thinking about what to practice next...";

    const rec = await AI.getRecommendation();
    if (rec) {
        $("ai-recommendation-text").textContent = rec;
    } else {
        $("ai-recommendation").classList.add("hidden");
    }
}

// ================================================================
//  READING MODE
// ================================================================

function startReading(name, passageIndex) {
    const category = PASSAGE_LISTS[name];
    if (!category || category.passages.length === 0) return;

    // For books: go in order. For short passage collections: pick random.
    let idx;
    if (passageIndex !== undefined) {
        idx = passageIndex;
    } else if (category.book) {
        idx = 0; // Start at chapter 1
    } else {
        idx = Math.floor(Math.random() * category.passages.length);
    }

    if (idx >= category.passages.length) idx = 0; // Wrap around
    const passage = category.passages[idx];

    state.currentCategory = name;
    state.currentPassage = passage;
    state.passageIndex = idx;
    state.sentenceIndex = 0;
    state.readingStartTime = null;
    state.readingResults = [];
    state.readingStruggledWords = [];
    state.recognitionActive = false;
    state.listenFirst = $("read-listen-first").checked;

    showScreen("read");
    $("read-category-label").textContent = `${category.icon} ${passage.title}`;
    $("read-counter").textContent = `1 / ${passage.sentences.length}`;

    // Render full passage with sentence spans
    renderPassageText();

    // Reset UI elements
    $("read-word-feedback").classList.add("hidden");
    $("read-actions").classList.add("hidden");
    $("read-ai-feedback").classList.add("hidden");
    $("read-transcript").classList.add("hidden");
    $("read-manual").classList.add("hidden");
    $("btn-read-mic").classList.remove("listening");
    $("mic-label").textContent = "Your Turn \u2014 Tap to Read";

    // Cancel any ongoing Just Listen playback
    cancelJustListen();

    // Initialize sub-mode to Read & Listen
    switchReadSubMode("read-listen");

    // Load first sentence
    loadSentence();
}

function renderPassageText() {
    const container = $("passage-text");
    container.innerHTML = "";
    const isBionic = _loadDisplaySettings().bionic;
    state.currentPassage.sentences.forEach((sentence, i) => {
        const span = document.createElement("span");
        span.className = "passage-sentence";
        span.dataset.index = i;
        if (isBionic) {
            span.innerHTML = bionicTransform(sentence) + " ";
        } else {
            span.textContent = sentence + " ";
        }
        container.appendChild(span);
    });
}

function loadSentence() {
    const passage = state.currentPassage;
    if (!passage) return;

    const idx = state.sentenceIndex;
    const sentence = passage.sentences[idx];

    // Update counter
    $("read-counter").textContent = `${idx + 1} / ${passage.sentences.length}`;

    // Highlight current sentence in passage
    document.querySelectorAll(".passage-sentence").forEach((el, i) => {
        el.classList.remove("active");
        if (i === idx) {
            el.classList.add("active");
            // Scroll into view if needed
            el.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
    });

    // Show focused sentence as word-level spans for live highlighting
    const sentenceEl = $("read-current-sentence");
    sentenceEl.innerHTML = "";
    const sentenceWords = sentence.split(/\s+/);
    sentenceWords.forEach((word, wi) => {
        const span = document.createElement("span");
        span.className = "read-live-word";
        span.dataset.wordIndex = wi;
        const isBionic = _loadDisplaySettings().bionic;
        if (isBionic) {
            span.innerHTML = bionicTransform(word);
        } else {
            span.textContent = word;
        }
        sentenceEl.appendChild(span);
        if (wi < sentenceWords.length - 1) {
            sentenceEl.appendChild(document.createTextNode(" "));
        }
    });

    // Reset UI
    $("read-word-feedback").classList.add("hidden");
    $("read-word-feedback").innerHTML = "";
    $("read-actions").classList.add("hidden");
    $("read-ai-feedback").classList.add("hidden");
    $("read-transcript").classList.add("hidden");
    $("read-transcript-text").textContent = "";
    $("read-manual").classList.add("hidden");
    $("btn-read-mic").classList.remove("listening");
    $("btn-read-done").classList.add("hidden");
    $("mic-label").textContent = "Your Turn \u2014 Tap to Read";
    $("btn-read-mic").disabled = false;

    // Start timer on first sentence
    if (idx === 0 && !state.readingStartTime) {
        state.readingStartTime = Date.now();
    }

    // If listen-first, read the sentence aloud first, then enable mic
    if (state.listenFirst) {
        $("btn-read-mic").disabled = true;
        $("mic-label").textContent = "Listen first...";
        $("btn-read-listen").disabled = true;

        // Use _utter so we know when TTS finishes
        (async () => {
            try {
                await _utter(sentence, { rate: 0.85, pitch: 0.97, pause: 0 });
            } catch {}
            // TTS done — enable mic
            $("btn-read-mic").disabled = false;
            $("btn-read-listen").disabled = false;
            $("mic-label").textContent = "Your Turn \u2014 Tap to Read";
        })();
    }
}

// ===== Speech Recognition Engine =====
let _currentRecognition = null;

function hasSpeechRecognition() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
}

function startRecognition() {
    // Cancel any ongoing TTS so mic can hear clearly
    _stopCloudAudio();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();

    if (!hasSpeechRecognition()) {
        showManualInput();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;      // Keep listening through pauses
    recognition.interimResults = true;  // Real-time feedback
    recognition.maxAlternatives = 3;

    _currentRecognition = recognition;
    state.recognitionActive = true;

    // UI: listening state
    $("btn-read-mic").classList.add("listening");
    $("mic-label").textContent = "Listening... take your time";
    $("btn-read-mic").disabled = false;
    $("read-transcript").classList.remove("hidden");
    $("read-transcript-text").textContent = "";
    $("read-transcript-text").className = "read-transcript-text";

    // Show the "I'm Done" button so Colton can stop when ready
    $("btn-read-done").classList.remove("hidden");

    let finalTranscript = "";
    let hasGottenResults = false;
    let settled = false; // prevent double-processing
    let silenceTimer = null;

    function settle() {
        if (settled) return;
        settled = true;
        clearTimeout(safetyTimeout);
        clearTimeout(silenceTimer);
        state.recognitionActive = false;
        _currentRecognition = null;
        $("btn-read-mic").classList.remove("listening");
        $("btn-read-mic").disabled = false;
        $("btn-read-done").classList.add("hidden");
    }

    // Reset silence timer — auto-submit after 4 seconds of no new speech
    function resetSilenceTimer() {
        clearTimeout(silenceTimer);
        silenceTimer = setTimeout(() => {
            if (!settled && finalTranscript.trim()) {
                // Got speech but 4s of silence — they're probably done
                try { recognition.stop(); } catch {}
            }
        }, 4000);
    }

    // Safety timeout: absolute max of 60s for continuous mode
    const safetyTimeout = setTimeout(() => {
        if (!settled) {
            try { recognition.abort(); } catch {}
            settle();
            if (finalTranscript.trim()) {
                processSentenceResult(finalTranscript.trim());
            } else {
                $("mic-label").textContent = "Took too long \u2014 tap to try again";
            }
        }
    }, 60000);

    recognition.onresult = (event) => {
        hasGottenResults = true;
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                finalTranscript += text;
            } else {
                interim += text;
            }
        }
        // Show real-time transcript
        const currentText = finalTranscript || interim;
        $("read-transcript-text").textContent = currentText;
        if (finalTranscript) {
            $("read-transcript-text").className = "read-transcript-text final";
        }

        // Live word-by-word highlighting
        _highlightSpokenWords(currentText);

        // Reset the silence auto-submit timer on every result
        resetSilenceTimer();
    };

    recognition.onend = () => {
        // In continuous mode, the browser can randomly stop recognition.
        // If we haven't settled yet and have no transcript, restart silently.
        if (!settled && !finalTranscript.trim() && !hasGottenResults) {
            // Restart recognition — it ended before getting anything
            try {
                recognition.start();
                return;
            } catch {
                // Can't restart — fall through to settle
            }
        }
        settle();
        if (finalTranscript.trim()) {
            processSentenceResult(finalTranscript.trim());
        } else if (!hasGottenResults) {
            $("mic-label").textContent = "Didn't catch that \u2014 tap to try again";
        }
    };

    recognition.onerror = (event) => {
        if (event.error === "no-speech") {
            // In continuous mode, no-speech can fire but recognition continues.
            // Only show message if we also haven't gotten any results yet.
            if (!hasGottenResults && !finalTranscript.trim()) {
                $("mic-label").textContent = "No sound heard \u2014 try reading a bit louder";
            }
            // Don't settle — let it keep listening
            return;
        }
        settle();
        if (event.error === "not-allowed" || event.error === "audio-capture") {
            $("mic-label").textContent = "Microphone blocked \u2014 check browser settings";
            showManualInput();
        } else if (event.error === "aborted") {
            // User or safety timeout aborted — do nothing extra
        } else {
            $("mic-label").textContent = "Something went wrong \u2014 tap to try again";
        }
    };

    try {
        recognition.start();
    } catch (e) {
        // start() can throw if recognition is already running
        settle();
        $("mic-label").textContent = "Couldn't start mic \u2014 tap to try again";
    }
}

function stopRecognition() {
    if (_currentRecognition) {
        try { _currentRecognition.stop(); } catch {}
    }
}

function showManualInput() {
    $("read-manual").classList.remove("hidden");
    $("read-manual-input").value = "";
    $("read-manual-input").focus();
    $("mic-label").textContent = "Type what you read instead";
}

// ===== Word Comparison Engine =====

function levenshtein(a, b) {
    const m = a.length, n = b.length;
    const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            dp[i][j] = a[i - 1] === b[j - 1]
                ? dp[i - 1][j - 1]
                : 1 + Math.min(dp[i - 1][j - 1], dp[i - 1][j], dp[i][j - 1]);
        }
    }
    return dp[m][n];
}

function normalizeText(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, " ").trim();
}

function compareWords(expectedSentence, spokenSentence) {
    const expected = normalizeText(expectedSentence).split(" ");
    const spoken = normalizeText(spokenSentence).split(" ");
    const results = [];

    // Build a pool of spoken words for matching
    const spokenUsed = new Array(spoken.length).fill(false);

    for (let i = 0; i < expected.length; i++) {
        const expWord = expected[i];
        let bestMatch = null;
        let bestDist = Infinity;
        let bestIdx = -1;

        // Look for best matching spoken word (in order, prefer nearby positions)
        for (let j = 0; j < spoken.length; j++) {
            if (spokenUsed[j]) continue;
            const dist = levenshtein(expWord, spoken[j]);
            // Prefer closer position matches (weight position slightly)
            const positionPenalty = Math.abs(i - j) * 0.1;
            const score = dist + positionPenalty;
            if (score < bestDist) {
                bestDist = score;
                bestMatch = spoken[j];
                bestIdx = j;
            }
        }

        // Threshold: word length-dependent
        // Short words (1-3 letters): must be exact or dist 1
        // Medium words (4-6): dist <= 2
        // Long words (7+): dist <= 3
        let threshold;
        if (expWord.length <= 3) threshold = 1;
        else if (expWord.length <= 6) threshold = 2;
        else threshold = 3;

        const dist = bestMatch ? levenshtein(expWord, bestMatch) : Infinity;
        const correct = dist <= threshold;

        if (correct && bestIdx !== -1) {
            spokenUsed[bestIdx] = true;
        }

        results.push({
            word: expected[i], // Keep original casing from expected
            correct,
            spokenAs: bestMatch || "(skipped)",
            distance: dist,
        });
    }

    return results;
}

// ===== Process Sentence Result =====

// Live highlight words in the current sentence as speech recognition returns results
function _highlightSpokenWords(spokenText) {
    if (!spokenText) return;
    const wordSpans = document.querySelectorAll(".read-live-word");
    if (wordSpans.length === 0) return;

    const expectedSentence = state.currentPassage?.sentences[state.sentenceIndex] || "";
    const expectedWords = expectedSentence.split(/\s+/).map(w => w.replace(/[^a-zA-Z']/g, "").toLowerCase());
    const spokenWords = spokenText.trim().split(/\s+/).map(w => w.replace(/[^a-zA-Z']/g, "").toLowerCase());

    // Match spoken words to expected words sequentially
    let spokenIdx = 0;
    wordSpans.forEach((span, i) => {
        span.classList.remove("word-heard", "word-matched", "word-current");
        if (spokenIdx < spokenWords.length && i <= spokenIdx + 1) {
            // Check if this expected word matches the spoken word (fuzzy)
            const exp = expectedWords[i] || "";
            const spk = spokenWords[spokenIdx] || "";
            if (exp && spk) {
                const dist = _quickDistance(exp, spk);
                if (dist <= Math.max(1, Math.floor(exp.length * 0.3))) {
                    span.classList.add("word-matched");
                    spokenIdx++;
                } else if (spokenIdx > 0 && i < spokenIdx) {
                    // Already passed this word
                    span.classList.add("word-heard");
                }
            }
        }
    });

    // Mark the next unmatched word as "current" (where Colton should be reading)
    const nextUnmatched = document.querySelector(".read-live-word:not(.word-matched):not(.word-heard)");
    if (nextUnmatched) nextUnmatched.classList.add("word-current");
}

// Quick Levenshtein distance for word matching
function _quickDistance(a, b) {
    if (a === b) return 0;
    const la = a.length, lb = b.length;
    if (la === 0) return lb;
    if (lb === 0) return la;
    let prev = Array.from({ length: lb + 1 }, (_, i) => i);
    for (let i = 1; i <= la; i++) {
        const curr = [i];
        for (let j = 1; j <= lb; j++) {
            curr[j] = Math.min(
                prev[j] + 1,
                curr[j - 1] + 1,
                prev[j - 1] + (a[i - 1] !== b[j - 1] ? 1 : 0)
            );
        }
        prev = curr;
    }
    return prev[lb];
}

function processSentenceResult(spokenText) {
    const passage = state.currentPassage;
    const expectedSentence = passage.sentences[state.sentenceIndex];

    const wordResults = compareWords(expectedSentence, spokenText);

    // Show word-by-word feedback
    showSentenceWordFeedback(wordResults);

    // Collect results
    wordResults.forEach(r => {
        state.readingResults.push(r);
        if (!r.correct) {
            // Add to struggled if not already there
            if (!state.readingStruggledWords.find(w => w.word.toLowerCase() === r.word.toLowerCase())) {
                state.readingStruggledWords.push({ word: r.word, spokenAs: r.spokenAs });
            }
        }
    });

    // Show next/actions
    $("read-actions").classList.remove("hidden");

    // Play a sound
    const correctCount = wordResults.filter(r => r.correct).length;
    const pct = wordResults.length > 0 ? correctCount / wordResults.length : 0;
    if (pct >= 0.8) {
        Sound.correct();
    } else {
        Sound.incorrect();
    }

    // Update sentence highlight in passage
    const sentenceEl = document.querySelector(`.passage-sentence[data-index="${state.sentenceIndex}"]`);
    if (sentenceEl) {
        sentenceEl.classList.remove("active");
        sentenceEl.classList.add(pct >= 0.8 ? "completed-good" : "completed");
    }
}

function showSentenceWordFeedback(wordResults) {
    const container = $("read-word-feedback");
    container.classList.remove("hidden");
    container.innerHTML = "";

    wordResults.forEach(r => {
        const span = document.createElement("span");
        span.className = `read-word ${r.correct ? "correct" : "struggled"}`;
        span.textContent = r.word;
        if (!r.correct) {
            span.title = `Heard: "${r.spokenAs}"`;
        }
        container.appendChild(span);
    });
}

function advanceSentence() {
    state.sentenceIndex++;

    if (state.sentenceIndex >= state.currentPassage.sentences.length) {
        // Done — show results
        showReadingResults();
    } else {
        loadSentence();
    }
}

function skipSentence() {
    // Mark all words in this sentence as skipped
    const sentence = state.currentPassage.sentences[state.sentenceIndex];
    const words = normalizeText(sentence).split(" ");
    words.forEach(word => {
        state.readingResults.push({ word, correct: false, spokenAs: "(skipped)", distance: Infinity });
        if (!state.readingStruggledWords.find(w => w.word.toLowerCase() === word.toLowerCase())) {
            state.readingStruggledWords.push({ word, spokenAs: "(skipped)" });
        }
    });

    // Mark in passage display
    const sentenceEl = document.querySelector(`.passage-sentence[data-index="${state.sentenceIndex}"]`);
    if (sentenceEl) {
        sentenceEl.classList.remove("active");
        sentenceEl.classList.add("completed");
    }

    advanceSentence();
}

// ===== Reading Results Screen =====

function showReadingResults() {
    showScreen("readResult");

    const totalWords = state.readingResults.length;
    const correctWords = state.readingResults.filter(r => r.correct).length;
    const pct = totalWords > 0 ? Math.round((correctWords / totalWords) * 100) : 0;

    // Calculate WPM
    const elapsedMs = Date.now() - (state.readingStartTime || Date.now());
    const elapsedMin = elapsedMs / 60000;
    const wpm = elapsedMin > 0 ? Math.round(correctWords / elapsedMin) : 0;

    // Title
    let title = "Nice reading session!";
    if (pct === 100) title = "Perfect read \u2014 you nailed every word!";
    else if (pct >= 80) title = "Really strong reading!";
    else if (pct >= 50) title = "Good effort \u2014 you're building your reading muscles!";
    else title = "Brave work reading aloud. That takes guts.";

    $("read-result-title").textContent = title;

    $("read-result-stats").innerHTML = `
        <div class="result-stat">
            <span class="result-stat-value">${correctWords}</span>
            <span class="result-stat-label">Words Right</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${totalWords}</span>
            <span class="result-stat-label">Total Words</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${pct}%</span>
            <span class="result-stat-label">Accuracy</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${wpm}</span>
            <span class="result-stat-label">WPM</span>
        </div>
    `;

    // Struggled words
    const struggledContainer = $("read-struggled");
    const struggledWordsEl = $("read-struggled-words");
    if (state.readingStruggledWords.length > 0) {
        struggledContainer.classList.remove("hidden");
        struggledWordsEl.innerHTML = "";
        state.readingStruggledWords.forEach(w => {
            const chip = document.createElement("span");
            chip.className = "word-chip";
            chip.textContent = w.word;
            chip.title = `Heard: "${w.spokenAs}"`;
            struggledWordsEl.appendChild(chip);
        });
        if ($("btn-read-review")) $("btn-read-review").classList.remove("hidden");
    } else {
        struggledContainer.classList.add("hidden");
        if ($("btn-read-review")) $("btn-read-review").classList.add("hidden");
    }

    // Show/hide comprehension check button
    const compBtn = $("btn-comprehension-check");
    if (compBtn) {
        if (state.currentPassage && state.currentPassage.questions && state.currentPassage.questions.length > 0) {
            compBtn.classList.remove("hidden");
        } else {
            compBtn.classList.add("hidden");
        }
    }

    // Save reading stats
    SRS.saveReadingSession(state.currentPassage.id, {
        correct: correctWords,
        total: totalWords,
        wpm,
        struggled: state.readingStruggledWords.map(w => w.word),
    });

    // Feed struggled words into SRS for spelling review
    state.readingStruggledWords.forEach(sw => {
        // Try to find this word in any WORD_LISTS category
        let found = false;
        for (const [catName, catData] of Object.entries(WORD_LISTS)) {
            const wordObj = catData.words.find(w => w.word.toLowerCase() === sw.word.toLowerCase());
            if (wordObj) {
                SRS.recordResult(catName, wordObj, false, 3);
                found = true;
                break;
            }
        }
        // If not in any word list, record under "Trouble Words" so it still gets tracked
        if (!found) {
            SRS.recordResult("Trouble Words", {
                word: sw.word,
                hint: "A word from reading practice",
                syllables: [sw.word],
            }, false, 3);
        }
    });

    // Show "Practice These Words" button if there are struggled words
    const practiceBtn = $("btn-read-practice-words");
    if (practiceBtn) {
        if (state.readingStruggledWords.length >= 2) {
            practiceBtn.classList.remove("hidden");
            practiceBtn.onclick = () => {
                // Build practice set from struggled words
                const words = state.readingStruggledWords.map(sw => {
                    return SRS._findWordInAnyCategory(sw.word.toLowerCase());
                }).filter(w => w);
                if (words.length > 0) {
                    state.isReviewMode = false;
                    state.currentCategory = "Trouble Words";
                    state.words = shuffle(words);
                    state.wordIndex = 0;
                    state.wordsCorrect = 0;
                    state.wordsAttempted = 0;
                    state.wordResults = [];
                    showScreen("game");
                    $("category-label").textContent = "🎯 Practice Struggled Words";
                    loadWord();
                }
            };
        } else {
            practiceBtn.classList.add("hidden");
        }
    }

    // Book-aware button labels
    const category = PASSAGE_LISTS[state.currentCategory];
    const btnAgain = $("btn-read-again");
    if (category && category.book) {
        const nextIdx = (state.passageIndex || 0) + 1;
        if (nextIdx < category.passages.length) {
            btnAgain.textContent = `Next Chapter \u2192`;
            btnAgain.classList.remove("hidden");
        } else {
            // Last chapter — they finished the whole book!
            btnAgain.classList.add("hidden");
            title = pct >= 80
                ? "You finished the whole book! Incredible!"
                : "You finished the whole book! That's a huge deal.";
            $("read-result-title").textContent = title;
        }
    } else {
        btnAgain.textContent = "Read Another";
        btnAgain.classList.remove("hidden");
    }

    // AI Reading Feedback
    $("read-ai-insight").classList.add("hidden");
    showReadingAiFeedback(wpm, correctWords, totalWords);
}

async function showReadingAiFeedback(wpm, correctWords, totalWords) {
    if (!AI.hasApiKey()) return;

    const container = $("read-ai-insight");
    const textEl = $("read-ai-insight-text");
    container.classList.remove("hidden");
    container.classList.add("loading");

    const feedback = await AI.getReadingFeedback(
        state.readingStruggledWords,
        state.currentPassage.title,
        correctWords,
        totalWords,
        wpm
    );

    container.classList.remove("loading");
    if (feedback) {
        textEl.textContent = feedback;
        speakNatural(feedback);
    } else {
        container.classList.add("hidden");
    }
}

// ===== Practice Struggled Words =====
// ================================================================
//  WORD REVIEW (walk through missed words after reading)
// ================================================================
function startWordReview() {
    if (state.readingStruggledWords.length === 0) return;

    // Build review word objects with full data
    const reviewWords = state.readingStruggledWords.map(sw => {
        // Look up full word data in WORD_LISTS
        let wordObj = null;
        for (const [catName, catData] of Object.entries(WORD_LISTS)) {
            wordObj = catData.words.find(w => w.word.toLowerCase() === sw.word.toLowerCase());
            if (wordObj) break;
        }
        return {
            word: sw.word,
            spokenAs: sw.spokenAs,
            hint: wordObj?.hint || "",
            syllables: wordObj?.syllables || [sw.word],
            sentence: wordObj?.sentence || "",
        };
    });

    state.wordReview = { words: reviewWords, index: 0 };
    showScreen("wordReview");
    loadReviewWord();
}

function loadReviewWord() {
    const review = state.wordReview;
    if (!review) return;
    const w = review.words[review.index];
    const total = review.words.length;

    $("review-counter").textContent = `${review.index + 1} / ${total}`;

    // Word display
    $("review-word-display").textContent = w.word;

    // What was heard
    if (w.spokenAs && w.spokenAs !== "(skipped)" && w.spokenAs.toLowerCase() !== w.word.toLowerCase()) {
        $("review-what-heard").textContent = `You said: "${w.spokenAs}"`;
        $("review-what-heard").classList.remove("hidden");
    } else if (w.spokenAs === "(skipped)") {
        $("review-what-heard").textContent = "This word was skipped";
        $("review-what-heard").classList.remove("hidden");
    } else {
        $("review-what-heard").classList.add("hidden");
    }

    // Syllables
    if (w.syllables && w.syllables.length > 1) {
        $("review-syllables").innerHTML = w.syllables
            .map(s => `<span class="review-syllable-chip">${s}</span>`)
            .join(`<span class="review-syllable-dot">·</span>`);
        $("review-syllables").classList.remove("hidden");
    } else {
        $("review-syllables").classList.add("hidden");
    }

    // Hint
    if (w.hint) {
        $("review-hint").textContent = w.hint;
        $("review-hint").classList.remove("hidden");
    } else {
        $("review-hint").classList.add("hidden");
    }

    // Sentence
    if (w.sentence) {
        $("review-sentence").textContent = `"${w.sentence}"`;
        $("review-sentence").classList.remove("hidden");
    } else {
        $("review-sentence").classList.add("hidden");
    }

    // Nav buttons
    $("btn-review-prev").classList.toggle("hidden", review.index === 0);
    const isLast = review.index === total - 1;
    $("btn-review-next").textContent = isLast ? "Done — Practice These Words" : "Next Word →";

    // Auto-read: say the word, pause, then spell it out
    setTimeout(() => {
        speakWordAndSpell(w.word);
    }, 400);
}

// Word review event listeners (null-safe for cached HTML)
if ($("btn-read-review")) $("btn-read-review").addEventListener("click", startWordReview);

if ($("btn-review-hear")) $("btn-review-hear").addEventListener("click", () => {
    const w = state.wordReview?.words[state.wordReview.index];
    if (w) speak(w.word);
});

if ($("btn-review-spell")) $("btn-review-spell").addEventListener("click", () => {
    const w = state.wordReview?.words[state.wordReview.index];
    if (w) speakWordAndSpell(w.word);
});

if ($("btn-review-sentence")) $("btn-review-sentence").addEventListener("click", () => {
    const w = state.wordReview?.words[state.wordReview.index];
    if (w?.sentence) speakNatural(w.sentence);
});

if ($("btn-review-next")) $("btn-review-next").addEventListener("click", () => {
    const review = state.wordReview;
    if (!review) return;
    if (review.index < review.words.length - 1) {
        review.index++;
        loadReviewWord();
    } else {
        // Done reviewing — go to practice
        state.wordReview = null;
        practiceStruggledWords();
    }
});

if ($("btn-review-prev")) $("btn-review-prev").addEventListener("click", () => {
    const review = state.wordReview;
    if (!review || review.index <= 0) return;
    review.index--;
    loadReviewWord();
});

if ($("btn-review-back")) $("btn-review-back").addEventListener("click", () => {
    state.wordReview = null;
    showReadingResults();
});

function practiceStruggledWords() {
    if (state.readingStruggledWords.length === 0) return;

    // Build word objects for spelling practice
    const practiceWords = [];
    state.readingStruggledWords.forEach(sw => {
        // Look up in WORD_LISTS for full word data
        for (const [catName, catData] of Object.entries(WORD_LISTS)) {
            const wordObj = catData.words.find(w => w.word.toLowerCase() === sw.word.toLowerCase());
            if (wordObj) {
                practiceWords.push(wordObj);
                break;
            }
        }
        // If not found in word lists, create a basic word object
        if (!practiceWords.find(w => w.word.toLowerCase() === sw.word.toLowerCase())) {
            practiceWords.push({
                word: sw.word,
                hint: `A word from your reading practice`,
                syllables: [sw.word],
                sentence: `You read this word in "${state.currentPassage.title}".`,
            });
        }
    });

    if (practiceWords.length === 0) return;

    // Switch to Spell It mode with these words
    state.mode = "spell";
    state.isReviewMode = false;
    state.currentCategory = "Reading Practice";
    state.words = shuffle([...practiceWords]);
    state.wordIndex = 0;
    state.wordsCorrect = 0;
    state.wordsAttempted = 0;
    state.wordResults = [];

    showScreen("game");
    $("category-label").textContent = "\u{1f4d6} Reading Practice";
    loadWord();
}

// ===== Reading Mode Event Listeners =====

$("btn-read-back").addEventListener("click", () => {
    stopRecognition();
    cancelJustListen();
    _stopCloudAudio();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    goHome();
});

$("btn-read-listen").addEventListener("click", () => {
    if (!state.currentPassage) return;
    const sentence = state.currentPassage.sentences[state.sentenceIndex];
    speak(sentence, 0.85);
});

$("btn-read-mic").addEventListener("click", () => {
    if (state.recognitionActive) {
        stopRecognition();
    } else {
        startRecognition();
    }
});

$("btn-read-done").addEventListener("click", () => {
    // Colton taps "I'm Done" — stop recognition and process what we got
    stopRecognition();
});

$("btn-read-next").addEventListener("click", () => {
    advanceSentence();
});

$("btn-read-skip").addEventListener("click", () => {
    skipSentence();
});

$("btn-read-again").addEventListener("click", () => {
    const category = PASSAGE_LISTS[state.currentCategory];
    if (category && category.book) {
        // Next chapter in sequence
        startReading(state.currentCategory, (state.passageIndex || 0) + 1);
    } else {
        // Random passage for non-book categories
        startReading(state.currentCategory);
    }
});

$("btn-read-categories").addEventListener("click", () => {
    goHome();
});

$("read-listen-first").addEventListener("change", (e) => {
    state.listenFirst = e.target.checked;
});

// Manual fallback: check button
$("btn-read-manual-check").addEventListener("click", () => {
    const input = $("read-manual-input").value.trim();
    if (input) {
        processSentenceResult(input);
        $("read-manual").classList.add("hidden");
    }
});

// Manual fallback: Enter key
$("read-manual-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
        e.preventDefault();
        $("btn-read-manual-check").click();
    }
});

// ================================================================
//  READING SUB-MODE SWITCHING (Read & Listen vs Just Listen)
// ================================================================

function switchReadSubMode(mode) {
    state.readSubMode = mode;

    // Update buttons
    document.querySelectorAll(".read-submode-btn").forEach(btn => {
        btn.classList.toggle("active", btn.dataset.submode === mode);
    });

    if (mode === "read-listen") {
        // Show Read & Listen elements
        $("read-listen-first-container").classList.remove("hidden");
        $("passage-container").classList.remove("hidden");
        $("read-sentence-focus").classList.remove("hidden");
        $("read-controls").classList.remove("hidden");
        // Hide Just Listen elements
        $("just-listen-container").classList.add("hidden");
        $("just-listen-controls").classList.add("hidden");
        // Cancel any ongoing Just Listen TTS
        cancelJustListen();
    } else if (mode === "just-listen") {
        // Hide Read & Listen elements
        $("read-listen-first-container").classList.add("hidden");
        $("passage-container").classList.add("hidden");
        $("read-sentence-focus").classList.add("hidden");
        $("read-controls").classList.add("hidden");
        $("read-transcript").classList.add("hidden");
        $("read-word-feedback").classList.add("hidden");
        $("read-actions").classList.add("hidden");
        $("read-ai-feedback").classList.add("hidden");
        $("read-manual").classList.add("hidden");
        // Stop any speech recognition
        stopRecognition();
        // Show Just Listen elements
        $("just-listen-container").classList.remove("hidden");
        $("just-listen-controls").classList.remove("hidden");
        // Prepare Just Listen view
        setupJustListen();
    }
}

document.querySelectorAll(".read-submode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        switchReadSubMode(btn.dataset.submode);
    });
});

// ================================================================
//  JUST LISTEN MODE — Continuous TTS with word highlighting
// ================================================================

function setupJustListen() {
    const passage = state.currentPassage;
    if (!passage) return;

    state.justListenStartIdx = 0;

    $("just-listen-title").textContent = passage.title;
    $("btn-just-listen-play").textContent = "▶ Start Listening";
    $("btn-just-listen-play").disabled = false;
    $("just-listen-progress-bar").style.width = "0%";

    // Build word-level spans grouped by sentence for the full passage
    const container = $("just-listen-text");
    container.innerHTML = "";

    passage.sentences.forEach((sentence, sIdx) => {
        // Wrap each sentence in a clickable group
        const sentenceGroup = document.createElement("span");
        sentenceGroup.className = "just-listen-sentence-group";
        sentenceGroup.dataset.sentence = sIdx;
        sentenceGroup.title = "Tap to start listening from here";

        // Click to set starting point
        sentenceGroup.addEventListener("click", () => {
            if (state.justListenActive) return; // don't change while playing
            state.justListenStartIdx = sIdx;
            updateJustListenStartMarker();
        });

        const words = sentence.split(/\s+/);
        words.forEach((word, wIdx) => {
            const span = document.createElement("span");
            span.className = "just-listen-word";
            span.dataset.sentence = sIdx;
            span.dataset.word = wIdx;
            span.textContent = word;
            sentenceGroup.appendChild(span);
            // Add space between words
            if (wIdx < words.length - 1) {
                sentenceGroup.appendChild(document.createTextNode(" "));
            }
        });

        container.appendChild(sentenceGroup);

        // Add sentence break
        if (sIdx < passage.sentences.length - 1) {
            const br = document.createElement("span");
            br.className = "just-listen-sentence-break";
            br.textContent = " ";
            container.appendChild(br);
        }
    });

    // Show start hint
    $("just-listen-start-hint").classList.remove("hidden");
    updateJustListenStartMarker();
}

function updateJustListenStartMarker() {
    // Remove previous markers
    document.querySelectorAll(".just-listen-sentence-group").forEach(el => {
        el.classList.remove("start-here");
    });
    // Add marker to selected sentence
    const target = document.querySelector(`.just-listen-sentence-group[data-sentence="${state.justListenStartIdx}"]`);
    if (target) target.classList.add("start-here");

    // Update button text
    if (state.justListenStartIdx > 0) {
        $("btn-just-listen-play").textContent = `▶ Start from Sentence ${state.justListenStartIdx + 1}`;
    } else {
        $("btn-just-listen-play").textContent = "▶ Start Listening";
    }
}

function cancelJustListen() {
    state.justListenActive = false;
    if (state.justListenCancel) {
        state.justListenCancel();
        state.justListenCancel = null;
    }
    _stopCloudAudio();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

async function startJustListen() {
    const passage = state.currentPassage;
    if (!passage) return;

    const startFrom = state.justListenStartIdx || 0;

    state.justListenActive = true;
    $("btn-just-listen-play").textContent = "⏹ Stop";
    $("just-listen-start-hint").classList.add("hidden");

    // Mark sentences before startFrom as already spoken
    for (let i = 0; i < startFrom; i++) {
        document.querySelectorAll(`.just-listen-word[data-sentence="${i}"]`).forEach(el => {
            el.classList.add("word-spoken");
        });
    }

    let cancelled = false;
    state.justListenCancel = () => { cancelled = true; };

    const totalSentences = passage.sentences.length;

    for (let sIdx = startFrom; sIdx < totalSentences; sIdx++) {
        if (cancelled) break;

        const sentence = passage.sentences[sIdx];
        const words = sentence.split(/\s+/);

        // Highlight all words in this sentence as "current sentence"
        document.querySelectorAll(`.just-listen-word[data-sentence="${sIdx}"]`).forEach(el => {
            el.classList.add("word-current-sentence");
        });

        // Scroll current sentence into view
        const firstWord = document.querySelector(`.just-listen-word[data-sentence="${sIdx}"][data-word="0"]`);
        if (firstWord) firstWord.scrollIntoView({ behavior: "smooth", block: "center" });

        // Read sentence with word-level boundary highlighting
        let wordIndex = 0;
        await _utterWithBoundary(sentence, {
            rate: 0.85,
            pitch: 0.97,
            pause: 400,
            onWord: (charIndex) => {
                if (cancelled) return;
                if (charIndex === -1) {
                    // Boundary events not supported — highlight all words at once
                    document.querySelectorAll(`.just-listen-word[data-sentence="${sIdx}"]`).forEach(el => {
                        el.classList.add("word-spoken");
                    });
                    return;
                }
                // Find which word this charIndex corresponds to
                let charCount = 0;
                for (let w = 0; w < words.length; w++) {
                    if (charIndex >= charCount && charIndex < charCount + words[w].length) {
                        // Remove previous active
                        document.querySelectorAll(".just-listen-word.word-active").forEach(el => {
                            el.classList.remove("word-active");
                            el.classList.add("word-spoken");
                        });
                        // Highlight current word
                        const el = document.querySelector(`.just-listen-word[data-sentence="${sIdx}"][data-word="${w}"]`);
                        if (el) el.classList.add("word-active");
                        break;
                    }
                    charCount += words[w].length + 1; // +1 for space
                }
            }
        });

        if (cancelled) break;

        // Mark remaining words as spoken
        document.querySelectorAll(`.just-listen-word[data-sentence="${sIdx}"]`).forEach(el => {
            el.classList.remove("word-active", "word-current-sentence");
            el.classList.add("word-spoken");
        });

        // Update progress bar
        $("just-listen-progress-bar").style.width = `${((sIdx + 1) / totalSentences) * 100}%`;
    }

    // Done
    state.justListenActive = false;
    state.justListenCancel = null;
    $("btn-just-listen-play").textContent = "▶ Listen Again";
    $("btn-just-listen-play").disabled = false;
    $("just-listen-start-hint").classList.remove("hidden");

    // Save a listening session
    if (!cancelled) {
        SRS.saveListeningSession(passage.id, {
            sentences: totalSentences,
            wordCount: passage.sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0),
        });
    }
}

$("btn-just-listen-play").addEventListener("click", () => {
    if (state.justListenActive) {
        // Stop
        cancelJustListen();
        // Reset word highlighting
        document.querySelectorAll(".just-listen-word").forEach(el => {
            el.classList.remove("word-active", "word-spoken", "word-current-sentence");
        });
        $("just-listen-progress-bar").style.width = "0%";
        $("just-listen-start-hint").classList.remove("hidden");
        updateJustListenStartMarker();
    } else {
        // Reset word highlighting before starting
        document.querySelectorAll(".just-listen-word").forEach(el => {
            el.classList.remove("word-active", "word-spoken", "word-current-sentence");
        });
        startJustListen();
    }
});

// ================================================================
//  GUIDED LEARNING PATH
// ================================================================
function startGuidedFlashcards() {
    const gp = state.guidedPath;
    if (!gp) return;
    state.mode = "flash";
    state.isReviewMode = false;
    state.currentCategory = gp.category;
    state.words = shuffle([...gp.words]);
    state.wordIndex = 0;
    state.wordsCorrect = 0;
    state.wordsAttempted = 0;
    state.wordResults = [];
    showScreen("flash");
    $("flash-category-label").textContent = `🦷 ${gp.category}`;
    loadFlashcard();
}

function startGuidedScramble() {
    const gp = state.guidedPath;
    if (!gp) return;
    state.mode = "scramble";
    state.isReviewMode = false;
    state.currentCategory = gp.category;
    state.words = shuffle([...gp.words]);
    state.wordIndex = 0;
    state.wordsCorrect = 0;
    state.wordsAttempted = 0;
    state.wordResults = [];
    showScreen("scramble");
    $("scramble-category-label").textContent = `🦷 ${gp.category}`;
    loadScrambleWord();
}

function startGuidedSpellingBee() {
    const gp = state.guidedPath;
    if (!gp) return;
    state.guidedPath.step = "spellingbee";
    state.spellingBee = {
        words: shuffle([...gp.words]),
        index: 0,
        correct: 0,
        total: gp.words.length,
        results: [],
    };
    showScreen("spellingbee");
    $("bee-title").textContent = "🐝 Spelling Bee";
    $("bee-feedback").classList.add("hidden");
    loadSpellingBeeWord();
}

// ================================================================
//  SPELLING BEE MODE
// ================================================================
function loadSpellingBeeWord() {
    const bee = state.spellingBee;
    if (!bee || bee.index >= bee.total) {
        showSpellingBeeResults();
        return;
    }
    const wordData = bee.words[bee.index];
    $("bee-counter").textContent = `${bee.index + 1} / ${bee.total}`;
    $("bee-feedback").classList.add("hidden");
    $("bee-input").value = "";
    $("bee-input").disabled = false;
    $("btn-bee-submit").disabled = false;

    // Build announcer display
    $("bee-prompt").textContent = `Your word is:`;
    $("bee-definition").textContent = wordData.hint || "";
    $("bee-sentence").textContent = wordData.sentence ? `"${wordData.sentence}"` : "";

    // TTS: "Your word is [word]. [hint]. [sentence]. Again, your word is [word]."
    const parts = [`Your word is: ${wordData.word}.`];
    if (wordData.hint) parts.push(wordData.hint + ".");
    if (wordData.sentence) parts.push(wordData.sentence);
    parts.push(`Again, your word is: ${wordData.word}.`);
    setTimeout(() => speakNatural(parts.join(" ")), 300);

    // Focus input
    setTimeout(() => $("bee-input").focus(), 600);
}

function checkSpellingBeeAnswer() {
    const bee = state.spellingBee;
    if (!bee) return;
    const wordData = bee.words[bee.index];
    const userAnswer = $("bee-input").value.trim().toLowerCase();
    if (!userAnswer) return;

    $("bee-input").disabled = true;
    $("btn-bee-submit").disabled = true;

    const correct = userAnswer === wordData.word.toLowerCase();
    const feedbackEl = $("bee-feedback");
    feedbackEl.classList.remove("hidden");

    if (correct) {
        bee.correct++;
        feedbackEl.className = "bee-feedback bee-correct";
        feedbackEl.innerHTML = `<span class="bee-feedback-icon">✅</span> Correct! That is correct.`;
        Sound.correct();
        speakNatural("Correct! That is correct.");
    } else {
        feedbackEl.className = "bee-feedback bee-incorrect";
        const spelled = wordData.word.split("").join(" – ");
        feedbackEl.innerHTML = `
            <span class="bee-feedback-icon">❌</span>
            That is incorrect.<br>
            The correct spelling is: <strong>${wordData.word}</strong><br>
            <span class="bee-spelled-out">${spelled}</span>
        `;
        Sound.wrong();
        // Speak: "That is incorrect. The correct spelling is [word]: [letters]"
        const letters = wordData.word.split("").join(", ");
        speakNatural(`That is incorrect. The correct spelling is: ${wordData.word}. ${letters}.`);
    }

    bee.results.push({ word: wordData.word, userAnswer, correct });

    // Auto-advance after delay
    setTimeout(() => {
        bee.index++;
        loadSpellingBeeWord();
    }, correct ? 2000 : 3500);
}

function showSpellingBeeResults() {
    const bee = state.spellingBee;
    if (!bee) return;

    showScreen("beeResult");

    const pct = bee.total > 0 ? Math.round((bee.correct / bee.total) * 100) : 0;
    const gradeInfo = getLetterGrade(pct);

    let title = "Nice effort!";
    if (pct === 100) title = "🏆 Perfect Spelling Bee!";
    else if (pct >= 80) title = "🌟 Excellent Speller!";
    else if (pct >= 60) title = "👍 Good job!";

    $("bee-result-title").textContent = title;
    $("bee-result-stats").innerHTML = `
        <div class="result-stat">
            <span class="result-stat-value">${bee.correct}</span>
            <span class="result-stat-label">Correct</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${bee.total}</span>
            <span class="result-stat-label">Total</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${pct}%</span>
            <span class="result-stat-label">Accuracy</span>
        </div>
    `;
    $("bee-grade-display").textContent = gradeInfo.grade;
    $("bee-grade-display").className = `quiz-grade-display ${gradeInfo.class}`;
    $("bee-grade-detail").textContent = gradeInfo.msg;

    // Word review
    const reviewEl = $("bee-word-review");
    reviewEl.innerHTML = bee.results.map(r => `
        <div class="bee-review-item ${r.correct ? "bee-review-correct" : "bee-review-wrong"}">
            <span class="bee-review-icon">${r.correct ? "✅" : "❌"}</span>
            <span class="bee-review-word">${r.word}</span>
            ${!r.correct ? `<span class="bee-review-typed">You typed: ${r.userAnswer}</span>` : ""}
        </div>
    `).join("");

    speak(`Spelling Bee complete. You got ${bee.correct} out of ${bee.total}. Grade: ${gradeInfo.grade}.`);

    // Track struggles for incorrect words
    const missed = bee.results.filter(r => !r.correct);
    if (missed.length > 0) {
        const struggles = loadStruggles();
        missed.forEach(r => {
            const key = r.word.toLowerCase();
            if (!struggles[key]) {
                struggles[key] = { word: r.word, count: 0, lessons: [], lastMissed: null, attempts: [] };
            }
            struggles[key].count++;
            struggles[key].lastMissed = Date.now();
            struggles[key].attempts.push(r.userAnswer);
            if (struggles[key].attempts.length > 10) struggles[key].attempts.shift();
        });
        saveStruggles(struggles);
    }

    state.spellingBee = null;
}

// Spelling Bee event listeners
$("btn-bee-submit").addEventListener("click", checkSpellingBeeAnswer);
$("bee-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") checkSpellingBeeAnswer();
});

$("btn-bee-word").addEventListener("click", () => {
    const bee = state.spellingBee;
    if (!bee) return;
    const word = bee.words[bee.index]?.word;
    if (word) speak(word);
});
$("btn-bee-definition").addEventListener("click", () => {
    const bee = state.spellingBee;
    if (!bee) return;
    const hint = bee.words[bee.index]?.hint;
    if (hint) speakNatural(hint);
});
$("btn-bee-sentence").addEventListener("click", () => {
    const bee = state.spellingBee;
    if (!bee) return;
    const sentence = bee.words[bee.index]?.sentence;
    if (sentence) speakNatural(sentence);
});

$("btn-bee-back").addEventListener("click", () => {
    state.spellingBee = null;
    state.guidedPath = null;
    goHome();
});

$("btn-bee-done").addEventListener("click", () => {
    state.guidedPath = null;
    goHome();
});

// ================================================================
//  SPEED DRILL
// ================================================================

function renderSpeedLevelSelect() {
    const grid = $("speed-level-grid");
    grid.innerHTML = "";

    Object.entries(SIGHT_WORDS).forEach(([level, data]) => {
        const best = SRS.getSpeedDrillBest(level);
        const bestHTML = best
            ? `<span class="speed-level-best">Best: ${best.wpm.toFixed(1)} WPM</span>`
            : `<span class="speed-level-best">No attempts yet</span>`;

        const card = document.createElement("button");
        card.className = "category-card";
        card.style.setProperty("--card-color", data.color);
        card.innerHTML = `
            <span class="category-icon">${data.icon}</span>
            <span class="category-name">${data.label}</span>
            <span class="category-count">${data.description}</span>
            ${bestHTML}
        `;
        card.addEventListener("click", () => startSpeedDrill(parseInt(level)));
        grid.appendChild(card);
    });
}

function startSpeedDrill(level) {
    const data = SIGHT_WORDS[level];
    if (!data) return;

    const words = shuffle([...data.words]);

    state.speedDrill = {
        level,
        words,
        index: 0,
        known: [],
        helped: [],
        startTime: Date.now(),
        wordStartTime: Date.now(),
        timerInterval: null,
        responseTimes: [],
    };

    $("speed-drill-label").innerHTML = `&#9889; ${data.label}`;
    showScreen("speedDrill");

    // Hide/show timer based on settings
    const hideTimer = _loadDisplaySettings().hideTimer;
    $("speed-timer").style.visibility = hideTimer ? "hidden" : "visible";

    showNextSpeedWord();

    // Start the elapsed timer (always tracks internally, display is optional)
    state.speedDrill.timerInterval = setInterval(updateSpeedTimer, 100);
}

function updateSpeedTimer() {
    if (!state.speedDrill) return;
    const elapsed = (Date.now() - state.speedDrill.startTime) / 1000;
    $("speed-timer").textContent = elapsed.toFixed(1) + "s";
}

function showNextSpeedWord() {
    const drill = state.speedDrill;
    if (!drill) return;

    if (drill.index >= drill.words.length) {
        showSpeedDrillResults();
        return;
    }

    const word = drill.words[drill.index];
    $("speed-word").textContent = word;
    $("speed-word").classList.remove("speed-word-enter");
    // Force reflow for animation restart
    void $("speed-word").offsetWidth;
    $("speed-word").classList.add("speed-word-enter");

    $("speed-progress").textContent = `Word ${drill.index + 1} of ${drill.words.length}`;
    drill.wordStartTime = Date.now();
}

function speedWordKnown() {
    const drill = state.speedDrill;
    if (!drill || drill.index >= drill.words.length) return;

    const responseTime = Date.now() - drill.wordStartTime;
    drill.responseTimes.push(responseTime);
    drill.known.push(drill.words[drill.index]);
    drill.index++;

    Sound.correct();
    showNextSpeedWord();
}

function speedWordHelp() {
    const drill = state.speedDrill;
    if (!drill || drill.index >= drill.words.length) return;

    const word = drill.words[drill.index];
    const responseTime = Date.now() - drill.wordStartTime;
    drill.responseTimes.push(responseTime);
    drill.helped.push(word);
    drill.index++;

    // Read the word aloud
    speak(word, 0.7);
    Sound.incorrect();
    showNextSpeedWord();
}

function showSpeedDrillResults() {
    const drill = state.speedDrill;
    if (!drill) return;

    // Stop the timer
    if (drill.timerInterval) {
        clearInterval(drill.timerInterval);
        drill.timerInterval = null;
    }

    const totalTime = (Date.now() - drill.startTime) / 1000;       // seconds
    const totalWords = drill.words.length;
    const knownCount = drill.known.length;
    const helpedCount = drill.helped.length;
    const accuracy = Math.round((knownCount / totalWords) * 100);
    const wpm = totalWords / (totalTime / 60);                      // words per minute

    // Save result
    const best = SRS.saveSpeedDrillResult(drill.level, wpm, accuracy, drill.helped);
    SRS.recordDailyPractice();
    updateStreakDisplay();

    // Build results display
    const statsHTML = `
        <div class="result-stat">
            <span class="result-stat-value">${wpm.toFixed(1)}</span>
            <span class="result-stat-label">Words/Min</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${totalTime.toFixed(1)}s</span>
            <span class="result-stat-label">Total Time</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${accuracy}%</span>
            <span class="result-stat-label">Accuracy</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${knownCount}/${totalWords}</span>
            <span class="result-stat-label">Known</span>
        </div>
    `;
    $("speed-result-stats").innerHTML = statsHTML;

    // Personal best comparison
    const pbEl = $("speed-personal-best");
    if (best) {
        const isNewBest = best.wpm === wpm && best.date >= Date.now() - 2000;
        if (isNewBest) {
            pbEl.innerHTML = `<div class="speed-pb speed-pb-new">&#11014; New Personal Best!</div>`;
            Sound.badgeUnlock();
        } else {
            pbEl.innerHTML = `<div class="speed-pb">Personal Best: ${best.wpm.toFixed(1)} WPM (${best.accuracy}%)</div>`;
        }
    } else {
        pbEl.innerHTML = "";
    }

    // Title
    if (accuracy >= 90) {
        $("speed-result-title").textContent = "Amazing Speed!";
    } else if (accuracy >= 70) {
        $("speed-result-title").textContent = "Great Job!";
    } else {
        $("speed-result-title").textContent = "Keep Practicing!";
    }

    // Helped words
    const helpedEl = $("speed-helped-words");
    const helpedListEl = $("speed-helped-list");
    if (helpedCount > 0) {
        helpedEl.classList.remove("hidden");
        helpedListEl.innerHTML = drill.helped
            .map(w => `<span class="speed-helped-word">${w}</span>`)
            .join("");
    } else {
        helpedEl.classList.add("hidden");
    }

    showScreen("speedResult");
}

// Speed Drill event listeners
$("btn-speed-level-back").addEventListener("click", () => {
    goHome();
});

$("btn-speed-drill-back").addEventListener("click", () => {
    if (state.speedDrill && state.speedDrill.timerInterval) {
        clearInterval(state.speedDrill.timerInterval);
    }
    state.speedDrill = null;
    showScreen("speedLevel");
    renderSpeedLevelSelect();
});

$("btn-speed-know").addEventListener("click", speedWordKnown);
$("btn-speed-help").addEventListener("click", speedWordHelp);

$("btn-speed-retry").addEventListener("click", () => {
    const level = state.speedDrill ? state.speedDrill.level : 1;
    startSpeedDrill(level);
});

$("btn-speed-levels").addEventListener("click", () => {
    state.speedDrill = null;
    showScreen("speedLevel");
    renderSpeedLevelSelect();
});

// Keyboard shortcuts for speed drill
document.addEventListener("keydown", (e) => {
    if (!state.speedDrill) return;
    if (!screens.speedDrill.classList.contains("active")) return;

    if (e.key === "Enter" || e.key === " " || e.key === "ArrowRight") {
        e.preventDefault();
        speedWordKnown();
    } else if (e.key === "h" || e.key === "H" || e.key === "ArrowDown") {
        e.preventDefault();
        speedWordHelp();
    }
});

// ================================================================
//  DICTATION MODE
// ================================================================

function renderDictationLevelSelect() {
    const grid = $("dictation-level-grid");
    grid.innerHTML = "";

    Object.entries(DICTATION_SENTENCES).forEach(([name, data]) => {
        const card = document.createElement("button");
        card.className = "category-card";
        card.style.setProperty("--card-color", data.color);
        card.innerHTML = `
            <span class="category-icon">${data.icon}</span>
            <span class="category-name">${name}</span>
            <span class="category-count">${data.sentences.length} sentences</span>
        `;
        card.addEventListener("click", () => startDictation(name));
        grid.appendChild(card);
    });
}

function startDictation(level) {
    const data = DICTATION_SENTENCES[level];
    if (!data) return;

    // Pick 8 sentences, shuffle
    const picked = shuffle([...data.sentences]).slice(0, 8);

    state.dictation = {
        level,
        sentences: picked,
        index: 0,
        sentencesCorrect: 0,
        totalWords: 0,
        wordsCorrect: 0,
        missedWords: [],
        results: [],
    };

    showScreen("dictation");
    $("dictation-level-label").textContent = `${data.icon} ${level}`;
    loadDictationSentence();
}

function loadDictationSentence() {
    const d = state.dictation;
    if (!d) return;

    $("dictation-counter").textContent = `Sentence ${d.index + 1} of ${d.sentences.length}`;
    $("dictation-input").value = "";
    $("dictation-feedback").classList.add("hidden");
    $("dictation-feedback").innerHTML = "";
    $("dictation-next").classList.add("hidden");
    $("dictation-input").disabled = false;
    $("btn-dictation-check").classList.remove("hidden");

    // Auto-play the sentence
    setTimeout(() => playDictationSentence(), 400);
}

function playDictationSentence() {
    const d = state.dictation;
    if (!d) return;
    const sentence = d.sentences[d.index];
    speak(sentence, 0.82);
}

function playDictationSlow() {
    const d = state.dictation;
    if (!d) return;
    const sentence = d.sentences[d.index];
    const words = sentence.split(/\s+/);

    window.speechSynthesis.cancel();

    const token = {};
    _speechQueue = token;

    (async () => {
        for (let i = 0; i < words.length; i++) {
            if (_speechQueue !== token) return;
            await _utter(words[i], { rate: 0.7, pitch: 0.97, pause: 500 });
        }
    })();
}

function checkDictation() {
    const d = state.dictation;
    if (!d) return;

    const sentence = d.sentences[d.index];
    const typed = $("dictation-input").value.trim();

    // Normalize: strip punctuation for comparison, keep words
    const stripPunct = (s) => s.replace(/[^\w\s']/g, "").toLowerCase();
    const targetWords = sentence.split(/\s+/);
    const targetNorm = targetWords.map(w => stripPunct(w)).filter(w => w.length > 0);
    const typedWords = typed.split(/\s+/).filter(w => w.length > 0);
    const typedNorm = typedWords.map(w => stripPunct(w));

    // Compare word by word
    const maxLen = Math.max(targetWords.length, typedNorm.length);
    let allCorrect = true;
    const wordResults = [];

    for (let i = 0; i < maxLen; i++) {
        const target = targetWords[i] || "";
        const targetClean = targetNorm[i] || "";
        const typedClean = typedNorm[i] || "";
        const correct = targetClean === typedClean;

        if (!correct) allCorrect = false;
        wordResults.push({ target, typed: typedWords[i] || "", correct });

        d.totalWords++;
        if (correct) {
            d.wordsCorrect++;
        } else if (target) {
            const cleanTarget = target.replace(/[^\w']/g, "").toLowerCase();
            if (cleanTarget && !d.missedWords.includes(cleanTarget)) {
                d.missedWords.push(cleanTarget);
            }
        }
    }

    if (allCorrect) d.sentencesCorrect++;

    d.results.push({
        sentence,
        typed,
        correct: allCorrect,
        wordResults,
    });

    renderDictationFeedback(wordResults);

    $("dictation-input").disabled = true;
    $("btn-dictation-check").classList.add("hidden");
    $("dictation-next").classList.remove("hidden");

    if (allCorrect) {
        Sound.correct();
    } else {
        Sound.incorrect();
    }
}

function renderDictationFeedback(wordResults) {
    const container = $("dictation-feedback");
    container.classList.remove("hidden");
    container.innerHTML = "";

    wordResults.forEach(({ target, typed, correct }) => {
        const block = document.createElement("div");
        block.className = `dictation-word-block ${correct ? "correct" : "incorrect"}`;

        const typedEl = document.createElement("span");
        typedEl.className = "dictation-word-typed";
        typedEl.textContent = typed || "\u2014";
        block.appendChild(typedEl);

        if (!correct && target) {
            const correctEl = document.createElement("span");
            correctEl.className = "dictation-word-correct";
            correctEl.textContent = target;
            block.appendChild(correctEl);
        }

        container.appendChild(block);
    });
}

function nextDictationSentence() {
    const d = state.dictation;
    if (!d) return;

    d.index++;
    if (d.index >= d.sentences.length) {
        showDictationResults();
    } else {
        loadDictationSentence();
    }
}

function showDictationResults() {
    const d = state.dictation;
    if (!d) return;

    const pct = d.totalWords > 0 ? Math.round((d.wordsCorrect / d.totalWords) * 100) : 0;

    let title, emoji;
    if (pct >= 90) { title = "Outstanding!"; emoji = "\uD83C\uDF1F"; }
    else if (pct >= 70) { title = "Great Job!"; emoji = "\uD83D\uDCAA"; }
    else if (pct >= 50) { title = "Nice Effort!"; emoji = "\uD83D\uDC4D"; }
    else { title = "Keep Practicing!"; emoji = "\uD83D\uDCAB"; }

    $("dictation-result-title").textContent = `${emoji} ${title}`;

    $("dictation-result-stats").innerHTML = `
        <div class="result-stat">
            <span class="result-stat-value">${d.sentencesCorrect} / ${d.sentences.length}</span>
            <span class="result-stat-label">Sentences Perfect</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${pct}%</span>
            <span class="result-stat-label">Word Accuracy</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${d.wordsCorrect} / ${d.totalWords}</span>
            <span class="result-stat-label">Words Correct</span>
        </div>
    `;

    const missedContainer = $("dictation-missed");
    const missedWordsEl = $("dictation-missed-words");
    if (d.missedWords.length > 0) {
        missedContainer.classList.remove("hidden");
        missedWordsEl.innerHTML = d.missedWords.map(w =>
            `<span class="dictation-missed-word">${w}</span>`
        ).join("");
    } else {
        missedContainer.classList.add("hidden");
    }

    SRS.saveDictationResult(d.level, d.sentencesCorrect, d.sentences.length, pct, d.missedWords);
    SRS.recordDailyPractice();
    updateStreakDisplay();

    if (pct >= 70) Sound.levelUp();

    showScreen("dictationResult");
}

// Dictation event listeners
$("btn-dictation-listen").addEventListener("click", () => playDictationSentence());
$("btn-dictation-repeat").addEventListener("click", () => playDictationSentence());
$("btn-dictation-slow").addEventListener("click", () => playDictationSlow());
$("btn-dictation-check").addEventListener("click", () => checkDictation());
$("btn-dictation-next").addEventListener("click", () => nextDictationSentence());

$("dictation-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        if (!$("dictation-input").disabled) checkDictation();
    }
});

$("btn-dictation-back").addEventListener("click", () => {
    state.dictation = null;
    showScreen("dictationSelect");
    renderDictationLevelSelect();
});

$("btn-dictation-select-back").addEventListener("click", () => {
    goHome();
});

$("btn-dictation-again").addEventListener("click", () => {
    const level = state.dictation?.level;
    state.dictation = null;
    if (level) startDictation(level);
});

$("btn-dictation-levels").addEventListener("click", () => {
    state.dictation = null;
    showScreen("dictationSelect");
    renderDictationLevelSelect();
});

// ================================================================
//  PHONEME-GRAPHEME MAPPING GAME
// ================================================================

function startPhonemeGame(category) {
    const sounds = [...PHONEME_DATA[category]];
    for (let i = sounds.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sounds[i], sounds[j]] = [sounds[j], sounds[i]];
    }
    const picked = sounds.slice(0, Math.min(10, sounds.length));

    state.phonemeGame = {
        category,
        sounds: picked,
        index: 0,
        correct: 0,
        total: picked.length,
        results: [],
    };

    showScreen("phoneme");
    $("phoneme-category-label").textContent = category;
    loadPhonemeRound();
}

function loadPhonemeRound() {
    const pg = state.phonemeGame;
    if (!pg || pg.index >= pg.sounds.length) {
        showPhonemeResults();
        return;
    }

    const current = pg.sounds[pg.index];
    $("phoneme-counter").textContent = `${pg.index + 1} / ${pg.total}`;
    $("phoneme-score").textContent = pg.correct;
    $("phoneme-progress-fill").style.width = `${(pg.index / pg.total) * 100}%`;

    $("phoneme-feedback").classList.add("hidden");
    $("phoneme-prompt").classList.remove("hidden");

    // Build choices: correct spelling + distractors from all categories
    const allSpellings = [];
    Object.values(PHONEME_DATA).forEach(catSounds => {
        catSounds.forEach(s => {
            s.spellings.forEach(sp => {
                if (!current.spellings.includes(sp) && !allSpellings.includes(sp)) {
                    allSpellings.push(sp);
                }
            });
        });
    });

    for (let i = allSpellings.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allSpellings[i], allSpellings[j]] = [allSpellings[j], allSpellings[i]];
    }

    const correctSpelling = current.spellings[Math.floor(Math.random() * current.spellings.length)];
    const distractorCount = Math.min(3, allSpellings.length);
    const distractors = allSpellings.slice(0, distractorCount);

    const choices = [correctSpelling, ...distractors];
    for (let i = choices.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    $("phoneme-question").textContent = `Which spelling makes the "${current.sound.toUpperCase()}" sound?`;

    const container = $("phoneme-choices");
    container.innerHTML = "";
    choices.forEach(sp => {
        const card = document.createElement("button");
        card.className = "phoneme-choice-card";
        card.textContent = sp;
        card.addEventListener("click", () => checkPhonemeAnswer(sp, correctSpelling, current));
        container.appendChild(card);
    });

    setTimeout(() => playPhonemeSound(current), 400);
}

function playPhonemeSound(soundData) {
    const spelling = soundData.spellings[0];
    const examples = soundData.examples[spelling];
    if (examples && examples.length > 0) {
        speak(examples[0], 0.75);
    }
}

$("btn-phoneme-play").addEventListener("click", () => {
    const pg = state.phonemeGame;
    if (!pg) return;
    playPhonemeSound(pg.sounds[pg.index]);
});

function checkPhonemeAnswer(selected, correct, soundData) {
    const pg = state.phonemeGame;
    if (!pg) return;

    const isCorrect = selected === correct;
    if (isCorrect) { pg.correct++; Sound.correct(); }
    else { Sound.incorrect(); }

    pg.results.push({ sound: soundData.sound, selected, correct, isCorrect });

    const cards = document.querySelectorAll(".phoneme-choice-card");
    cards.forEach(card => {
        card.classList.add("disabled");
        if (card.textContent === correct) {
            card.classList.add(isCorrect ? "correct" : "revealed");
        } else if (card.textContent === selected && !isCorrect) {
            card.classList.add("incorrect");
        }
    });

    $("phoneme-feedback").classList.remove("hidden");
    $("phoneme-feedback-icon").textContent = isCorrect ? "\u2705" : "\u274C";
    $("phoneme-feedback-text").textContent = isCorrect
        ? `Correct! "${correct}" makes the ${soundData.sound.toUpperCase()} sound.`
        : `Not quite. The "${soundData.sound.toUpperCase()}" sound is spelled "${correct}".`;

    const examplesHTML = soundData.spellings.map(sp => {
        const words = soundData.examples[sp] || [];
        return `<strong>${sp}</strong>: ${words.join(", ")}`;
    }).join("<br>");
    $("phoneme-feedback-examples").innerHTML = examplesHTML;

    $("phoneme-score").textContent = pg.correct;

    setTimeout(() => {
        const words = soundData.examples[correct] || [];
        if (words.length > 0) speak(words.join(", "), 0.8);
    }, 500);
}

$("btn-phoneme-next").addEventListener("click", () => {
    const pg = state.phonemeGame;
    if (!pg) return;
    pg.index++;
    loadPhonemeRound();
});

function showPhonemeResults() {
    const pg = state.phonemeGame;
    if (!pg) return;

    $("phoneme-progress-fill").style.width = "100%";
    SRS.savePhonemeResult(pg.category, pg.correct, pg.total);
    SRS.recordDailyPractice();
    updateStreakDisplay();

    const pct = Math.round((pg.correct / pg.total) * 100);
    let emoji, msg;
    if (pct === 100) { emoji = "\uD83C\uDF1F"; msg = "Perfect Score!"; Sound.badgeUnlock(); }
    else if (pct >= 80) { emoji = "\uD83C\uDF89"; msg = "Great Job!"; Sound.levelUp(); }
    else if (pct >= 60) { emoji = "\uD83D\uDCAA"; msg = "Good Effort!"; Sound.correct(); }
    else { emoji = "\uD83D\uDCD6"; msg = "Keep Practicing!"; }

    showScreen("phonemeResult");
    $("phoneme-result-title").textContent = `${emoji} ${msg}`;
    $("phoneme-result-stats").innerHTML = `
        <div class="stat"><span class="stat-value">${pg.correct}</span><span class="stat-label">Correct</span></div>
        <div class="stat"><span class="stat-value">${pg.total}</span><span class="stat-label">Total</span></div>
        <div class="stat"><span class="stat-value">${pct}%</span><span class="stat-label">Accuracy</span></div>
    `;
}

$("btn-phoneme-replay").addEventListener("click", () => {
    const pg = state.phonemeGame;
    if (pg) startPhonemeGame(pg.category);
});

$("btn-phoneme-menu").addEventListener("click", () => {
    state.phonemeGame = null;
    goHome();
});

$("btn-phoneme-back").addEventListener("click", () => {
    state.phonemeGame = null;
    goHome();
});

// ================================================================
//  MORPHEME AWARENESS BUILDER
// ================================================================

function startMorphemeBuilder() {
    const words = [...MORPHEME_DATA.words];
    for (let i = words.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [words[i], words[j]] = [words[j], words[i]];
    }
    const picked = words.slice(0, Math.min(10, words.length));

    state.morphemeGame = {
        words: picked,
        index: 0,
        correct: 0,
        total: picked.length,
        builtParts: [],
        results: [],
    };

    showScreen("morpheme");
    $("morpheme-category-label").textContent = "Word Builder";
    renderMorphemeChallenge();
}

function renderMorphemeChallenge() {
    const mg = state.morphemeGame;
    if (!mg || mg.index >= mg.words.length) {
        showMorphemeResults();
        return;
    }

    const wordData = mg.words[mg.index];
    mg.builtParts = [];

    $("morpheme-counter").textContent = `${mg.index + 1} / ${mg.total}`;
    $("morpheme-score").textContent = mg.correct;
    $("morpheme-progress-fill").style.width = `${(mg.index / mg.total) * 100}%`;

    const clue = wordData.meanings.join(" + ");
    $("morpheme-clue-text").textContent = `"${clue}"`;

    $("morpheme-feedback").classList.add("hidden");
    $("morpheme-built-word").classList.add("hidden");
    $("morpheme-build-placeholder").classList.remove("hidden");
    $("morpheme-build-zone").classList.remove("has-parts");

    const buildZone = $("morpheme-build-zone");
    buildZone.querySelectorAll(".morpheme-chip").forEach(c => c.remove());

    const correctParts = wordData.parts.map((p, i) => ({
        text: p, type: wordData.types[i], isCorrect: true,
    }));

    const distractors = [];
    const allPrefixes = Object.keys(MORPHEME_DATA.prefixes).filter(p => !wordData.parts.includes(p));
    const allSuffixes = Object.keys(MORPHEME_DATA.suffixes).filter(s => !wordData.parts.includes(s));

    for (let i = allPrefixes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allPrefixes[i], allPrefixes[j]] = [allPrefixes[j], allPrefixes[i]];
    }
    for (let i = allSuffixes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allSuffixes[i], allSuffixes[j]] = [allSuffixes[j], allSuffixes[i]];
    }

    if (allPrefixes.length > 0) distractors.push({ text: allPrefixes[0], type: "prefix", isCorrect: false });
    if (allSuffixes.length > 0) distractors.push({ text: allSuffixes[0], type: "suffix", isCorrect: false });
    if (allSuffixes.length > 1) distractors.push({ text: allSuffixes[1], type: "suffix", isCorrect: false });

    const allParts = [...correctParts, ...distractors];
    for (let i = allParts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allParts[i], allParts[j]] = [allParts[j], allParts[i]];
    }

    const partsContainer = $("morpheme-parts");
    partsContainer.innerHTML = "";
    allParts.forEach((part, idx) => {
        const chip = document.createElement("button");
        const typeClass = part.type === "prefix" ? "prefix" : part.type === "suffix" ? "suffix" : "root";
        chip.className = `morpheme-chip ${typeClass}`;
        if (!part.isCorrect) chip.classList.add("distractor");
        chip.dataset.partIdx = idx;
        chip.dataset.text = part.text;
        chip.dataset.type = part.type;
        chip.innerHTML = `${part.text}<span class="morpheme-chip-label">${part.type}</span>`;
        chip.addEventListener("click", () => addMorphemePart(chip, part));
        partsContainer.appendChild(chip);
    });

    setTimeout(() => speakNatural(`Build the word that means: ${clue}`), 400);
}

function addMorphemePart(chipEl, part) {
    const mg = state.morphemeGame;
    if (!mg) return;
    Sound.click();
    chipEl.classList.add("used");
    mg.builtParts.push({ text: part.text, type: part.type, chipEl });
    updateMorphemeBuildZone();
}

function removeMorphemePart(index) {
    const mg = state.morphemeGame;
    if (!mg) return;
    Sound.click();
    const removed = mg.builtParts.splice(index, 1)[0];
    if (removed && removed.chipEl) removed.chipEl.classList.remove("used");
    updateMorphemeBuildZone();
}

function updateMorphemeBuildZone() {
    const mg = state.morphemeGame;
    const buildZone = $("morpheme-build-zone");
    buildZone.querySelectorAll(".morpheme-chip").forEach(c => c.remove());

    if (mg.builtParts.length === 0) {
        $("morpheme-build-placeholder").classList.remove("hidden");
        buildZone.classList.remove("has-parts");
        $("morpheme-built-word").classList.add("hidden");
    } else {
        $("morpheme-build-placeholder").classList.add("hidden");
        buildZone.classList.add("has-parts");

        mg.builtParts.forEach((part, idx) => {
            const chip = document.createElement("button");
            const typeClass = part.type === "prefix" ? "prefix" : part.type === "suffix" ? "suffix" : "root";
            chip.className = `morpheme-chip ${typeClass} in-zone`;
            chip.innerHTML = `${part.text}<span class="morpheme-chip-label">${part.type}</span>`;
            chip.addEventListener("click", () => removeMorphemePart(idx));
            buildZone.appendChild(chip);
        });

        const combined = mg.builtParts.map(p => p.text).join("");
        $("morpheme-built-word").textContent = combined;
        $("morpheme-built-word").classList.remove("hidden");
    }
}

function checkMorphemeBuild() {
    const mg = state.morphemeGame;
    if (!mg || mg.builtParts.length === 0) return;

    const wordData = mg.words[mg.index];
    const builtWord = mg.builtParts.map(p => p.text).join("");
    const isCorrect = builtWord.toLowerCase() === wordData.word.toLowerCase();

    if (isCorrect) { mg.correct++; Sound.correct(); }
    else { Sound.incorrect(); }

    mg.results.push({ word: wordData.word, built: builtWord, isCorrect });

    $("morpheme-feedback").classList.remove("hidden");
    $("morpheme-feedback-icon").textContent = isCorrect ? "\u2705" : "\u274C";
    $("morpheme-feedback-text").textContent = isCorrect
        ? `Correct! "${wordData.word}" is right!`
        : `Not quite. The answer is "${wordData.word}".`;

    const breakdownHTML = wordData.parts.map((part, i) => {
        const typeClass = wordData.types[i] === "prefix" ? "prefix-part"
            : wordData.types[i] === "suffix" ? "suffix-part" : "root-part";
        return `<div class="morpheme-meaning-part ${typeClass}">
            <span class="morpheme-meaning-word">${part}</span>
            <span class="morpheme-meaning-def">${wordData.meanings[i]}</span>
        </div>`;
    }).join('<span class="morpheme-meaning-plus">+</span>');

    $("morpheme-meaning-breakdown").innerHTML = breakdownHTML
        + `<span class="morpheme-meaning-equals">=</span>`
        + `<span class="morpheme-meaning-result">${wordData.word}</span>`;

    $("morpheme-score").textContent = mg.correct;
    $("morpheme-parts").querySelectorAll(".morpheme-chip").forEach(c => c.classList.add("used"));

    setTimeout(() => {
        speak(wordData.word, 0.8);
        setTimeout(() => speakNatural(`${wordData.word} means ${wordData.meanings.join(" plus ")}`), 800);
    }, 500);
}

$("btn-morpheme-check").addEventListener("click", checkMorphemeBuild);

$("btn-morpheme-clear").addEventListener("click", () => {
    const mg = state.morphemeGame;
    if (!mg) return;
    mg.builtParts.forEach(part => { if (part.chipEl) part.chipEl.classList.remove("used"); });
    mg.builtParts = [];
    updateMorphemeBuildZone();
});

$("btn-morpheme-next").addEventListener("click", () => {
    const mg = state.morphemeGame;
    if (!mg) return;
    mg.index++;
    renderMorphemeChallenge();
});

function showMorphemeResults() {
    const mg = state.morphemeGame;
    if (!mg) return;

    $("morpheme-progress-fill").style.width = "100%";
    SRS.saveMorphemeResult(mg.correct, mg.total);
    SRS.recordDailyPractice();
    updateStreakDisplay();

    const pct = Math.round((mg.correct / mg.total) * 100);
    let emoji, msg;
    if (pct === 100) { emoji = "\uD83C\uDF1F"; msg = "Perfect Builder!"; Sound.badgeUnlock(); }
    else if (pct >= 80) { emoji = "\uD83C\uDF89"; msg = "Great Building!"; Sound.levelUp(); }
    else if (pct >= 60) { emoji = "\uD83D\uDCAA"; msg = "Good Effort!"; Sound.correct(); }
    else { emoji = "\uD83E\uDDF1"; msg = "Keep Building!"; }

    showScreen("morphemeResult");
    $("morpheme-result-title").textContent = `${emoji} ${msg}`;
    $("morpheme-result-stats").innerHTML = `
        <div class="stat"><span class="stat-value">${mg.correct}</span><span class="stat-label">Correct</span></div>
        <div class="stat"><span class="stat-value">${mg.total}</span><span class="stat-label">Total</span></div>
        <div class="stat"><span class="stat-value">${pct}%</span><span class="stat-label">Accuracy</span></div>
    `;
}

$("btn-morpheme-replay").addEventListener("click", () => startMorphemeBuilder());

$("btn-morpheme-menu").addEventListener("click", () => {
    state.morphemeGame = null;
    goHome();
});

$("btn-morpheme-back").addEventListener("click", () => {
    state.morphemeGame = null;
    goHome();
});

// ================================================================
//  STREAK CALENDAR
// ================================================================
function updateStreakDisplay() {
    const el = $("streak-fire");
    if (!el) return;
    const streak = SRS.getDailyStreak();
    el.textContent = `\uD83D\uDD25 ${streak}`;
    el.title = `${streak}-day practice streak`;
}

function showStreakCalendar() {
    const modal = $("streak-overlay");
    if (!modal) return;
    modal.classList.remove("hidden");
    renderStreakCalendar();
}

function renderStreakCalendar() {
    const grid = $("streak-calendar-grid");
    if (!grid) return;

    const history = SRS.getPracticeHistory(30);
    const historySet = new Set(history);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    grid.innerHTML = "";

    ["S", "M", "T", "W", "T", "F", "S"].forEach(d => {
        const label = document.createElement("div");
        label.className = "streak-day-label";
        label.textContent = d;
        grid.appendChild(label);
    });

    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - 29);

    // Pad to start on Sunday
    for (let i = 0; i < startDate.getDay(); i++) {
        const empty = document.createElement("div");
        empty.className = "streak-day empty";
        grid.appendChild(empty);
    }

    for (let i = 0; i < 30; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i);
        const dateStr = date.toISOString().split("T")[0];
        const isToday = dateStr === today.toISOString().split("T")[0];
        const practiced = historySet.has(dateStr);

        const cell = document.createElement("div");
        cell.className = `streak-day ${practiced ? "practiced" : ""} ${isToday ? "today" : ""}`;
        cell.textContent = date.getDate();
        grid.appendChild(cell);
    }

    const streak = SRS.getDailyStreak();
    const longest = SRS.getLongestStreak();
    const streakStats = $("streak-stats");
    if (streakStats) {
        streakStats.innerHTML = `
            <div class="result-stat"><span class="result-stat-value">\uD83D\uDD25 ${streak}</span><span class="result-stat-label">Current Streak</span></div>
            <div class="result-stat"><span class="result-stat-value">\uD83C\uDFC6 ${longest}</span><span class="result-stat-label">Longest Streak</span></div>
            <div class="result-stat"><span class="result-stat-value">${history.length}</span><span class="result-stat-label">Days This Month</span></div>
        `;
    }
}

if ($("streak-fire")) $("streak-fire").addEventListener("click", showStreakCalendar);
if ($("btn-streak-close")) $("btn-streak-close").addEventListener("click", () => {
    $("streak-overlay").classList.add("hidden");
});

// ================================================================
//  READING COMPREHENSION
// ================================================================

function startComprehension(passage) {
    if (!passage || !passage.questions || passage.questions.length === 0) {
        alert("No comprehension questions available for this passage yet.");
        return;
    }
    state.comprehension = {
        passage,
        questions: [...passage.questions],
        index: 0,
        correct: 0,
        total: passage.questions.length,
        results: [],
        answered: false,
    };
    showScreen("comprehension");
    loadComprehensionQuestion();
}

function loadComprehensionQuestion() {
    const comp = state.comprehension;
    if (!comp) return;
    const q = comp.questions[comp.index];
    comp.answered = false;

    $("comp-counter").textContent = `${comp.index + 1} / ${comp.total}`;

    $("comp-question-text").textContent = q.q;

    // Render choices
    const choicesEl = $("comp-choices");
    choicesEl.innerHTML = "";
    const labels = ["A", "B", "C", "D"];
    q.choices.forEach((choice, i) => {
        const btn = document.createElement("button");
        btn.className = "comp-choice-btn";
        btn.innerHTML = `<span class="comp-choice-label">${labels[i]}</span><span class="comp-choice-text">${choice}</span>`;
        btn.addEventListener("click", () => selectComprehensionAnswer(i));
        choicesEl.appendChild(btn);
    });

    // Hide feedback and next
    $("comp-feedback").classList.add("hidden");
    $("btn-comp-next").classList.add("hidden");
}

function selectComprehensionAnswer(choiceIndex) {
    const comp = state.comprehension;
    if (!comp || comp.answered) return;
    comp.answered = true;

    const q = comp.questions[comp.index];
    const correct = choiceIndex === q.answer;

    if (correct) comp.correct++;
    comp.results.push({ question: q.q, correct, chosen: q.choices[choiceIndex], correctAnswer: q.choices[q.answer] });

    // Highlight choices
    const buttons = $("comp-choices").querySelectorAll(".comp-choice-btn");
    buttons.forEach((btn, i) => {
        btn.classList.add("disabled");
        if (i === q.answer) btn.classList.add("correct");
        if (i === choiceIndex && !correct) btn.classList.add("incorrect");
    });

    // Show feedback
    const fb = $("comp-feedback");
    fb.classList.remove("hidden");
    if (correct) {
        fb.textContent = "That's right! Great job! ✅";
        fb.className = "comp-feedback correct";
    } else {
        fb.textContent = `Not quite. The answer is: ${q.choices[q.answer]}`;
        fb.className = "comp-feedback incorrect";
    }

    // Show next button
    const nextBtn = $("btn-comp-next");
    nextBtn.classList.remove("hidden");
    nextBtn.textContent = comp.index < comp.total - 1 ? "Next Question →" : "See Results";

    // Speak feedback
    if (correct) speak("That's right!");
    else speak(`The correct answer is ${q.choices[q.answer]}`);
}

function nextComprehensionQuestion() {
    const comp = state.comprehension;
    if (!comp) return;
    comp.index++;
    if (comp.index >= comp.total) {
        showComprehensionResults();
    } else {
        loadComprehensionQuestion();
    }
}

function showComprehensionResults() {
    const comp = state.comprehension;
    if (!comp) return;
    const pct = Math.round((comp.correct / comp.total) * 100);

    showScreen("comprehensionResult");

    // Title
    let emoji = "🧠";
    if (pct === 100) emoji = "🌟";
    else if (pct >= 67) emoji = "👍";
    $("comp-result-title").textContent = `${emoji} ${pct}% Comprehension`;

    // Stats
    $("comp-result-stats").innerHTML = `
        <div class="result-stat"><span class="result-stat-value">${comp.correct}</span><span class="result-stat-label">Correct</span></div>
        <div class="result-stat"><span class="result-stat-value">${comp.total}</span><span class="result-stat-label">Questions</span></div>
        <div class="result-stat"><span class="result-stat-value">${pct}%</span><span class="result-stat-label">Score</span></div>
    `;

    // Review wrong answers
    const reviewList = $("comp-review-list");
    const wrong = comp.results.filter(r => !r.correct);
    if (wrong.length > 0) {
        reviewList.innerHTML = `<h3 class="comp-review-heading">Let's Review</h3>` +
            wrong.map(r => `
                <div class="comp-review-item">
                    <p class="comp-review-q">${r.question}</p>
                    <p class="comp-review-wrong">Your answer: ${r.chosen}</p>
                    <p class="comp-review-right">Correct answer: ${r.correctAnswer}</p>
                </div>
            `).join("");
    } else {
        reviewList.innerHTML = `<p class="comp-review-perfect">Perfect score! You understood everything! 🎉</p>`;
    }

    // Save stats
    SRS.saveComprehensionResult(comp.passage.id, comp.correct, comp.total);
    SRS.recordDailyPractice();
    updateStreakDisplay();

    speak(`You got ${comp.correct} out of ${comp.total} correct. ${pct === 100 ? "Perfect score!" : "Good effort!"}`);
}

// Comprehension event listeners
if ($("btn-comprehension-check")) {
    $("btn-comprehension-check").addEventListener("click", () => {
        if (state.currentPassage && state.currentPassage.questions) {
            startComprehension(state.currentPassage);
        } else {
            alert("No comprehension questions available for this passage yet.");
        }
    });
}
if ($("btn-comp-next")) $("btn-comp-next").addEventListener("click", nextComprehensionQuestion);
if ($("btn-comp-back")) $("btn-comp-back").addEventListener("click", () => showScreen("readResult"));
if ($("btn-comp-retry")) $("btn-comp-retry").addEventListener("click", () => {
    if (state.comprehension && state.comprehension.passage) {
        startComprehension(state.comprehension.passage);
    }
});
if ($("btn-comp-done")) $("btn-comp-done").addEventListener("click", () => {
    goHome();
});

// ================================================================
//  WRITE MODE — Voice-to-text composition
// ================================================================
const WRITE_PROMPTS = [
    "Tell me about your favorite game and why you like it.",
    "Describe what you did last weekend.",
    "If you could have any superpower, what would it be and why?",
    "Write about your favorite food and how it tastes.",
    "Describe your best friend without saying their name.",
    "If you could visit any place in the world, where would you go?",
    "Tell me about something that made you laugh recently.",
    "What would you do if you were invisible for a day?",
];

function initWriteMode() {
    // Show random prompts
    const promptsEl = $("write-prompts");
    promptsEl.innerHTML = "";
    shuffle([...WRITE_PROMPTS]).slice(0, 3).forEach(prompt => {
        const btn = document.createElement("button");
        btn.className = "btn btn-sm write-prompt-btn";
        btn.textContent = prompt;
        btn.addEventListener("click", () => {
            $("write-prompt").textContent = prompt;
            $("write-textarea").placeholder = "Start writing about: " + prompt.substring(0, 40) + "...";
            $("write-textarea").focus();
        });
        promptsEl.appendChild(btn);
    });

    // Word count
    $("write-textarea").addEventListener("input", _updateWriteWordCount);
    _updateWriteWordCount();
    $("write-feedback").classList.add("hidden");
    $("btn-write-ai-feedback").classList.add("hidden");
}

function _updateWriteWordCount() {
    const text = $("write-textarea").value.trim();
    const count = text ? text.split(/\s+/).length : 0;
    $("write-word-count").textContent = count + " word" + (count !== 1 ? "s" : "");
}

// Dictation in write mode
let _writeRecognition = null;

$("btn-write-mic").addEventListener("click", () => {
    if (_writeRecognition) {
        _writeRecognition.stop();
        _writeRecognition = null;
        $("btn-write-mic").classList.remove("listening");
        $("btn-write-mic").textContent = "🎤 Dictate";
        return;
    }

    if (!hasSpeechRecognition()) {
        $("btn-write-mic").textContent = "No mic available";
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    _writeRecognition = recognition;
    $("btn-write-mic").classList.add("listening");
    $("btn-write-mic").textContent = "🔴 Stop";

    let finalText = "";

    recognition.onresult = (event) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
                finalText += event.results[i][0].transcript;
            } else {
                interim += event.results[i][0].transcript;
            }
        }
        // Append final text to textarea
        if (finalText) {
            const ta = $("write-textarea");
            const existing = ta.value;
            ta.value = existing + (existing && !existing.endsWith(" ") ? " " : "") + finalText.trim();
            finalText = "";
            _updateWriteWordCount();
        }
    };

    recognition.onend = () => {
        // Continuous mode can randomly stop — restart if still active
        if (_writeRecognition === recognition) {
            try { recognition.start(); } catch {
                _writeRecognition = null;
                $("btn-write-mic").classList.remove("listening");
                $("btn-write-mic").textContent = "🎤 Dictate";
            }
        }
    };

    recognition.onerror = (event) => {
        if (event.error === "no-speech") return; // Keep listening
        _writeRecognition = null;
        $("btn-write-mic").classList.remove("listening");
        $("btn-write-mic").textContent = "🎤 Dictate";
    };

    recognition.start();
});

// Read back what was written
$("btn-write-read-back").addEventListener("click", () => {
    const text = $("write-textarea").value.trim();
    if (text) speakNatural(text);
});

// Check writing for potential misspellings
$("btn-write-check").addEventListener("click", () => {
    const text = $("write-textarea").value.trim();
    if (!text) return;

    // Build a simple dictionary from all word lists
    const dictionary = new Set();
    for (const cat of Object.values(WORD_LISTS)) {
        cat.words.forEach(w => dictionary.add(w.word.toLowerCase()));
    }
    // Add common words that won't be in spelling lists
    const commonWords = ["the","a","an","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","can","need","dare","ought","used","to","of","in","for","on","with","at","by","from","as","into","through","during","before","after","above","below","between","out","off","over","under","again","further","then","once","here","there","when","where","why","how","all","both","each","few","more","most","other","some","such","no","not","only","own","same","so","than","too","very","just","because","but","and","or","if","while","about","up","it","its","i","my","me","we","us","our","you","your","he","him","his","she","her","they","them","their","this","that","these","those","what","which","who","whom","whose","myself","himself","herself","itself","ourselves","themselves","yourself","am","like","go","going","went","gone","get","got","make","made","think","thought","know","knew","see","saw","come","came","take","took","want","find","found","give","gave","tell","told","say","said","said"];
    commonWords.forEach(w => dictionary.add(w));

    const words = text.split(/\s+/);
    const flagged = [];
    words.forEach(w => {
        const clean = w.replace(/[^a-zA-Z']/g, "").toLowerCase();
        if (clean.length > 2 && !dictionary.has(clean)) {
            flagged.push(w);
        }
    });

    const feedbackEl = $("write-feedback");
    const wordsEl = $("write-feedback-words");
    if (flagged.length > 0) {
        feedbackEl.classList.remove("hidden");
        wordsEl.innerHTML = flagged.map(w =>
            `<span class="write-flagged-word">${w}</span>`
        ).join("");
    } else {
        feedbackEl.classList.remove("hidden");
        wordsEl.innerHTML = `<p class="settings-desc" style="color:var(--success);font-weight:600;">Everything looks good! Nice writing!</p>`;
    }

    // Show AI feedback button if key exists
    if (AI.hasApiKey()) {
        $("btn-write-ai-feedback").classList.remove("hidden");
    }
});

// AI writing feedback
$("btn-write-ai-feedback").addEventListener("click", async () => {
    const text = $("write-textarea").value.trim();
    if (!text) return;
    const btn = $("btn-write-ai-feedback");
    btn.textContent = "Thinking...";
    btn.disabled = true;

    const result = await AI._callClaude(
        `You are Colton's writing coach. He is 13 and has dyslexia. He just wrote something and wants feedback. Be encouraging and specific. Point out what he did well first, then gently suggest 1-2 improvements. Keep it to 3-4 sentences. Talk directly to him. NEVER use markdown.`,
        `Colton wrote: "${text}"\n\nGive him encouraging, specific feedback on his writing.`,
        200
    );

    const wordsEl = $("write-feedback-words");
    if (result) {
        wordsEl.innerHTML += `<div class="write-ai-response">${result}</div>`;
        speakNatural(result);
    }
    btn.textContent = "🤖 Get AI Feedback";
    btn.disabled = false;
});

// Clear
$("btn-write-clear").addEventListener("click", () => {
    $("write-textarea").value = "";
    $("write-feedback").classList.add("hidden");
    $("btn-write-ai-feedback").classList.add("hidden");
    _updateWriteWordCount();
});

// Back
$("btn-write-back").addEventListener("click", () => {
    if (_writeRecognition) { _writeRecognition.stop(); _writeRecognition = null; }
    goHome();
});

// ================================================================
//  b/d/p/q TRAINING — Letter reversal recognition drill
// ================================================================
const BDPQ_LETTERS = ["b", "d", "p", "q"];
const BDPQ_MNEMONICS = {
    b: "b has its belly on the RIGHT →",
    d: "d has its belly on the LEFT ← (like \"bed\")",
    p: "p hangs DOWN with belly RIGHT →",
    q: "q hangs DOWN with belly LEFT ← (like a \"q\"uail's tail)",
};
const BDPQ_WORDS = {
    b: ["bed", "ball", "big", "book", "baby", "back", "bird", "box", "blue", "best"],
    d: ["dog", "day", "door", "down", "dark", "deep", "dance", "draw", "done", "dig"],
    p: ["pen", "play", "park", "part", "pull", "push", "past", "pick", "point", "page"],
    q: ["queen", "quick", "quiet", "quiz", "quit", "quote", "quest", "quilt", "quake", "quite"],
};

function startBdpqTraining() {
    // Build 20 rounds: mix of letter recognition and word context
    const rounds = [];
    // 12 letter recognition rounds
    for (let i = 0; i < 12; i++) {
        const letter = BDPQ_LETTERS[Math.floor(Math.random() * 4)];
        rounds.push({ type: "letter", letter });
    }
    // 8 word rounds (which letter fits?)
    for (let i = 0; i < 8; i++) {
        const letter = BDPQ_LETTERS[Math.floor(Math.random() * 4)];
        const words = BDPQ_WORDS[letter];
        const word = words[Math.floor(Math.random() * words.length)];
        rounds.push({ type: "word", letter, word });
    }

    state.bdpq = {
        rounds: shuffle(rounds),
        index: 0,
        correct: 0,
        streak: 0,
        bestStreak: 0,
    };

    showScreen("bdpq");
    showBdpqRound();
}

function showBdpqRound() {
    const { rounds, index, streak } = state.bdpq;
    if (index >= rounds.length) {
        showBdpqResults();
        return;
    }

    const round = rounds[index];
    $("bdpq-counter").textContent = `${index + 1} / ${rounds.length}`;
    $("bdpq-streak-val").textContent = streak;
    $("bdpq-feedback").classList.add("hidden");

    if (round.type === "letter") {
        // Show a large letter, ask which one it is
        $("bdpq-display").innerHTML = `<span class="bdpq-big-letter">${round.letter}</span>`;
        $("bdpq-instruction").textContent = "Which letter is this?";
        $("bdpq-mnemonic").innerHTML = "";
    } else {
        // Show a word with the target letter blanked out
        const blanked = round.word.replace(new RegExp(round.letter, "i"), "___");
        $("bdpq-display").innerHTML = `<span class="bdpq-word-display">${blanked}</span>`;
        $("bdpq-instruction").textContent = `Which letter fills the blank in "${round.word}"?`;
        $("bdpq-mnemonic").innerHTML = "";
    }

    // Render 4 choices
    const choicesEl = $("bdpq-choices");
    choicesEl.innerHTML = "";
    BDPQ_LETTERS.forEach(letter => {
        const btn = document.createElement("button");
        btn.className = "btn bdpq-choice-btn";
        btn.textContent = letter;
        btn.addEventListener("click", () => handleBdpqAnswer(letter, round.letter, btn));
        choicesEl.appendChild(btn);
    });
}

function handleBdpqAnswer(chosen, correct, btn) {
    const isCorrect = chosen === correct;
    const feedbackEl = $("bdpq-feedback");
    feedbackEl.classList.remove("hidden");

    // Disable all buttons
    document.querySelectorAll(".bdpq-choice-btn").forEach(b => {
        b.disabled = true;
        if (b.textContent === correct) b.classList.add("bdpq-correct");
        if (b.textContent === chosen && !isCorrect) b.classList.add("bdpq-wrong");
    });

    if (isCorrect) {
        state.bdpq.correct++;
        state.bdpq.streak++;
        if (state.bdpq.streak > state.bdpq.bestStreak) state.bdpq.bestStreak = state.bdpq.streak;
        feedbackEl.innerHTML = `<span class="bdpq-fb-correct">Correct!</span>`;
        Sound.correct();
    } else {
        state.bdpq.streak = 0;
        feedbackEl.innerHTML = `<span class="bdpq-fb-wrong">That's "${chosen}" — the answer is "${correct}"</span><br><span class="bdpq-fb-hint">${BDPQ_MNEMONICS[correct]}</span>`;
        Sound.incorrect();
        // Speak the mnemonic
        speak(BDPQ_MNEMONICS[correct], 0.8);
    }

    $("bdpq-streak-val").textContent = state.bdpq.streak;

    // Auto-advance after delay
    setTimeout(() => {
        state.bdpq.index++;
        showBdpqRound();
    }, isCorrect ? 800 : 2500);
}

function showBdpqResults() {
    showScreen("bdpqResult");
    const { correct, rounds, bestStreak } = state.bdpq;
    const pct = Math.round((correct / rounds.length) * 100);

    let title = "Nice work!";
    if (pct === 100) title = "Perfect score! You nailed every letter!";
    else if (pct >= 80) title = "Great job — you really know your letters!";
    else if (pct >= 60) title = "Good effort! Keep practicing!";
    else title = "Those letters are tricky — let's keep working on them!";

    $("bdpq-result-title").textContent = title;
    $("bdpq-result-stats").innerHTML = `
        <div class="result-stat">
            <span class="result-stat-value">${correct}</span>
            <span class="result-stat-label">Correct</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${rounds.length}</span>
            <span class="result-stat-label">Total</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${pct}%</span>
            <span class="result-stat-label">Accuracy</span>
        </div>
        <div class="result-stat">
            <span class="result-stat-value">${bestStreak}</span>
            <span class="result-stat-label">Best Streak</span>
        </div>
    `;
}

$("btn-bdpq-retry").addEventListener("click", () => startBdpqTraining());
$("btn-bdpq-home").addEventListener("click", () => {
    goHome();
});
$("btn-bdpq-back").addEventListener("click", () => {
    goHome();
});

// ================================================================
//  INIT
// ================================================================
loadPersistentStats();
syncCustomCategory();
renderHomeScreen();
updateStats();
updateReviewBanner();
updateStreakDisplay();
