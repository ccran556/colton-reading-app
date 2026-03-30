// ============================================================
// Colton's Reading App - Achievement Badge System
// ============================================================
// Tracks and awards badges based on player progress across
// spelling sessions, streaks, mastery, lessons, and more.
// ============================================================

const BADGES = {

    // ----------------------------------------------------------
    // Badge Definitions
    // ----------------------------------------------------------

    definitions: [
        // --- First Steps ---
        {
            id: "first_word",
            name: "First Spark",
            description: "Spell your first word correctly",
            icon: "\u2728",
            condition: function (stats) {
                return stats.totalWordsCorrect >= 1;
            }
        },
        {
            id: "perfect_round",
            name: "Flawless",
            description: "Get 100% accuracy in a session",
            icon: "\uD83D\uDCAF",
            condition: function (stats) {
                return stats.sessionPerfect === true;
            }
        },
        {
            id: "first_lesson",
            name: "Apprentice",
            description: "Complete your first lesson",
            icon: "\uD83D\uDCD6",
            condition: function (stats) {
                return stats.lessonsCompleted >= 1;
            }
        },

        // --- Streak Badges ---
        {
            id: "streak_5",
            name: "On Fire",
            description: "Reach a streak of 5 correct in a row",
            icon: "\uD83D\uDD25",
            condition: function (stats) {
                return stats.bestStreak >= 5;
            }
        },
        {
            id: "streak_10",
            name: "Unstoppable",
            description: "Reach a streak of 10 correct in a row",
            icon: "\u26A1",
            condition: function (stats) {
                return stats.bestStreak >= 10;
            }
        },
        {
            id: "streak_25",
            name: "Legendary Streak",
            description: "Reach a streak of 25 correct in a row",
            icon: "\uD83C\uDF1F",
            condition: function (stats) {
                return stats.bestStreak >= 25;
            }
        },

        // --- Volume Badges ---
        {
            id: "words_50",
            name: "Getting Started",
            description: "Attempt 50 words",
            icon: "\uD83D\uDCDD",
            condition: function (stats) {
                return stats.totalWordsAttempted >= 50;
            }
        },
        {
            id: "words_100",
            name: "Centurion",
            description: "Attempt 100 words",
            icon: "\uD83D\uDCDA",
            condition: function (stats) {
                return stats.totalWordsAttempted >= 100;
            }
        },
        {
            id: "words_250",
            name: "Word Warrior",
            description: "Attempt 250 words",
            icon: "\u2694\uFE0F",
            condition: function (stats) {
                return stats.totalWordsAttempted >= 250;
            }
        },
        {
            id: "words_500",
            name: "Word Smith",
            description: "Attempt 500 words",
            icon: "\uD83D\uDD28",
            condition: function (stats) {
                return stats.totalWordsAttempted >= 500;
            }
        },

        // --- Mastery Badges ---
        {
            id: "master_10",
            name: "Quick Learner",
            description: "Master 10 words",
            icon: "\uD83C\uDF93",
            condition: function (stats) {
                return stats.masteredCount >= 10;
            }
        },
        {
            id: "master_25",
            name: "Skilled Speller",
            description: "Master 25 words",
            icon: "\uD83E\uDDE0",
            condition: function (stats) {
                return stats.masteredCount >= 25;
            }
        },
        {
            id: "master_50",
            name: "Grand Master",
            description: "Master 50 words",
            icon: "\uD83D\uDC51",
            condition: function (stats) {
                return stats.masteredCount >= 50;
            }
        },

        // --- Accuracy Badges ---
        {
            id: "accuracy_90",
            name: "Sharpshooter",
            description: "Achieve 90%+ accuracy in a session",
            icon: "\uD83C\uDFAF",
            condition: function (stats) {
                return stats.sessionAttempted > 0 && stats.sessionAccuracy >= 90;
            }
        },
        {
            id: "accuracy_100",
            name: "Perfectionist",
            description: "Achieve 100% accuracy in a session with at least 5 words",
            icon: "\uD83C\uDFC6",
            condition: function (stats) {
                return stats.sessionAttempted >= 5 && stats.sessionAccuracy === 100;
            }
        },

        // --- Lesson Badges ---
        {
            id: "lessons_5",
            name: "Studious",
            description: "Complete 5 lessons",
            icon: "\uD83D\uDDD3\uFE0F",
            condition: function (stats) {
                return stats.lessonsCompleted >= 5;
            }
        },
        {
            id: "lessons_all",
            name: "Valedictorian",
            description: "Complete every available lesson",
            icon: "\uD83C\uDF96\uFE0F",
            condition: function (stats) {
                return stats.totalLessons > 0 && stats.lessonsCompleted >= stats.totalLessons;
            }
        },

        // --- Dedication Badges ---
        {
            id: "sessions_10",
            name: "Dedicated",
            description: "Play 10 practice sessions",
            icon: "\uD83D\uDCAA",
            condition: function (stats) {
                return stats.sessionsPlayed >= 10;
            }
        },
        {
            id: "sessions_25",
            name: "Ironclad",
            description: "Play 25 practice sessions",
            icon: "\uD83D\uDEE1\uFE0F",
            condition: function (stats) {
                return stats.sessionsPlayed >= 25;
            }
        },

        // --- Level Badges ---
        {
            id: "level_5",
            name: "Rising Star",
            description: "Reach level 5",
            icon: "\u2B50",
            condition: function (stats) {
                return stats.level >= 5;
            }
        },
        {
            id: "level_10",
            name: "Elite",
            description: "Reach level 10",
            icon: "\uD83D\uDD36",
            condition: function (stats) {
                return stats.level >= 10;
            }
        }
    ],

    // ----------------------------------------------------------
    // Persistence
    // ----------------------------------------------------------

    /**
     * Retrieve the array of unlocked badge IDs from localStorage.
     * Returns an empty array if nothing has been stored yet.
     */
    getUnlocked: function () {
        try {
            var raw = localStorage.getItem("coltons_app_badges");
            if (raw) {
                return JSON.parse(raw);
            }
        } catch (e) {
            console.warn("BADGES: could not read unlocked badges", e);
        }
        return [];
    },

    /**
     * Persist an array of unlocked badge IDs to localStorage.
     */
    saveUnlocked: function (ids) {
        try {
            localStorage.setItem("coltons_app_badges", JSON.stringify(ids));
        } catch (e) {
            console.warn("BADGES: could not save unlocked badges", e);
        }
    },

    // ----------------------------------------------------------
    // Stats Gathering
    // ----------------------------------------------------------

    /**
     * Collect every relevant stat from the various app subsystems
     * into a single flat object that badge conditions can inspect.
     *
     * Dependencies (expected globals):
     *   - state           (app.js)   current session state
     *   - SRS.loadStats() (storage.js) cumulative SRS statistics
     *   - getLessonProgress() (lessons.js) per-lesson completion map
     *   - AI.getProfile()  (ai.js)    adaptive AI learner profile
     */
    gatherStats: function () {
        // --- SRS / cumulative stats ---
        var srs = (typeof SRS !== "undefined" && SRS.loadStats)
            ? SRS.loadStats()
            : {};

        // --- Lesson progress ---
        var lessonMap = (typeof getLessonProgress === "function")
            ? getLessonProgress()
            : {};

        var lessonIds = Object.keys(lessonMap);
        var lessonsCompleted = 0;
        for (var i = 0; i < lessonIds.length; i++) {
            if (lessonMap[lessonIds[i]] && lessonMap[lessonIds[i]].completed) {
                lessonsCompleted++;
            }
        }

        // --- AI profile ---
        var profile = (typeof AI !== "undefined" && AI.getProfile)
            ? AI.getProfile()
            : {};

        var masteredCount = (profile.masteredWords && Array.isArray(profile.masteredWords))
            ? profile.masteredWords.length
            : 0;

        // --- Current session state ---
        var s = (typeof state !== "undefined") ? state : {};
        var sessionCorrect = s.wordsCorrect || 0;
        var sessionAttempted = s.wordsAttempted || 0;
        var sessionAccuracy = sessionAttempted > 0
            ? Math.round((sessionCorrect / sessionAttempted) * 100)
            : 0;
        var sessionPerfect = sessionAttempted > 0 && sessionCorrect === sessionAttempted;

        return {
            // Cumulative
            totalWordsCorrect:   srs.totalWordsCorrect   || 0,
            totalWordsAttempted: srs.totalWordsAttempted || 0,
            bestStreak:          srs.bestStreak          || (s.bestStreak || 0),
            sessionsPlayed:      srs.sessionsPlayed      || 0,
            totalScore:          srs.totalScore           || 0,
            level:               srs.level                || 0,

            // Mastery
            masteredCount: masteredCount,

            // Lessons
            lessonsCompleted: lessonsCompleted,
            totalLessons:     lessonIds.length,

            // Current session
            sessionAccuracy:  sessionAccuracy,
            sessionCorrect:   sessionCorrect,
            sessionAttempted: sessionAttempted,
            sessionPerfect:   sessionPerfect
        };
    },

    // ----------------------------------------------------------
    // Badge Checking
    // ----------------------------------------------------------

    /**
     * Evaluate every badge definition against the provided stats.
     * Return an array of badge definition objects for badges that
     * are NEWLY unlocked (not already stored in localStorage).
     *
     * Side-effect: newly unlocked badge IDs are appended to the
     * persisted list so they are not reported again.
     *
     * @param {Object} stats - a stats object (from gatherStats or manual)
     * @returns {Array} newly unlocked badge definition objects
     */
    checkForNew: function (stats) {
        var alreadyUnlocked = this.getUnlocked();
        var alreadySet = {};
        for (var i = 0; i < alreadyUnlocked.length; i++) {
            alreadySet[alreadyUnlocked[i]] = true;
        }

        var newlyUnlocked = [];

        for (var j = 0; j < this.definitions.length; j++) {
            var badge = this.definitions[j];

            // Skip if already earned
            if (alreadySet[badge.id]) {
                continue;
            }

            // Evaluate condition safely
            try {
                if (badge.condition(stats)) {
                    newlyUnlocked.push(badge);
                    alreadyUnlocked.push(badge.id);
                }
            } catch (e) {
                console.warn("BADGES: error checking badge '" + badge.id + "'", e);
            }
        }

        // Persist if anything new was unlocked
        if (newlyUnlocked.length > 0) {
            this.saveUnlocked(alreadyUnlocked);
        }

        return newlyUnlocked;
    }
};
