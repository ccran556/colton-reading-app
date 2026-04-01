// ===== Spaced Repetition & Persistence Engine =====
// Uses localStorage to track word performance across sessions.
// Simplified SM-2 algorithm adapted for a spelling/reading app.

const SRS = {
    STORAGE_KEY: "coltons_app_srs",
    STATS_KEY: "coltons_app_stats",

    // Intervals in minutes: 1min, 10min, 1hr, 8hr, 1day, 3days, 7days, 14days, 30days
    INTERVALS: [1, 10, 60, 480, 1440, 4320, 10080, 20160, 43200],

    // ===== Load / Save =====
    _loadData() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEY)) || {};
        } catch {
            return {};
        }
    },

    _saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },

    loadStats() {
        try {
            return JSON.parse(localStorage.getItem(this.STATS_KEY)) || {
                totalScore: 0,
                totalWordsCorrect: 0,
                totalWordsAttempted: 0,
                bestStreak: 0,
                level: 1,
                sessionsPlayed: 0,
            };
        } catch {
            return { totalScore: 0, totalWordsCorrect: 0, totalWordsAttempted: 0, bestStreak: 0, level: 1, sessionsPlayed: 0 };
        }
    },

    saveStats(stats) {
        localStorage.setItem(this.STATS_KEY, JSON.stringify(stats));
    },

    // ===== Get/Create Word Entry =====
    // Key is "category::word" to avoid collisions
    _key(category, word) {
        return `${category}::${word.toLowerCase()}`;
    },

    getWordEntry(category, word) {
        const data = this._loadData();
        const key = this._key(category, word);
        if (!data[key]) {
            data[key] = {
                word: word.toLowerCase(),
                category,
                correctCount: 0,
                incorrectCount: 0,
                streak: 0,
                intervalIndex: 0,   // index into INTERVALS
                lastSeen: null,     // timestamp
                nextReview: null,   // timestamp
                easeFactor: 2.5,    // SM-2 ease factor
            };
        }
        return data[key];
    },

    // ===== Record Result =====
    recordResult(category, wordObj, wasCorrect, attempts) {
        const data = this._loadData();
        const key = this._key(category, wordObj.word);
        let entry = data[key] || this.getWordEntry(category, wordObj.word);

        const now = Date.now();
        entry.lastSeen = now;

        if (wasCorrect) {
            entry.correctCount++;
            entry.streak++;

            // Move up the interval ladder
            // First-try correct = advance 1 step, multi-try = stay or advance slowly
            if (attempts === 1) {
                entry.intervalIndex = Math.min(entry.intervalIndex + 1, this.INTERVALS.length - 1);
                entry.easeFactor = Math.min(entry.easeFactor + 0.1, 3.0);
            } else {
                // Correct but took multiple tries — small advance
                entry.intervalIndex = Math.min(entry.intervalIndex + 0.5, this.INTERVALS.length - 1);
            }
        } else {
            entry.incorrectCount++;
            entry.streak = 0;

            // Drop back significantly
            entry.intervalIndex = Math.max(0, Math.floor(entry.intervalIndex * 0.4));
            entry.easeFactor = Math.max(1.3, entry.easeFactor - 0.3);
        }

        // Calculate next review time
        const intervalMinutes = this.INTERVALS[Math.floor(entry.intervalIndex)];
        const adjustedInterval = intervalMinutes * entry.easeFactor;
        entry.nextReview = now + adjustedInterval * 60 * 1000;

        data[key] = entry;
        this._saveData(data);
        return entry;
    },

    // ===== Get Due Words =====
    // Returns words that are due for review (nextReview <= now)
    getDueWords(maxCount = 20) {
        const data = this._loadData();
        const now = Date.now();
        const due = [];

        for (const [key, entry] of Object.entries(data)) {
            if (entry.nextReview && entry.nextReview <= now) {
                // Look up full word data from WORD_LISTS
                const wordData = this._findWordData(entry.category, entry.word);
                if (wordData) {
                    due.push({
                        ...wordData,
                        _srsEntry: entry,
                        _srsKey: key,
                        _priority: this._calculatePriority(entry, now),
                    });
                }
            }
        }

        // Sort by priority (higher = more urgent)
        due.sort((a, b) => b._priority - a._priority);
        return due.slice(0, maxCount);
    },

    // ===== Get Struggling Words =====
    // Words with high incorrect counts or low streaks
    getStrugglingWords(maxCount = 20) {
        const data = this._loadData();
        const struggling = [];

        for (const [key, entry] of Object.entries(data)) {
            if (entry.incorrectCount > 0 || entry.streak === 0) {
                const wordData = this._findWordData(entry.category, entry.word);
                if (wordData) {
                    const ratio = entry.correctCount > 0
                        ? entry.incorrectCount / entry.correctCount
                        : entry.incorrectCount + 1;
                    struggling.push({
                        ...wordData,
                        _srsEntry: entry,
                        _srsKey: key,
                        _difficulty: ratio,
                    });
                }
            }
        }

        struggling.sort((a, b) => b._difficulty - a._difficulty);
        return struggling.slice(0, maxCount);
    },

    // ===== Get All Tracked Words =====
    getAllTracked() {
        const data = this._loadData();
        const result = [];
        for (const [key, entry] of Object.entries(data)) {
            const wordData = this._findWordData(entry.category, entry.word);
            if (wordData) {
                result.push({ ...wordData, _srsEntry: entry, _srsKey: key });
            }
        }
        return result;
    },

    // ===== Review Queue Count =====
    getDueCount() {
        const data = this._loadData();
        const now = Date.now();
        let count = 0;
        for (const entry of Object.values(data)) {
            if (entry.nextReview && entry.nextReview <= now) count++;
        }
        return count;
    },

    // ===== Priority Calculation =====
    _calculatePriority(entry, now) {
        let priority = 0;

        // Overdue time adds priority
        if (entry.nextReview) {
            const overdueMinutes = (now - entry.nextReview) / (60 * 1000);
            priority += Math.min(overdueMinutes / 60, 10); // cap at 10
        }

        // More incorrect answers = higher priority
        priority += entry.incorrectCount * 2;

        // Low streak = higher priority
        if (entry.streak === 0) priority += 3;
        else if (entry.streak < 3) priority += 1;

        // Lower ease factor = harder word = higher priority
        priority += (3.0 - entry.easeFactor) * 2;

        return priority;
    },

    // ===== Find Word Data from WORD_LISTS =====
    _findWordData(category, word) {
        const cat = WORD_LISTS[category];
        if (!cat) return null;
        return cat.words.find((w) => w.word.toLowerCase() === word.toLowerCase()) || null;
    },

    // ===== Reading Stats =====
    READING_KEY: "coltons_app_reading_stats",

    saveReadingSession(passageId, results) {
        const stats = this.getReadingStats();
        stats.sessions.push({
            passageId,
            date: Date.now(),
            wordsCorrect: results.correct,
            wordsTotal: results.total,
            wpm: results.wpm,
            struggledWords: results.struggled || [],
        });
        // Keep last 50 sessions
        if (stats.sessions.length > 50) stats.sessions = stats.sessions.slice(-50);
        localStorage.setItem(this.READING_KEY, JSON.stringify(stats));
    },

    getReadingStats() {
        try {
            return JSON.parse(localStorage.getItem(this.READING_KEY)) || { sessions: [] };
        } catch {
            return { sessions: [] };
        }
    },

    // ===== Listening Stats =====
    LISTENING_KEY: "coltons_app_listening_stats",

    saveListeningSession(passageId, data) {
        let stats;
        try {
            stats = JSON.parse(localStorage.getItem(this.LISTENING_KEY)) || { sessions: [] };
        } catch {
            stats = { sessions: [] };
        }
        stats.sessions.push({
            passageId,
            date: Date.now(),
            sentences: data.sentences,
            wordCount: data.wordCount,
        });
        if (stats.sessions.length > 50) stats.sessions = stats.sessions.slice(-50);
        localStorage.setItem(this.LISTENING_KEY, JSON.stringify(stats));
    },

    // ===== Reset =====
    resetAll() {
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.STATS_KEY);
        localStorage.removeItem(this.READING_KEY);
        localStorage.removeItem(this.LISTENING_KEY);
    },

    // ===== Phoneme Stats =====
    PHONEME_KEY: "coltons_app_phoneme_stats",

    savePhonemeResult(category, correct, total) {
        let stats;
        try {
            stats = JSON.parse(localStorage.getItem(this.PHONEME_KEY)) || { sessions: [] };
        } catch {
            stats = { sessions: [] };
        }
        stats.sessions.push({
            category,
            correct,
            total,
            date: Date.now(),
        });
        if (stats.sessions.length > 50) stats.sessions = stats.sessions.slice(-50);
        localStorage.setItem(this.PHONEME_KEY, JSON.stringify(stats));
    },

    getPhonemeStats() {
        try {
            return JSON.parse(localStorage.getItem(this.PHONEME_KEY)) || { sessions: [] };
        } catch {
            return { sessions: [] };
        }
    },

    // ===== Morpheme Stats =====
    MORPHEME_KEY: "coltons_app_morpheme_stats",

    saveMorphemeResult(correct, total) {
        let stats;
        try {
            stats = JSON.parse(localStorage.getItem(this.MORPHEME_KEY)) || { sessions: [] };
        } catch {
            stats = { sessions: [] };
        }
        stats.sessions.push({
            correct,
            total,
            date: Date.now(),
        });
        if (stats.sessions.length > 50) stats.sessions = stats.sessions.slice(-50);
        localStorage.setItem(this.MORPHEME_KEY, JSON.stringify(stats));
    },

    getMorphemeStats() {
        try {
            return JSON.parse(localStorage.getItem(this.MORPHEME_KEY)) || { sessions: [] };
        } catch {
            return { sessions: [] };
        }
    },

    // ===== Speed Drill Stats =====
    SPEED_DRILL_KEY: "coltons_app_speed_drill",

    saveSpeedDrillResult(level, wpm, accuracy, helped) {
        let data;
        try {
            data = JSON.parse(localStorage.getItem(this.SPEED_DRILL_KEY)) || {};
        } catch {
            data = {};
        }
        if (!data[level]) data[level] = { best: null, history: [] };

        const result = {
            wpm,
            accuracy,
            helped,       // array of words that needed help
            date: Date.now(),
        };

        // Update personal best (higher WPM with >= 80% accuracy wins)
        if (!data[level].best || (accuracy >= 80 && wpm > data[level].best.wpm)) {
            data[level].best = { wpm, accuracy, date: Date.now() };
        }

        data[level].history.push(result);
        // Keep last 30 sessions per level
        if (data[level].history.length > 30) {
            data[level].history = data[level].history.slice(-30);
        }

        localStorage.setItem(this.SPEED_DRILL_KEY, JSON.stringify(data));
        return data[level].best;
    },

    getSpeedDrillBest(level) {
        try {
            const data = JSON.parse(localStorage.getItem(this.SPEED_DRILL_KEY)) || {};
            return (data[level] && data[level].best) || null;
        } catch {
            return null;
        }
    },

    getSpeedDrillHistory(level) {
        try {
            const data = JSON.parse(localStorage.getItem(this.SPEED_DRILL_KEY)) || {};
            return (data[level] && data[level].history) || [];
        } catch {
            return [];
        }
    },

    // ===== Dictation Stats =====
    DICTATION_KEY: "coltons_app_dictation_stats",

    saveDictationResult(level, sentencesCorrect, totalSentences, wordAccuracy, missedWords) {
        let stats;
        try {
            stats = JSON.parse(localStorage.getItem(this.DICTATION_KEY)) || {};
        } catch {
            stats = {};
        }
        if (!stats[level]) stats[level] = { sessions: [] };
        stats[level].sessions.push({
            date: Date.now(),
            sentencesCorrect,
            totalSentences,
            wordAccuracy,
            missedWords: missedWords || [],
        });
        // Keep last 30 sessions per level
        if (stats[level].sessions.length > 30) {
            stats[level].sessions = stats[level].sessions.slice(-30);
        }
        localStorage.setItem(this.DICTATION_KEY, JSON.stringify(stats));
    },

    getDictationStats() {
        try {
            return JSON.parse(localStorage.getItem(this.DICTATION_KEY)) || {};
        } catch {
            return {};
        }
    },

    // ===== Comprehension Stats =====
    COMPREHENSION_KEY: "coltons_app_comprehension",

    saveComprehensionResult(passageId, correct, total) {
        let data;
        try { data = JSON.parse(localStorage.getItem(this.COMPREHENSION_KEY)) || {}; } catch { data = {}; }
        if (!data[passageId]) data[passageId] = [];
        data[passageId].push({ date: Date.now(), correct, total });
        if (data[passageId].length > 20) data[passageId] = data[passageId].slice(-20);
        localStorage.setItem(this.COMPREHENSION_KEY, JSON.stringify(data));
    },

    getComprehensionStats() {
        try { return JSON.parse(localStorage.getItem(this.COMPREHENSION_KEY)) || {}; } catch { return {}; }
    },

    getComprehensionAverage() {
        const data = this.getComprehensionStats();
        let totalCorrect = 0, totalQuestions = 0;
        for (const id of Object.keys(data)) {
            for (const r of data[id]) {
                totalCorrect += r.correct;
                totalQuestions += r.total;
            }
        }
        return totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    },

    // ===== Daily Practice Streak =====
    PRACTICE_KEY: "coltons_app_practice_dates",

    recordDailyPractice() {
        const today = new Date().toISOString().split("T")[0];
        let dates;
        try { dates = JSON.parse(localStorage.getItem(this.PRACTICE_KEY)) || []; } catch { dates = []; }
        if (!dates.includes(today)) {
            dates.push(today);
            // Keep last 365 days
            if (dates.length > 365) dates = dates.slice(-365);
            localStorage.setItem(this.PRACTICE_KEY, JSON.stringify(dates));
        }
    },

    getDailyStreak() {
        let dates;
        try { dates = JSON.parse(localStorage.getItem(this.PRACTICE_KEY)) || []; } catch { dates = []; }
        if (dates.length === 0) return 0;

        const sorted = [...dates].sort().reverse();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Check if today or yesterday was practiced (allow checking mid-day)
        const latest = new Date(sorted[0] + "T00:00:00");
        const diffDays = Math.floor((today - latest) / 86400000);
        if (diffDays > 1) return 0;

        let streak = 1;
        for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1] + "T00:00:00");
            const curr = new Date(sorted[i] + "T00:00:00");
            const gap = Math.floor((prev - curr) / 86400000);
            if (gap === 1) streak++;
            else break;
        }
        return streak;
    },

    getPracticeHistory(days) {
        let dates;
        try { dates = JSON.parse(localStorage.getItem(this.PRACTICE_KEY)) || []; } catch { dates = []; }
        if (days) {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - days);
            const cutoffStr = cutoff.toISOString().split("T")[0];
            return dates.filter(d => d >= cutoffStr);
        }
        return dates;
    },

    getLongestStreak() {
        let dates;
        try { dates = JSON.parse(localStorage.getItem(this.PRACTICE_KEY)) || []; } catch { dates = []; }
        if (dates.length === 0) return 0;

        const sorted = [...new Set(dates)].sort();
        let longest = 1, current = 1;
        for (let i = 1; i < sorted.length; i++) {
            const prev = new Date(sorted[i - 1] + "T00:00:00");
            const curr = new Date(sorted[i] + "T00:00:00");
            if (Math.floor((curr - prev) / 86400000) === 1) {
                current++;
                if (current > longest) longest = current;
            } else {
                current = 1;
            }
        }
        return longest;
    },

    // ===== Adaptive Learning Engine =====
    // Maps error patterns from AI profile → relevant lessons
    PATTERN_TO_LESSONS: {
        "double_letters":       ["double-consonants", "double-or-not", "floss-rule"],
        "silent_letters":       ["silent-e", "silent-letters"],
        "ie_ei_confusion":      ["i-before-e"],
        "tion_sion_confusion":  ["suffixes-tion-sion"],
        "able_ible_confusion":  ["suffixes-able-ible"],
        "letter_swap":          ["silent-e", "vowel-teams", "magic-e-patterns"],
        "missing_letters":      ["silent-letters", "silent-e", "r-controlled"],
        "extra_letters":        ["double-consonants", "double-or-not"],
        "general_misspelling":  ["confused-words"],
    },

    // Build a "Trouble Words" list from all struggle sources
    getTroubleWords(maxCount = 15) {
        const seen = new Set();
        const trouble = [];

        // Source 1: SRS struggling words (most reliable — actual spelling attempts)
        const srsStruggling = this.getStrugglingWords(30);
        srsStruggling.forEach(w => {
            if (!seen.has(w.word.toLowerCase())) {
                seen.add(w.word.toLowerCase());
                trouble.push({
                    ...w,
                    source: "spelling",
                    severity: w._difficulty || 1,
                });
            }
        });

        // Source 2: Reading struggled words (from recent reading sessions)
        const readingStats = this.getReadingStats();
        const recentSessions = readingStats.sessions.slice(-10); // Last 10 sessions
        const readingStruggles = {};
        recentSessions.forEach(session => {
            (session.struggledWords || []).forEach(word => {
                const lw = word.toLowerCase();
                readingStruggles[lw] = (readingStruggles[lw] || 0) + 1;
            });
        });
        // Sort by frequency — words struggled with across multiple sessions are worse
        Object.entries(readingStruggles)
            .sort((a, b) => b[1] - a[1])
            .forEach(([word, count]) => {
                if (!seen.has(word)) {
                    seen.add(word);
                    // Find this word in WORD_LISTS or create a basic entry
                    const wordData = this._findWordInAnyCategory(word);
                    if (wordData) {
                        trouble.push({
                            ...wordData,
                            source: "reading",
                            severity: count,
                        });
                    }
                }
            });

        // Source 3: AI profile difficult words
        try {
            const profile = JSON.parse(localStorage.getItem("coltons_app_learning_profile")) || {};
            (profile.difficultWords || []).forEach(word => {
                const lw = word.toLowerCase();
                if (!seen.has(lw)) {
                    seen.add(lw);
                    const wordData = this._findWordInAnyCategory(lw);
                    if (wordData) {
                        trouble.push({
                            ...wordData,
                            source: "ai",
                            severity: 0.5,
                        });
                    }
                }
            });
        } catch {}

        // Sort by severity (highest first)
        trouble.sort((a, b) => b.severity - a.severity);
        return trouble.slice(0, maxCount);
    },

    // Find a word in any WORD_LISTS category
    _findWordInAnyCategory(word) {
        const lw = word.toLowerCase();
        for (const [catName, catData] of Object.entries(WORD_LISTS)) {
            const found = catData.words.find(w => w.word.toLowerCase() === lw);
            if (found) return { ...found, _fromCategory: catName };
        }
        // Not in word lists — create a basic entry so it can still be practiced
        return {
            word: word,
            hint: "A word you've been working on",
            syllables: [word],
            sentence: "",
            _fromCategory: "Trouble Words",
        };
    },

    // Get recommended lessons based on error patterns
    getRecommendedLessons(maxCount = 3) {
        try {
            const profile = JSON.parse(localStorage.getItem("coltons_app_learning_profile")) || {};
            const patterns = profile.errorPatterns || {};

            // Score each lesson based on how many matching error patterns exist
            const lessonScores = {};
            for (const [pattern, data] of Object.entries(patterns)) {
                const matchingLessons = this.PATTERN_TO_LESSONS[pattern] || [];
                matchingLessons.forEach(lessonId => {
                    lessonScores[lessonId] = (lessonScores[lessonId] || 0) + data.count;
                });
            }

            // Also check reading struggles for pattern clues
            const readingStats = this.getReadingStats();
            const recentStruggles = [];
            readingStats.sessions.slice(-10).forEach(s => {
                (s.struggledWords || []).forEach(w => recentStruggles.push(w.toLowerCase()));
            });

            // Boost lessons if reading struggles match lesson content
            if (typeof LESSONS !== "undefined") {
                LESSONS.forEach(lesson => {
                    const lessonWords = (lesson.words || []).map(w => w.word.toLowerCase());
                    const overlap = recentStruggles.filter(w => lessonWords.includes(w)).length;
                    if (overlap > 0) {
                        lessonScores[lesson.id] = (lessonScores[lesson.id] || 0) + overlap * 2;
                    }
                });
            }

            // Check which lessons are already completed
            let completed = {};
            try {
                completed = JSON.parse(localStorage.getItem("coltons_app_lessons")) || {};
            } catch {}

            // Sort by score, filter out completed, return top N
            return Object.entries(lessonScores)
                .filter(([id]) => !completed[id])
                .sort((a, b) => b[1] - a[1])
                .slice(0, maxCount)
                .map(([id, score]) => ({ lessonId: id, score }));
        } catch {
            return [];
        }
    },

    // Get a summary of weak patterns for display
    getWeakPatterns() {
        try {
            const profile = JSON.parse(localStorage.getItem("coltons_app_learning_profile")) || {};
            const patterns = profile.errorPatterns || {};
            return Object.entries(patterns)
                .sort((a, b) => b[1].count - a[1].count)
                .slice(0, 5)
                .map(([type, data]) => ({
                    type,
                    label: type.replace(/_/g, " "),
                    count: data.count,
                    examples: data.examples.slice(-3),
                }));
        } catch {
            return [];
        }
    },

    // ===== Full Reset — clears everything =====
    resetEverything() {
        // SRS & stats
        localStorage.removeItem(this.STORAGE_KEY);
        localStorage.removeItem(this.STATS_KEY);
        localStorage.removeItem(this.READING_KEY);
        localStorage.removeItem(this.LISTENING_KEY);
        // Daily challenge
        localStorage.removeItem("coltons_app_daily");
        // Lesson progress
        localStorage.removeItem("coltons_app_lessons");
        // Custom words
        localStorage.removeItem("coltons_app_custom_words");
        // Badges
        localStorage.removeItem("coltons_app_badges");
        // AI key & profile
        localStorage.removeItem("coltons_app_api_key");
        localStorage.removeItem("coltons_app_learning_profile");
        // Struggle patterns
        localStorage.removeItem("coltons_app_struggles");
        // Phoneme & Morpheme
        localStorage.removeItem(this.PHONEME_KEY);
        localStorage.removeItem(this.MORPHEME_KEY);
        // Speed Drill
        localStorage.removeItem(this.SPEED_DRILL_KEY);
        // Dictation
        localStorage.removeItem(this.DICTATION_KEY);
        // Comprehension
        localStorage.removeItem(this.COMPREHENSION_KEY);
        // Practice streak
        localStorage.removeItem(this.PRACTICE_KEY);
    },
};
