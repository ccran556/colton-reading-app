// ===== State =====
const state = {
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
}

// ===== Speech Engine =====
// Natural-sounding TTS: sentence-level chunking, warm pitch, breathing pauses.

let _cachedVoice = null;
let _voicesLoaded = false;
let _speechQueue = null; // track current speech chain so we can cancel

function _pickBestVoice() {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length === 0) return null;

    // Prefer American English voices (en-US) for consistent pronunciation
    const enUS = voices.filter(v => v.lang === "en-US");
    const en = enUS.length > 0 ? enUS : voices.filter(v => v.lang.startsWith("en"));
    if (en.length === 0) return null;

    // Score each voice — higher is better, American voices preferred
    function scoreVoice(v) {
        const n = v.name.toLowerCase();
        const isUS = v.lang === "en-US";
        const bonus = isUS ? 10 : 0; // boost American voices

        if (/natural/i.test(n))                        return 100 + bonus; // MS Neural (Win 11)
        if (/neural/i.test(n))                         return 95 + bonus;
        if (/online/i.test(n) && /microsoft/i.test(n)) return 90 + bonus;  // MS Online
        if (/enhanced/i.test(n))                       return 85 + bonus;  // Apple enhanced
        if (/premium/i.test(n))                        return 85 + bonus;
        if (/samantha|alex/i.test(n))                  return 80 + bonus;  // American Apple voices
        if (/karen|daniel|moira|tessa|fiona/i.test(n)) return 70;          // Non-US Apple voices
        if (/google us english/i.test(n))              return 78;
        if (/google uk english/i.test(n))              return 65;
        if (/google/i.test(n))                         return 60 + bonus;
        if (/microsoft/i.test(n))                      return 50 + bonus;  // MS Desktop voices
        if (/(compact|espeak)/i.test(n))               return 5;           // low quality
        return 30 + bonus; // unknown
    }

    en.sort((a, b) => scoreVoice(b) - scoreVoice(a));
    return en[0];
}

// Low-level: speak a single utterance, returns a Promise
function _utter(text, { rate = 0.88, pitch = 0.97, volume = 1, pause = 0 } = {}) {
    return new Promise(resolve => {
        const u = new SpeechSynthesisUtterance(text);
        u.rate = rate;
        u.pitch = pitch;
        u.volume = volume;
        const voice = _cachedVoice || _pickBestVoice();
        if (voice) u.voice = voice;
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
 * Slightly warm pitch, natural rate.
 */
function speak(text, rate = 0.88) {
    if (!("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    _speechQueue = null;

    // Chrome+Windows bug: speak() right after cancel() is silently swallowed.
    // A small delay fixes it.
    setTimeout(() => {
        if (window.speechSynthesis.paused) window.speechSynthesis.resume();
        _utter(text, { rate, pitch: 0.97 });
    }, 50);
}

/**
 * speakNatural() — longer text (AI feedback, session insights).
 * Splits into sentences and speaks each with a breathing pause,
 * slight rate variation, so it sounds like a real person talking.
 */
function speakNatural(text) {
    if (!("speechSynthesis" in window) || !text) return;
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) window.speechSynthesis.resume();

    // Split into sentences (keep punctuation)
    const sentences = text
        .replace(/([.!?])\s+/g, "$1|||")
        .split("|||")
        .map(s => s.trim())
        .filter(s => s.length > 0);

    // Cancel token — if speak() or speakNatural() is called again, stop this chain
    const token = {};
    _speechQueue = token;

    (async () => {
        for (let i = 0; i < sentences.length; i++) {
            if (_speechQueue !== token) return; // cancelled

            // Slight rate variation per sentence for natural feel
            const baseRate = 0.9;
            const variation = (Math.random() - 0.5) * 0.06; // ±0.03
            const rate = baseRate + variation;

            // Slightly lower pitch on last sentence (natural ending tone)
            const pitch = i === sentences.length - 1 ? 0.94 : 0.97;

            // Pause between sentences — like a breath
            const pause = i < sentences.length - 1 ? 350 : 0;

            await _utter(sentences[i], { rate, pitch, pause });
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
//  MODE TABS
// ================================================================
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

    // Refresh AI recommendation when returning to home screen
    loadAiRecommendation();

    // Show daily challenge
    renderDailyChallenge();

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
    showScreen("start");
    updateReviewBanner();
    renderCategories();
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
    showScreen("start");
    updateReviewBanner();
    renderCategories();
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
    }
}

// ===== Enhanced Teach Slides =====

function renderTeachSlide() {
    const lesson = state.currentLesson;
    const slide = lesson.teachSlides[state.teachSlideIndex];
    const total = lesson.teachSlides.length;

    $("teach-slide-counter").textContent = `${state.teachSlideIndex + 1} / ${total}`;
    $("teach-slide-title").textContent = slide.title;
    $("teach-slide-content").textContent = slide.content;

    // Render diagram
    const diagramEl = $("teach-slide-diagram");
    if (slide.diagram) {
        diagramEl.innerHTML = renderDiagramHTML(slide.diagram);
        diagramEl.classList.remove("hidden");
    } else {
        diagramEl.innerHTML = "";
        diagramEl.classList.add("hidden");
    }

    // Nav buttons
    const isLast = state.teachSlideIndex === total - 1;
    $("btn-teach-next").textContent = isLast ? "Start Practice →" : "Next →";
    $("btn-teach-prev").classList.toggle("hidden", state.teachSlideIndex === 0);

    // Auto-read aloud
    setTimeout(() => speakNatural(slide.content), 400);
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
    return "";
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
    showScreen("start");
    updateReviewBanner();
    renderCategories();
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
            showScreen("start");
            updateReviewBanner();
            renderCategories();
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
            showScreen("start");
            updateReviewBanner();
            renderCategories();
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
                showScreen("start");
                renderCategories();
            });
        }
        newCat.textContent = "Exit to Menu";
        newCat.addEventListener("click", () => {
            state.guidedPath = null;
            showScreen("start");
            updateReviewBanner();
            renderCategories();
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
            showScreen("start");
            updateReviewBanner();
            renderCategories();
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
$("btn-settings").addEventListener("click", () => {
    $("settings-overlay").classList.remove("hidden");
    // Pre-fill API key if exists
    const key = AI.getApiKey();
    $("api-key-input").value = key;
    $("api-key-status").textContent = key ? "Key saved." : "";
    $("api-key-status").className = key ? "settings-hint success" : "settings-hint";
    renderProfileStats();
    renderCustomWordList();
});

$("btn-settings-close").addEventListener("click", () => {
    $("settings-overlay").classList.add("hidden");
});

$("settings-overlay").addEventListener("click", (e) => {
    if (e.target === $("settings-overlay")) {
        $("settings-overlay").classList.add("hidden");
    }
});

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
        showScreen("start");
        renderCategories();
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
    showScreen("start");
    updateReviewBanner();
    renderCategories();
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

    $("dashboard-content").innerHTML = html;
}

$("btn-open-dashboard").addEventListener("click", () => {
    $("settings-overlay").classList.add("hidden");
    renderDashboard();
    showScreen("dashboard");
});

$("btn-dashboard-back").addEventListener("click", () => {
    showScreen("start");
    renderCategories();
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
    state.currentPassage.sentences.forEach((sentence, i) => {
        const span = document.createElement("span");
        span.className = "passage-sentence";
        span.dataset.index = i;
        span.textContent = sentence + " ";
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

    // Show focused sentence
    $("read-current-sentence").textContent = sentence;

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
        $("read-transcript-text").textContent = finalTranscript || interim;
        if (finalTranscript) {
            $("read-transcript-text").className = "read-transcript-text final";
        }
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
        $("btn-read-practice").classList.remove("hidden");
        if ($("btn-read-review")) $("btn-read-review").classList.remove("hidden");
    } else {
        struggledContainer.classList.add("hidden");
        $("btn-read-practice").classList.add("hidden");
        if ($("btn-read-review")) $("btn-read-review").classList.add("hidden");
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
        for (const [catName, catData] of Object.entries(WORD_LISTS)) {
            const wordObj = catData.words.find(w => w.word.toLowerCase() === sw.word.toLowerCase());
            if (wordObj) {
                SRS.recordResult(catName, wordObj, false, 3); // Mark as failed so it shows in review
                break;
            }
        }
    });

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
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    showScreen("start");
    renderCategories();
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

$("btn-read-practice").addEventListener("click", () => {
    practiceStruggledWords();
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
    state.mode = "read";
    showScreen("start");
    // Activate the Read It tab
    document.querySelectorAll(".mode-tab").forEach(t => t.classList.remove("active"));
    const readTab = document.querySelector('.mode-tab[data-mode="read"]');
    if (readTab) readTab.classList.add("active");
    renderCategories();
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
    showScreen("start");
    updateReviewBanner();
    renderCategories();
});

$("btn-bee-done").addEventListener("click", () => {
    state.guidedPath = null;
    showScreen("start");
    updateReviewBanner();
    renderCategories();
});

// ================================================================
//  INIT
// ================================================================
loadPersistentStats();
syncCustomCategory();
renderCategories();
updateStats();
updateReviewBanner();
loadAiRecommendation();
