// ===== AI Tutor Module =====
// Uses Claude Haiku for real-time personalized feedback.
// Builds a learning profile over time to adapt to the student's needs.

const AI = {
    API_URL: "https://api.anthropic.com/v1/messages",
    MODEL: "claude-haiku-4-5-20251001",
    KEY_STORAGE: "coltons_app_api_key",
    PROFILE_STORAGE: "coltons_app_learning_profile",

    // ===== API Key =====
    getApiKey() {
        return localStorage.getItem(this.KEY_STORAGE) || "";
    },

    setApiKey(key) {
        localStorage.setItem(this.KEY_STORAGE, key.trim());
    },

    hasApiKey() {
        return this.getApiKey().length > 0;
    },

    // ===== Learning Profile =====
    // Tracks patterns over time so the AI can personalize advice.
    getProfile() {
        try {
            return JSON.parse(localStorage.getItem(this.PROFILE_STORAGE)) || this._defaultProfile();
        } catch {
            return this._defaultProfile();
        }
    },

    saveProfile(profile) {
        localStorage.setItem(this.PROFILE_STORAGE, JSON.stringify(profile));
    },

    _defaultProfile() {
        return {
            totalAttempts: 0,
            totalCorrect: 0,
            // Error pattern tracking
            errorPatterns: {
                // e.g., "double_letters": { count: 5, examples: ["occurring", "beginning"] }
            },
            // Specific letter confusions
            letterConfusions: {
                // e.g., "ie_ei": { count: 3, examples: ["believe", "receive"] }
            },
            // Words struggled with most
            difficultWords: [],
            // Words mastered
            masteredWords: [],
            // Strengths identified by AI
            strengths: [],
            // Areas to work on identified by AI
            areasToImprove: [],
            // Last AI insight (cached)
            lastInsight: null,
            lastInsightTime: null,
        };
    },

    // ===== Record an attempt and update profile =====
    recordAttempt(wordData, userAnswer, correct, attempts, category) {
        const profile = this.getProfile();
        profile.totalAttempts++;
        if (correct) profile.totalCorrect++;

        const word = wordData.word.toLowerCase();
        const answer = userAnswer.toLowerCase();

        if (!correct) {
            // Analyze the specific error
            const errors = this._analyzeError(word, answer);
            errors.forEach((err) => {
                if (!profile.errorPatterns[err.type]) {
                    profile.errorPatterns[err.type] = { count: 0, examples: [] };
                }
                profile.errorPatterns[err.type].count++;
                if (!profile.errorPatterns[err.type].examples.includes(word)) {
                    profile.errorPatterns[err.type].examples.push(word);
                    // Keep only last 10 examples
                    if (profile.errorPatterns[err.type].examples.length > 10) {
                        profile.errorPatterns[err.type].examples.shift();
                    }
                }
            });

            // Track difficult words
            if (!profile.difficultWords.includes(word)) {
                profile.difficultWords.push(word);
                if (profile.difficultWords.length > 30) profile.difficultWords.shift();
            }
        } else if (attempts === 1) {
            // First-try correct = potential mastery
            if (!profile.masteredWords.includes(word)) {
                profile.masteredWords.push(word);
                if (profile.masteredWords.length > 50) profile.masteredWords.shift();
            }
            // Remove from difficult if mastered
            profile.difficultWords = profile.difficultWords.filter((w) => w !== word);
        }

        this.saveProfile(profile);
        return profile;
    },

    // ===== Analyze specific error patterns =====
    _analyzeError(correct, attempt) {
        const errors = [];

        if (attempt.length === 0) return errors;

        // Check for letter swaps (transpositions) — very common in dyslexia
        for (let i = 0; i < correct.length - 1; i++) {
            if (i < attempt.length - 1 &&
                correct[i] === attempt[i + 1] &&
                correct[i + 1] === attempt[i]) {
                errors.push({ type: "letter_swap", detail: `${correct[i]}${correct[i + 1]}` });
            }
        }

        // Check for double letter issues
        const doublePattern = /(.)\1/g;
        const correctDoubles = [...correct.matchAll(doublePattern)].map((m) => m[0]);
        const attemptDoubles = [...attempt.matchAll(doublePattern)].map((m) => m[0]);
        if (correctDoubles.length !== attemptDoubles.length ||
            correctDoubles.some((d, i) => d !== attemptDoubles[i])) {
            errors.push({ type: "double_letters", detail: correctDoubles.join(", ") });
        }

        // Check for silent letter omission
        const silentPatterns = ["kn", "wr", "gn", "mb", "gh", "ph"];
        silentPatterns.forEach((sp) => {
            if (correct.includes(sp) && !attempt.includes(sp)) {
                errors.push({ type: "silent_letters", detail: sp });
            }
        });

        // Check for ie/ei confusion
        if ((correct.includes("ie") && attempt.includes("ei")) ||
            (correct.includes("ei") && attempt.includes("ie"))) {
            errors.push({ type: "ie_ei_confusion", detail: "ie vs ei" });
        }

        // Check for tion/sion confusion
        if ((correct.includes("tion") && attempt.includes("sion")) ||
            (correct.includes("sion") && attempt.includes("tion"))) {
            errors.push({ type: "tion_sion_confusion", detail: "tion vs sion" });
        }

        // Check for able/ible confusion
        if ((correct.includes("able") && attempt.includes("ible")) ||
            (correct.includes("ible") && attempt.includes("able"))) {
            errors.push({ type: "able_ible_confusion", detail: "able vs ible" });
        }

        // Check for missing letters
        if (attempt.length < correct.length) {
            errors.push({ type: "missing_letters", detail: `expected ${correct.length}, got ${attempt.length}` });
        }

        // Check for extra letters
        if (attempt.length > correct.length) {
            errors.push({ type: "extra_letters", detail: `expected ${correct.length}, got ${attempt.length}` });
        }

        // General misspelling if no specific pattern found
        if (errors.length === 0 && correct !== attempt) {
            errors.push({ type: "general_misspelling", detail: "" });
        }

        return errors;
    },

    // ===== Build profile summary for AI context =====
    _buildProfileSummary() {
        const profile = this.getProfile();
        const parts = [];

        const accuracy = profile.totalAttempts > 0
            ? Math.round((profile.totalCorrect / profile.totalAttempts) * 100)
            : 0;
        parts.push(`Overall accuracy: ${accuracy}% (${profile.totalCorrect}/${profile.totalAttempts})`);

        // Top error patterns
        const sortedErrors = Object.entries(profile.errorPatterns)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 5);
        if (sortedErrors.length > 0) {
            parts.push("Most common error patterns:");
            sortedErrors.forEach(([type, data]) => {
                const label = type.replace(/_/g, " ");
                parts.push(`  - ${label}: ${data.count} times (e.g., ${data.examples.slice(-3).join(", ")})`);
            });
        }

        if (profile.difficultWords.length > 0) {
            parts.push(`Words currently struggling with: ${profile.difficultWords.slice(-8).join(", ")}`);
        }

        if (profile.masteredWords.length > 0) {
            parts.push(`Recently mastered: ${profile.masteredWords.slice(-5).join(", ")}`);
        }

        if (profile.strengths.length > 0) {
            parts.push(`Known strengths: ${profile.strengths.join(", ")}`);
        }

        if (profile.areasToImprove.length > 0) {
            parts.push(`Areas to improve: ${profile.areasToImprove.join(", ")}`);
        }

        return parts.join("\n");
    },

    // ===== Strip markdown from AI responses =====
    _stripMarkdown(text) {
        if (!text) return text;
        return text
            .replace(/\*\*(.+?)\*\*/g, "$1")   // **bold**
            .replace(/\*(.+?)\*/g, "$1")        // *italic*
            .replace(/__(.+?)__/g, "$1")        // __bold__
            .replace(/_(.+?)_/g, "$1")          // _italic_
            .replace(/`(.+?)`/g, "$1")          // `code`
            .replace(/^#+\s*/gm, "")            // # headings
            .replace(/^[-*]\s+/gm, "")          // - bullet points
            .replace(/\n{3,}/g, "\n\n");        // excess newlines
    },

    // ===== Call Claude API =====
    async _callClaude(systemPrompt, userMessage, maxTokens = 300) {
        if (!this.hasApiKey()) return null;

        try {
            const response = await fetch(this.API_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-api-key": this.getApiKey(),
                    "anthropic-version": "2023-06-01",
                    "anthropic-dangerous-direct-browser-access": "true",
                },
                body: JSON.stringify({
                    model: this.MODEL,
                    max_tokens: maxTokens,
                    system: systemPrompt,
                    messages: [{ role: "user", content: userMessage }],
                }),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                console.error("AI API error:", err);
                return null;
            }

            const data = await response.json();
            const raw = data.content?.[0]?.text || null;
            return this._stripMarkdown(raw);
        } catch (err) {
            console.error("AI API call failed:", err);
            return null;
        }
    },

    // ================================================================
    //  PUBLIC AI METHODS
    // ================================================================

    // ===== Get feedback after a word attempt =====
    async getWordFeedback(wordData, userAnswer, wasCorrect, attempts, category) {
        // Update profile first
        this.recordAttempt(wordData, userAnswer, wasCorrect, attempts, category);

        const profileSummary = this._buildProfileSummary();

        const systemPrompt = `You are a supportive spelling tutor talking directly to Colton, a 13-year-old with dyslexia. Colton finds reading and spelling frustrating because he struggles with it, so your job is to make him feel capable and encouraged after each attempt. Address him by name sometimes (but not every time — keep it natural). You are his coach and you genuinely believe in him.

Rules:
- Keep responses to 1-3 short sentences max
- Talk TO Colton directly, like a supportive coach or cool older mentor
- When he gets it wrong, normalize the struggle ("Lots of people find this one tricky" or "This is one of those sneaky words") then give ONE clear, specific tip
- When he gets it right, celebrate genuinely — show you noticed the effort, not just the result
- If he gets it right after multiple tries, make a big deal about his persistence ("You stuck with it and figured it out — that's what counts")
- Reference his known patterns when relevant ("Hey, you nailed the double letters this time!")
- Keep language casual and real — talk like a person, not a textbook
- Never be condescending or use baby talk — he's a teenager, respect that
- When giving tips, make them memorable and fun (mnemonics, word tricks, funny associations)
- Show compassion — acknowledge that spelling is genuinely hard with dyslexia, and that struggling doesn't mean he's not smart
- NEVER use markdown formatting — no asterisks, no bold, no italics, no bullet points. Write plain text only. Use quotes like "this" for emphasis instead.

Colton's learning profile:
${profileSummary}`;

        const userMessage = wasCorrect
            ? `The word was "${wordData.word}" (category: ${category}). Colton spelled it correctly${attempts === 1 ? " on the first try" : ` after ${attempts} attempts — he didn't give up`}. Hint was: "${wordData.hint}". Give Colton brief, genuine positive feedback.`
            : `The word was "${wordData.word}" (category: ${category}). Colton spelled it as "${userAnswer}" (attempt ${attempts}/3). Hint: "${wordData.hint}". Syllables: ${wordData.syllables.join("-")}. Give Colton a specific, helpful tip for this mistake — be kind about it, this stuff is hard for him.`;

        return this._callClaude(systemPrompt, userMessage, 150);
    },

    // ===== Get session summary with insights =====
    async getSessionInsight(wordsCorrect, wordsAttempted, wordResults) {
        const profileSummary = this._buildProfileSummary();

        const systemPrompt = `You are a spelling coach wrapping up a practice session with Colton, a 13-year-old with dyslexia. Talk directly to him. Colton finds reading and spelling frustrating, so end on a note that makes him want to come back and try again.

Rules:
- 2-4 sentences max, talking directly to Colton
- Start by pointing out something specific he did well — even if the session was tough, find something real to praise (persistence, getting a hard word, improvement)
- If the session was rough, normalize it ("Tough words today, but you showed up and that matters")
- Give ONE specific, actionable tip for next time
- End with something forward-looking and encouraging
- Be genuine, not generic — reference actual words from the session
- NEVER use markdown formatting — no asterisks, no bold, no italics. Write plain text only.

Colton's learning profile:
${profileSummary}`;

        const pct = wordsAttempted > 0 ? Math.round((wordsCorrect / wordsAttempted) * 100) : 0;
        const resultSummary = wordResults
            .map((r) => `${r.word}: ${r.correct ? "✓" : `✗ (spelled "${r.answer}")`}`)
            .join("\n");

        const userMessage = `Session results: ${wordsCorrect}/${wordsAttempted} correct (${pct}%).

Words attempted:
${resultSummary}

Talk directly to Colton — give him a brief encouraging summary and one specific tip for next time.`;

        const result = await this._callClaude(systemPrompt, userMessage, 200);

        // Update profile with AI insight
        if (result) {
            const profile = this.getProfile();
            profile.lastInsight = result;
            profile.lastInsightTime = Date.now();
            this.saveProfile(profile);
        }

        return result;
    },

    // ===== Get adaptive recommendation for what to practice next =====
    async getRecommendation() {
        const profileSummary = this._buildProfileSummary();

        const systemPrompt = `You are Colton's spelling coach. Colton is 13 and has dyslexia. Suggest what he should practice next based on his profile. Talk to him directly.

Rules:
- 1-2 sentences only, addressed to Colton
- Be specific: name a lesson, category, or pattern
- Make it feel like a friendly suggestion, not homework ("Hey Colton, you might want to try..." or "I think you'd crush...")
- Reference his actual struggles or recent wins
- NEVER use markdown formatting — no asterisks, no bold, no italics. Write plain text only.

Available lessons: Silent E Rule, Silent Letters, Doubling Rule, The FLOSS Rule (ff/ll/ss/zz), When NOT to Double, I Before E, Prefixes (un/dis/mis/in), Prefixes (re/pre/over/under), Suffixes (tion/sion), Suffixes (able/ible), Tricky OUGH, PH and GH sounds, Commonly Confused Words, Greek Roots, Latin Roots, Tricky Plurals.
Available categories: Science, Technology, Sports, History, Everyday Words, Challenging.`;

        const userMessage = `Colton's learning profile:
${profileSummary}

What should Colton practice next? Talk to him directly, 1-2 sentences.`;

        return this._callClaude(systemPrompt, userMessage, 100);
    },

    // ===== Get a learning profile analysis =====
    async getProfileAnalysis() {
        const profileSummary = this._buildProfileSummary();

        const systemPrompt = `You are a dyslexia specialist analyzing Colton's spelling patterns. Colton is 13 and has dyslexia. His parent is reading this, so provide a clear, parent-friendly summary of Colton's progress, strengths, and what to focus on. Use Colton's name.

Rules:
- Use clear headings
- Be encouraging but honest — celebrate what Colton is doing well
- Identify specific dyslexia-related patterns you see in Colton's data
- Suggest 2-3 concrete strategies the family can use
- Keep it under 200 words
- Use simple, warm language a parent can understand
- NEVER use markdown formatting — no asterisks, no bold, no italics. Write plain text only. Use CAPS or "quotes" for emphasis instead.`;

        const userMessage = `Analyze Colton's learning profile and provide insights for his parent:

${profileSummary}

Provide a structured analysis with: Colton's strengths, patterns to watch, and recommended strategies.`;

        const result = await this._callClaude(systemPrompt, userMessage, 400);

        // Extract strengths and areas to improve for the profile
        if (result) {
            const profile = this.getProfile();
            // Simple extraction — the AI's full analysis is the main value
            profile.lastInsight = result;
            profile.lastInsightTime = Date.now();
            this.saveProfile(profile);
        }

        return result;
    },

    // ===== Reading Mode Feedback =====
    async getReadingFeedback(struggledWords, passageTitle, wordsCorrect, wordsTotal, wpm) {
        const profileSummary = this._buildProfileSummary();

        const systemPrompt = `You are Colton's reading coach. Colton is 13 and has dyslexia. He just read a passage out loud, which takes real courage for someone who struggles with reading.

Rules:
- Celebrate that he read aloud — that's brave and it matters
- Comment on what went WELL before mentioning what was hard
- If he struggled with specific words, normalize it ("That word trips up a lot of people")
- If his speed or accuracy was good, mention it
- If it was a tough round, acknowledge the effort, not just the score
- Talk directly to Colton in 2-3 warm, encouraging sentences
- NEVER use markdown formatting — no asterisks, no bold, no italics. Write plain text only.

${profileSummary}`;

        const struggled = struggledWords.length > 0
            ? struggledWords.map(w => `"${w.word}" (heard as: "${w.spokenAs}")`).join(", ")
            : "nothing — perfect read!";

        const userMessage = `Colton just read the passage "${passageTitle}" out loud.
Score: ${wordsCorrect}/${wordsTotal} words correct (${wpm} words per minute).
Words he struggled with: ${struggled}

Give him encouraging feedback on his reading.`;

        return this._callClaude(systemPrompt, userMessage, 200);
    },
};
