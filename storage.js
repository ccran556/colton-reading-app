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
    },
};
