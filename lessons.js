// ===== Structured Lessons =====
// Each lesson teaches a spelling rule, shows examples, then practices.
// Designed for a 13-year-old with dyslexia — rules are explained simply and clearly.

const LESSONS = [
    // ============================
    //  UNIT 1: Silent Letters
    // ============================
    {
        id: "silent-e",
        unit: 1,
        title: "The Silent E Rule",
        icon: "🔇",
        color: "#6c5ce7",
        teachSlides: [
            {
                id: "intro",
                title: "Welcome to Silent E!",
                content: "Hey Colton! Today we are going to learn about one of the coolest tricks in English spelling: the Silent E. You have probably seen it tons of times without even thinking about it. That little E at the end of a word? It does not make any sound at all. But here is the thing: even though it is silent, it has a really important job. It changes how the vowel before it sounds. Let's dig in and see how it works!",
                diagram: null,
            },
            {
                id: "the-rule",
                title: "What Does Silent E Do?",
                content: "Here is the big idea. When a word ends with the letter E, that E is silent. You do not say it. But it reaches back and tells the vowel before it to say its name. We call that a long vowel sound. Without the E, the vowel makes its short sound. With the E, the vowel says its own name. So short A becomes long A, short I becomes long I, short O becomes long O, and short U becomes long U. The E is like a boss that changes everything from the back of the word!",
                diagram: null,
            },
            {
                id: "examples-1",
                title: "See It in Action: A and I",
                content: "Let's look at some examples. Take the word 'cap.' It has a short A sound. Now add an E to the end: 'cape.' The A now says its name! Cap becomes cape. Same thing with I. The word 'kit' has a short I. Add an E and you get 'kite.' The I now says its name. That silent E completely changes the word. It changes the meaning too! A cap goes on your head, but a cape goes on a superhero.",
                diagram: {
                    type: "highlight-word",
                    words: [
                        { word: "cap → cape", highlight: "e", note: "E makes A say its name", color: "#6c5ce7" },
                        { word: "kit → kite", highlight: "e", note: "E makes I say its name", color: "#6c5ce7" },
                    ],
                },
            },
            {
                id: "interactive-tap",
                title: "Find the Silent E!",
                content: "Let's try something fun. I am going to show you a word, and I want you to tap on the silent E. Remember, the E is at the end and it does not make a sound, but it changes the vowel before it.",
                diagram: null,
                type: "tap-the-pattern",
                tapWord: "hope",
                tapTarget: "e",
                tapExplanation: "Great job! The E at the end of 'hope' is silent. It makes the O say its name — that is a long O sound!",
            },
            {
                id: "examples-2",
                title: "See It in Action: O and U",
                content: "It works with O and U too! Take 'hop.' Short O sound, like a bunny hopping. Add an E: 'hope.' Now the O says its name. The meaning totally changed! And look at 'cub.' Short U, like a baby bear. Add an E: 'cube.' Now the U says its name, and you are talking about a shape. The silent E is powerful. One little letter changes the sound and the meaning.",
                diagram: {
                    type: "highlight-word",
                    words: [
                        { word: "hop → hope", highlight: "e", note: "E makes O say its name", color: "#6c5ce7" },
                        { word: "cub → cube", highlight: "e", note: "E makes U say its name", color: "#6c5ce7" },
                    ],
                },
            },
            {
                id: "bigger-words",
                title: "Silent E in Bigger Words",
                content: "The silent E rule does not just work in small words. It shows up in bigger words too! Think about 'compete.' The E at the end makes that second E say its name. Or 'remote.' The E at the end makes the O say its name. Even in a long word like 'investigate,' that final E is doing its job. Whenever you see an E at the end of a word, check the vowel before the last consonant. Chances are, that vowel is saying its name!",
                diagram: {
                    type: "highlight-word",
                    words: [
                        { word: "compete", highlight: "e", note: "Final E makes the second E long", color: "#6c5ce7" },
                        { word: "remote", highlight: "e", note: "Final E makes the O long", color: "#6c5ce7" },
                        { word: "survive", highlight: "e", note: "Final E makes the I long", color: "#6c5ce7" },
                    ],
                },
            },
            {
                id: "interactive-tap-2",
                title: "Find the Silent E Again!",
                content: "Let's do one more. Tap the silent E in this longer word. Think about which letter is sitting silently at the end, doing its magic.",
                diagram: null,
                type: "tap-the-pattern",
                tapWord: "extreme",
                tapTarget: "e",
                tapExplanation: "Nice work! The final E in 'extreme' is silent. It makes the second E say its name, giving us that long E sound.",
            },
            {
                id: "tips",
                title: "How to Remember This Rule",
                content: "Here is a great way to remember the silent E rule. Think of the E as a magic letter. Some people even call it Magic E! It sits at the end of the word, quiet as a mouse, but it waves its magic wand and makes the vowel say its name. Short sound without E, long sound with E. If you are ever spelling a word and you hear a long vowel sound, check if there should be a silent E at the end!",
                diagram: null,
            },
            {
                id: "summary",
                title: "Silent E — Let's Review!",
                content: "Awesome job today! Let's wrap up what we learned. The silent E sits at the end of a word and makes no sound. But it changes the vowel before it from a short sound to a long sound. Cap becomes cape, kit becomes kite, hop becomes hope, cub becomes cube. This works in big words too, like compete, remote, and extreme. Now you know the magic of the silent E. Let's practice some words!",
                diagram: null,
            },
        ],
        rule: "When a word ends in a silent E, the vowel before it says its name (long sound). The E is silent — you don't hear it, but it changes the whole word.",
        examples: [
            { without: "hop", with: "hope", explanation: "Short O becomes Long O" },
            { without: "kit", with: "kite", explanation: "Short I becomes Long I" },
            { without: "cap", with: "cape", explanation: "Short A becomes Long A" },
            { without: "cub", with: "cube", explanation: "Short U becomes Long U" },
        ],
        words: [
            { word: "climate", hint: "The typical weather of a region", syllables: ["cli", "mate"] },
            { word: "complete", hint: "Finished, with nothing missing", syllables: ["com", "plete"] },
            { word: "compete", hint: "To try to win against others", syllables: ["com", "pete"] },
            { word: "admire", hint: "To look up to someone with respect", syllables: ["ad", "mire"] },
            { word: "erate", hint: "A rate or ratio used in calculations", syllables: ["e", "rate"] },
            { word: "remote", hint: "Far away from cities or people", syllables: ["re", "mote"] },
            { word: "extreme", hint: "The highest or most intense level", syllables: ["ex", "treme"] },
            { word: "survive", hint: "To stay alive through something difficult", syllables: ["sur", "vive"] },
            { word: "investigate", hint: "To look into something carefully", syllables: ["in", "ves", "ti", "gate"] },
            { word: "demonstrate", hint: "To show how something works", syllables: ["dem", "on", "strate"] },
        ],
    },
    {
        id: "silent-letters",
        unit: 1,
        title: "Silent Letters (K, W, B, G)",
        icon: "🤫",
        color: "#a29bfe",
        teachSlides: [
            {
                id: "intro",
                title: "Silent Letters Are Everywhere!",
                content: "Hey Colton! We just learned about the silent E, and now we are going to meet more silent letters. English is full of letters that you write but do not say out loud. It can feel a little weird at first, but once you learn the patterns, you will start to spot them everywhere. Today we are going to look at four big ones: silent K, silent W, silent B, and silent G. Let's get started!",
                diagram: null,
            },
            {
                id: "silent-k",
                title: "Silent K — The KN Pattern",
                content: "When a word starts with the letters K and N together, the K is completely silent. You only say the N sound. Think about the word 'knife.' You say 'nife,' not 'kuh-nife.' The K is there in the spelling, but your mouth skips right over it. The same thing happens in 'know,' 'knee,' 'knock,' and 'knight.' Every single KN word has a silent K. Once you know this pattern, you will never be tricked by it again!",
                diagram: {
                    type: "highlight-word",
                    words: [
                        { word: "knife", highlight: "kn", note: "K is silent", color: "#e17055" },
                        { word: "know", highlight: "kn", note: "K is silent", color: "#e17055" },
                        { word: "knight", highlight: "kn", note: "K is silent", color: "#e17055" },
                    ],
                },
            },
            {
                id: "silent-w",
                title: "Silent W — The WR Pattern",
                content: "Next up is the silent W. When a word starts with W and R together, the W is silent. You only say the R sound. The word 'write' sounds like 'rite.' The word 'wrong' sounds like 'rong.' You do not say the W at all! This pattern goes way back in history. People used to actually pronounce the W, but over hundreds of years, we stopped saying it. The spelling stayed the same though, so now we have to remember that WR means just the R sound.",
                diagram: {
                    type: "highlight-word",
                    words: [
                        { word: "write", highlight: "wr", note: "W is silent", color: "#0984e3" },
                        { word: "wrong", highlight: "wr", note: "W is silent", color: "#0984e3" },
                        { word: "wrinkle", highlight: "wr", note: "W is silent", color: "#0984e3" },
                    ],
                },
            },
            {
                id: "interactive-tap-1",
                title: "Find the Silent Letter!",
                content: "Okay, let's test your skills! Look at this word and tap on the silent letter. Remember, one of these letters is written but not spoken.",
                diagram: null,
                type: "tap-the-pattern",
                tapWord: "knowledge",
                tapTarget: "k",
                tapExplanation: "You got it! The K in 'knowledge' is completely silent. We say 'nowledge,' not 'kuh-nowledge.' The KN pattern always has a silent K!",
            },
            {
                id: "silent-b",
                title: "Silent B — The MB Pattern",
                content: "Now let's talk about the silent B. When a word ends with the letters M and B together, the B is silent. You only hear the M sound. Think about 'climb.' You say 'clime,' not 'climb' with a B sound at the end. Same with 'thumb' — you say 'thum.' And 'lamb' — you say 'lam.' The B is hiding right there at the end, totally silent. This one trips people up a lot, but now you know the trick: MB at the end means silent B!",
                diagram: {
                    type: "highlight-word",
                    words: [
                        { word: "climb", highlight: "mb", note: "B is silent", color: "#00b894" },
                        { word: "thumb", highlight: "mb", note: "B is silent", color: "#00b894" },
                        { word: "plumber", highlight: "mb", note: "B is silent", color: "#00b894" },
                    ],
                },
            },
            {
                id: "silent-g",
                title: "Silent G — The GN Pattern",
                content: "Our last silent letter today is the silent G. When G and N appear together, sometimes the G is silent. At the beginning of a word, like 'gnaw,' the G is silent and you just say 'naw.' At the end of a word, like 'sign' and 'design,' the G is also silent. You say 'sine' and 'de-sine.' The G is sneaky because sometimes GN makes a different sound, like in 'signal.' But in the words we are learning today, the G stays quiet and lets the N do all the talking.",
                diagram: {
                    type: "highlight-word",
                    words: [
                        { word: "gnaw", highlight: "gn", note: "G is silent", color: "#6c5ce7" },
                        { word: "sign", highlight: "gn", note: "G is silent", color: "#6c5ce7" },
                        { word: "design", highlight: "gn", note: "G is silent", color: "#6c5ce7" },
                    ],
                },
            },
            {
                id: "interactive-tap-2",
                title: "One More — Find the Silent Letter!",
                content: "Great job so far! Let's do one more. Look at this word and tap the letter that is silent. Think about how you actually say this word out loud.",
                diagram: null,
                type: "tap-the-pattern",
                tapWord: "wreckage",
                tapTarget: "w",
                tapExplanation: "Perfect! The W in 'wreckage' is silent. We say 'reckage,' not 'wuh-reckage.' The WR pattern always has a silent W!",
            },
            {
                id: "all-together",
                title: "The Four Silent Letter Patterns",
                content: "Let's put all four patterns together so you can see them side by side. KN means silent K, like in knife and knowledge. WR means silent W, like in write and wrinkle. MB at the end means silent B, like in climb and thumb. GN means silent G, like in gnaw and design. Four patterns, four silent letters. The key is to recognize the letter combo. When you see KN, WR, MB, or GN, you know one letter is staying quiet!",
                diagram: {
                    type: "highlight-word",
                    words: [
                        { word: "knife", highlight: "kn", note: "Silent K", color: "#e17055" },
                        { word: "write", highlight: "wr", note: "Silent W", color: "#0984e3" },
                        { word: "climb", highlight: "mb", note: "Silent B", color: "#00b894" },
                        { word: "gnaw", highlight: "gn", note: "Silent G", color: "#6c5ce7" },
                    ],
                },
            },
            {
                id: "summary",
                title: "Silent Letters — You Got This!",
                content: "Awesome work today, Colton! You learned four patterns where letters hide in plain sight. Silent K in KN words like knife and knight. Silent W in WR words like write and wrong. Silent B in MB words like climb and thumb. And silent G in GN words like gnaw and design. These silent letters might seem tricky, but now that you know the patterns, you can spell these words with confidence. Let's practice!",
                diagram: null,
            },
        ],
        rule: "English has many words with silent letters that you write but don't say. KN makes a N sound. WR makes a R sound. MB at the end makes a M sound. GN makes a N sound.",
        examples: [
            { without: "nife", with: "knife", explanation: "The K is silent in KN" },
            { without: "rite", with: "write", explanation: "The W is silent in WR" },
            { without: "clime", with: "climb", explanation: "The B is silent in MB" },
            { without: "naw", with: "gnaw", explanation: "The G is silent in GN" },
        ],
        words: [
            { word: "knowledge", hint: "What you know from learning", syllables: ["knowl", "edge"] },
            { word: "knuckle", hint: "The joint in your finger", syllables: ["knuck", "le"] },
            { word: "wreckage", hint: "The remains of something destroyed", syllables: ["wreck", "age"] },
            { word: "wrinkle", hint: "A crease or fold in something", syllables: ["wrin", "kle"] },
            { word: "plumber", hint: "Someone who fixes pipes and water systems", syllables: ["plumb", "er"] },
            { word: "thumb", hint: "The short wide finger on your hand", syllables: ["thumb"] },
            { word: "design", hint: "To plan and create something", syllables: ["de", "sign"] },
            { word: "foreign", hint: "From a different country", syllables: ["for", "eign"] },
            { word: "knight", hint: "A medieval warrior in armor", syllables: ["knight"] },
            { word: "wrestling", hint: "A sport where you grapple with an opponent", syllables: ["wres", "tling"] },
        ],
    },

    // ============================
    //  UNIT 2: Double Letters
    // ============================
    {
        id: "double-consonants",
        unit: 2,
        title: "The Doubling Rule",
        icon: "✌️",
        color: "#e17055",
        teachSlides: [
            {
                id: "intro",
                title: "The Doubling Rule",
                content: "Hey Colton! Today we are going to learn one of the most important spelling rules out there: the doubling rule. Have you ever wondered why 'running' has two N's but 'raining' only has one? Or why 'sitting' has two T's but 'eating' does not? There is actually a rule that tells you exactly when to double the last letter. Once you get it, a ton of spelling mistakes just disappear. Let's learn it!",
                diagram: null,
            },
            {
                id: "the-rule",
                title: "When Do You Double?",
                content: "Here is the rule. When you add a suffix like -ing, -ed, or -er to a word, you double the last consonant IF three things are true. First, the word ends in just one consonant. Second, there is a short vowel right before that consonant. And third, the stress is on the last syllable. If all three of those are true, you double! If any one of them is missing, you do not double. Let's look at each part.",
                diagram: null,
            },
            {
                id: "examples-short",
                title: "Short Words — Easy Doubling",
                content: "Let's start with short, one-syllable words. Take 'run.' It ends in one consonant, N. The vowel before it is a short U. So when we add -ing, we double the N: running. Same with 'sit.' It ends in one consonant, T. Short I before it. Add -ing and double the T: sitting. And 'hop.' One consonant, P. Short O. Add -ing, double the P: hopping. See the pattern? Short vowel plus one consonant equals doubling!",
                diagram: {
                    type: "comparison-table",
                    headers: ["Base Word", "With Suffix", "Why Double?"],
                    rows: [
                        ["run", "running", "Short U + one N → double N"],
                        ["sit", "sitting", "Short I + one T → double T"],
                        ["hop", "hopping", "Short O + one P → double P"],
                        ["stop", "stopping", "Short O + one P → double P"],
                    ],
                    ruleNote: "Short vowel + single consonant = DOUBLE before adding suffix",
                },
            },
            {
                id: "interactive-sort-1",
                title: "Sort These Words!",
                content: "Let's see if you can figure out which words need doubling and which ones do not. Sort each word into the right category!",
                diagram: null,
                type: "sort-it",
                sortCategories: ["Double the consonant", "Do NOT double"],
                sortItems: [
                    { word: "run + ing", category: 0 },
                    { word: "jump + ing", category: 1 },
                    { word: "sit + ing", category: 0 },
                    { word: "rain + ing", category: 1 },
                    { word: "stop + ed", category: 0 },
                    { word: "help + ed", category: 1 },
                ],
            },
            {
                id: "longer-words",
                title: "Bigger Words — Check the Stress!",
                content: "The doubling rule works in longer words too, but you need to check one more thing: where is the stress? The stress needs to be on the last syllable. Take 'begin.' The stress is on the second syllable: be-GIN. It ends in one consonant, N, with a short I before it. So we double: beginning. Same with 'occur.' The stress is on -CUR. One consonant, R, short vowel. Double it: occurring. But be careful — not all longer words have stress on the last syllable!",
                diagram: {
                    type: "comparison-table",
                    headers: ["Word", "Stress On", "Double?", "Result"],
                    rows: [
                        ["begin", "be-GIN (last)", "Yes", "beginning"],
                        ["occur", "oc-CUR (last)", "Yes", "occurring"],
                        ["commit", "com-MIT (last)", "Yes", "committed"],
                        ["refer", "re-FER (last)", "Yes", "referring"],
                    ],
                    ruleNote: "Stress on last syllable + short vowel + single consonant = DOUBLE",
                },
            },
            {
                id: "why-double",
                title: "Why Does This Rule Exist?",
                content: "You might be wondering: why do we even bother doubling? Here is the cool reason. Doubling the consonant keeps the vowel short. If you wrote 'runing' with one N, it would look like the vowel should be long, like 'rune-ing.' But we want the short U sound, like in 'run.' So we add another N to protect that short vowel: running. The double consonant is like a wall that keeps the vowel sound short. Without it, the vowel might try to say its name!",
                diagram: null,
            },
            {
                id: "interactive-sort-2",
                title: "Sort the Bigger Words!",
                content: "Now let's try with some bigger words. Remember to think about where the stress falls. If the stress is on the last syllable and there is a short vowel before a single consonant, you double!",
                diagram: null,
                type: "sort-it",
                sortCategories: ["Double the consonant", "Do NOT double"],
                sortItems: [
                    { word: "begin + ing", category: 0 },
                    { word: "open + ing", category: 1 },
                    { word: "commit + ed", category: 0 },
                    { word: "listen + ing", category: 1 },
                    { word: "refer + ing", category: 0 },
                    { word: "enter + ing", category: 1 },
                ],
            },
            {
                id: "common-mistakes",
                title: "Watch Out for Common Mistakes",
                content: "Here are some words that people often get wrong. 'Beginning' needs two N's because the stress is on -GIN and there is a short I. 'Occurring' needs two R's because the stress is on -CUR and there is a short vowel. 'Forgetting' needs two T's because the stress is on -GET. But 'opening' does NOT double because the stress is on O-pen, not on -pen. Always check the stress!",
                diagram: {
                    type: "comparison-table",
                    headers: ["Correct", "Wrong", "Why"],
                    rows: [
                        ["beginning", "begining", "Stress on -GIN, short I, double N"],
                        ["occurring", "occuring", "Stress on -CUR, short vowel, double R"],
                        ["forgetting", "forgeting", "Stress on -GET, short E, double T"],
                    ],
                    ruleNote: "These are the most commonly misspelled doubling words",
                },
            },
            {
                id: "summary",
                title: "The Doubling Rule — Review!",
                content: "Great work today, Colton! Here is the doubling rule one more time. When you add -ing, -ed, or -er, double the last consonant if: the word ends in one consonant, there is a short vowel before it, and the stress is on the last syllable. The double consonant keeps the vowel short. Remember: running, sitting, beginning, occurring, committed. You have got this! Let's practice some words now.",
                diagram: null,
            },
        ],
        rule: "When adding -ing, -ed, or -er to a short vowel word that ends in one consonant, you double the last consonant. This keeps the vowel short. Example: run → running (not runing).",
        examples: [
            { without: "runing", with: "running", explanation: "Double the N to keep the short U" },
            { without: "siting", with: "sitting", explanation: "Double the T to keep the short I" },
            { without: "begining", with: "beginning", explanation: "Double the N to keep the short I" },
            { without: "stoping", with: "stopping", explanation: "Double the P to keep the short O" },
        ],
        words: [
            { word: "occurring", hint: "Happening or taking place", syllables: ["oc", "cur", "ring"] },
            { word: "beginning", hint: "The start of something", syllables: ["be", "gin", "ning"] },
            { word: "committed", hint: "Dedicated to doing something", syllables: ["com", "mit", "ted"] },
            { word: "permitted", hint: "Allowed to do something", syllables: ["per", "mit", "ted"] },
            { word: "forgetting", hint: "Losing a memory of something", syllables: ["for", "get", "ting"] },
            { word: "referring", hint: "Mentioning or pointing to something", syllables: ["re", "fer", "ring"] },
            { word: "submitted", hint: "Turned in or handed over", syllables: ["sub", "mit", "ted"] },
            { word: "equipped", hint: "Given the tools or gear needed", syllables: ["e", "quipped"] },
            { word: "controlling", hint: "Managing or directing something", syllables: ["con", "trol", "ling"] },
            { word: "preferred", hint: "Liked better than the alternatives", syllables: ["pre", "ferred"] },
        ],
    },
    {
        id: "double-or-not",
        unit: 2,
        title: "When NOT to Double",
        icon: "☝️",
        color: "#fab1a0",
        teachSlides: [
            {
                id: "intro",
                title: "When NOT to Double!",
                content: "Hey Colton! Last lesson we learned when to double the consonant before adding a suffix. Today we are going to learn the flip side: when NOT to double. This is just as important! If you know when doubling is wrong, you will avoid a whole bunch of spelling mistakes. There are three clear situations where you should NOT double. Let us go through each one.",
                diagram: null,
            },
            {
                id: "rule-1-two-consonants",
                title: "Rule 1: Two Consonants at the End",
                content: "If a word ends in TWO consonants, do not double. Think about the word jump. It ends in M and P, that is two consonants. So when you add -ing, you just write jumping, not jumpping. Same with help. It ends in L and P. So it is helping, not helpping. And fast ends in S and T, so it is faster, not fastter. The rule only tells you to double when there is ONE consonant at the end. Two consonants? Leave them alone!",
                diagram: {
                    type: "comparison-table",
                    headers: ["Word", "Ends In", "With Suffix"],
                    rows: [
                        ["jump", "M + P (two consonants)", "jumping (no double)"],
                        ["help", "L + P (two consonants)", "helping (no double)"],
                        ["fast", "S + T (two consonants)", "faster (no double)"],
                        ["lift", "F + T (two consonants)", "lifting (no double)"],
                    ],
                    ruleNote: "Two consonants at the end = do NOT double",
                },
            },
            {
                id: "rule-2-two-vowels",
                title: "Rule 2: Two Vowels Before the Consonant",
                content: "If there are TWO vowels before the final consonant, do not double. Think about rain. Before the N, you have A and I, two vowels. So it is raining, not rainning. Same with read. Before the D, you have E and A, two vowels. So it is reading, not readding. Two vowels together usually make a long vowel sound, and we only double to protect short vowels. No short vowel, no need to double!",
                diagram: {
                    type: "comparison-table",
                    headers: ["Word", "Vowels Before End", "With Suffix"],
                    rows: [
                        ["rain", "A + I (two vowels)", "raining (no double)"],
                        ["read", "E + A (two vowels)", "reading (no double)"],
                        ["beat", "E + A (two vowels)", "beating (no double)"],
                        ["seem", "E + E (two vowels)", "seeming (no double)"],
                    ],
                    ruleNote: "Two vowels before final consonant = do NOT double",
                },
            },
            {
                id: "interactive-sort-1",
                title: "Double or Not? Sort Them!",
                content: "Let us practice! Look at each word and figure out whether you should double the last consonant or not. Think about the rules we just learned.",
                diagram: null,
                type: "sort-it",
                sortCategories: ["Double", "Do NOT double"],
                sortItems: [
                    { word: "run + ing", category: 0 },
                    { word: "jump + ing", category: 1 },
                    { word: "rain + ing", category: 1 },
                    { word: "sit + ing", category: 0 },
                    { word: "help + ed", category: 1 },
                    { word: "stop + ed", category: 0 },
                ],
            },
            {
                id: "rule-3-stress",
                title: "Rule 3: Stress NOT on the Last Syllable",
                content: "This one is for longer words. If the stress is NOT on the last syllable, do not double. Take open. The stress is on the first syllable: O-pen. So it is opening, not openning. Same with listen. The stress is on LIS-ten. So it is listening, not listenning. And enter has stress on EN-ter, so it is entering, not enterring. Compare this to begin, where the stress IS on the last syllable: be-GIN. That one DOES double: beginning.",
                diagram: {
                    type: "comparison-table",
                    headers: ["Word", "Stress", "Double?", "Result"],
                    rows: [
                        ["open", "O-pen (first)", "No", "opening"],
                        ["listen", "LIS-ten (first)", "No", "listening"],
                        ["enter", "EN-ter (first)", "No", "entering"],
                        ["begin", "be-GIN (last)", "Yes!", "beginning"],
                    ],
                    ruleNote: "Stress NOT on last syllable = do NOT double",
                },
            },
            {
                id: "side-by-side",
                title: "Double vs. No Double Side by Side",
                content: "Let us put doubling and not-doubling side by side so you can really see the difference. Words that double: running, sitting, stopping, beginning. They all have one consonant at the end, a short vowel before it, and stress on the last syllable. Words that do NOT double: jumping, raining, opening, listening. They break one of the three rules. Either two consonants at the end, two vowels before the consonant, or stress on the wrong syllable.",
                diagram: {
                    type: "comparison-table",
                    headers: ["Double", "No Double", "Why No Double?"],
                    rows: [
                        ["running", "jumping", "Two consonants (mp)"],
                        ["sitting", "raining", "Two vowels (ai)"],
                        ["beginning", "opening", "Stress on first syllable"],
                        ["stopping", "listening", "Stress on first syllable"],
                    ],
                    ruleNote: "Compare these pairs to see the pattern!",
                },
            },
            {
                id: "interactive-sort-2",
                title: "The Big Sort Challenge!",
                content: "Alright, here is a bigger challenge. Sort these words into the right categories. Think carefully about all three rules: how many consonants at the end, how many vowels before, and where the stress falls.",
                diagram: null,
                type: "sort-it",
                sortCategories: ["Double", "Do NOT double"],
                sortItems: [
                    { word: "occur + ing", category: 0 },
                    { word: "develop + ing", category: 1 },
                    { word: "remain + ing", category: 1 },
                    { word: "commit + ed", category: 0 },
                    { word: "appear + ing", category: 1 },
                    { word: "refer + ing", category: 0 },
                ],
            },
            {
                id: "memory-trick",
                title: "A Trick to Remember",
                content: "Here is a handy way to remember when NOT to double. I call it the twos rule. If you see TWO consonants at the end, do not double. If you see TWO vowels before the end, do not double. And if the stress is on a syllable that is NOT the last one, do not double. Basically, doubling only happens in a very specific situation: one consonant, one short vowel, stress on last syllable. Everything else? Leave it alone!",
                diagram: null,
            },
            {
                id: "summary",
                title: "When NOT to Double Review!",
                content: "Great job today, Colton! You now know both sides of the doubling coin. Do NOT double when the word ends in two consonants, like jumping. Do NOT double when there are two vowels before the consonant, like raining. Do NOT double when the stress is not on the last syllable, like opening. Between this lesson and the last one, you have the complete doubling toolkit. Let us practice!",
                diagram: null,
            },
        ],
        rule: "Don't double the consonant when the word ends in two consonants (jump → jumping), or when there are two vowels before the final consonant (rain → raining), or when the stress is NOT on the last syllable (open → opening).",
        examples: [
            { without: "jumpping", with: "jumping", explanation: "Ends in MP — two consonants, so don't double" },
            { without: "rainning", with: "raining", explanation: "Two vowels (AI) before N, so don't double" },
            { without: "openning", with: "opening", explanation: "Stress is on O-pen, not on -pen, so don't double" },
            { without: "enterring", with: "entering", explanation: "Stress is on EN-ter, not on -ter" },
        ],
        words: [
            { word: "listening", hint: "Paying attention to sounds", syllables: ["lis", "ten", "ing"] },
            { word: "happening", hint: "Taking place or occurring", syllables: ["hap", "pen", "ing"] },
            { word: "developing", hint: "Growing or building over time", syllables: ["de", "vel", "op", "ing"] },
            { word: "suffering", hint: "Experiencing pain or hardship", syllables: ["suf", "fer", "ing"] },
            { word: "offering", hint: "Giving or presenting something", syllables: ["of", "fer", "ing"] },
            { word: "remaining", hint: "What is left over", syllables: ["re", "main", "ing"] },
            { word: "appearing", hint: "Becoming visible or showing up", syllables: ["ap", "pear", "ing"] },
            { word: "reasoning", hint: "Thinking logically to reach a conclusion", syllables: ["rea", "son", "ing"] },
            { word: "containing", hint: "Holding something inside", syllables: ["con", "tain", "ing"] },
            { word: "discovering", hint: "Finding something new", syllables: ["dis", "cov", "er", "ing"] },
        ],
    },

    {
        id: "floss-rule",
        unit: 2,
        title: "The FLOSS Rule (ff, ll, ss, zz)",
        icon: "🦷",
        color: "#e17055",
        teachSlides: [
            {
                id: "intro",
                title: "What is the FLOSS Rule?",
                content: "Today we are going to learn a really useful spelling pattern called the FLOSS rule. It helps you know when to double the last letter of a word. Sometimes when you write a word, you might wonder: should I write one F or two? One S or two? The FLOSS rule gives you the answer! The word FLOSS itself follows this rule. F-L-O-S-S. Let's learn how it works.",
                diagram: null,
            },
            {
                id: "the-rule",
                title: "The Three Things to Check",
                content: "Here are the three things you check. First, is the word one syllable? That means one beat, like 'stuff' or 'press.' Second, does the word have a short vowel? Short vowels say their sound, not their name. Short A like in cat, short E like in bed, short I like in sit, short O like in hot, short U like in bus. Third, does the word end in F, L, S, or Z? If all three answers are yes, you double that last letter!",
                diagram: null,
            },
            {
                id: "short-vowels",
                title: "Quick Review: Short Vowels",
                content: "Let's make sure we know our short vowel sounds. Short A says 'ah' like in cat, hat, and map. Short E says 'eh' like in bed, red, and pet. Short I says 'ih' like in sit, hit, and big. Short O says 'oh' like in hot, pot, and mop. Short U says 'uh' like in bus, cup, and fun. These short vowel sounds are the key to the FLOSS rule. When you hear a short vowel before F, L, S, or Z, that is your signal to double!",
                diagram: null,
            },
            {
                id: "ff-pattern",
                title: "Double F — The FF Pattern",
                content: "When a one-syllable word has a short vowel and ends in the letter F, you double the F. Let's look at some examples. Stuff: one syllable, short U, ends in F, so we write stuff with two F's. Cliff: one syllable, short I, ends in F, so we write cliff with two F's. The same goes for bluff, sniff, stiff, scoff, and scuff. Every single one has a short vowel right before the double F. That short vowel is your signal!",
                diagram: {
                    type: "doubling",
                    base: "stu",
                    vowel: "u",
                    ending: "f",
                    doubled: "ff",
                    examples: ["stuff", "cliff", "bluff", "sniff", "stiff", "scoff", "scuff"],
                },
            },
            {
                id: "ff-tricky",
                title: "Double F — Watch Out!",
                content: "Here is a helpful tip: the word 'if' only has one F. Why? Because there is no consonant before the vowel. Very short words like 'if' and 'of' are exceptions. But most FLOSS words have a consonant blend before the vowel, like the 'st' in stuff or the 'cl' in cliff. When you see a bigger one-syllable word ending in F with a short vowel, double it! Try saying these out loud: staff, scuff, bluff. Hear that short vowel? Double the F.",
                diagram: null,
            },
            {
                id: "ll-pattern",
                title: "Double L — The LL Pattern",
                content: "The same rule works for the letter L. When a one-syllable word has a short vowel and ends in L, you double the L. Skill: one syllable, short I, ends in L, so we write skill with two L's. Spell: one syllable, short E, ends in L, so we write spell with two L's. The same goes for drill, grill, spill, chill, dwell, and skull. Every one of these follows the pattern: short vowel plus L equals double L.",
                diagram: {
                    type: "doubling",
                    base: "ski",
                    vowel: "i",
                    ending: "l",
                    doubled: "ll",
                    examples: ["skill", "spell", "drill", "grill", "spill", "chill", "skull"],
                },
            },
            {
                id: "ll-tricky",
                title: "Double L — Watch Out!",
                content: "Double L words are everywhere! Think about it: you spell, you grill food, you chill out, you use a skill. A good way to remember is to listen for that short vowel sound. Say 'skill' slowly: s-k-ih-ll. Hear the short I? That tells you to double the L. Now say 'spill' slowly: s-p-ih-ll. Same short I, same double L. If the vowel said its name instead, like in 'file' or 'mile,' you would NOT double. Short vowel equals double!",
                diagram: null,
            },
            {
                id: "ss-pattern",
                title: "Double S — The SS Pattern",
                content: "Now let's look at S. When a one-syllable word has a short vowel and ends in S, you double the S. Press: one syllable, short E, ends in S, so we write press with two S's. Grass: one syllable, short A, ends in S, so we write grass with two S's. Also look at cross, floss, glass, dress, chess, and bliss. They all have a short vowel right before the double S.",
                diagram: {
                    type: "doubling",
                    base: "pre",
                    vowel: "e",
                    ending: "s",
                    doubled: "ss",
                    examples: ["press", "grass", "floss", "cross", "glass", "dress", "chess"],
                },
            },
            {
                id: "ss-tricky",
                title: "Double S — Watch Out!",
                content: "Double S is probably the most common FLOSS pattern you will see. Think of words you use every day: mess, less, boss, toss, miss, kiss. They all follow the rule! Here is a fun trick: the word 'floss' itself has a double S. You floss your teeth, and the word floss reminds you of the whole rule. Also remember: words like 'bus' and 'yes' only have one S. They are short common words that are exceptions. But most one-syllable words with a short vowel before S will double it.",
                diagram: null,
            },
            {
                id: "zz-pattern",
                title: "Double Z — The ZZ Pattern",
                content: "Finally we have Z. When a one-syllable word has a short vowel and ends in Z, you double the Z. Buzz: one syllable, short U, ends in Z, so we write buzz with two Z's. Fizz: one syllable, short I, ends in Z, so we write fizz with two Z's. There are fewer double Z words than double F, L, or S words, but they follow the exact same rule. Buzz, fizz, fuzz, jazz, and whizz all have that short vowel plus double Z.",
                diagram: {
                    type: "doubling",
                    base: "bu",
                    vowel: "u",
                    ending: "z",
                    doubled: "zz",
                    examples: ["buzz", "fizz", "fuzz", "jazz", "whizz"],
                },
            },
            {
                id: "zz-tricky",
                title: "Double Z — Watch Out!",
                content: "Here is something cool about double Z words: they almost always have a buzzing sound! Say buzz, fizz, jazz. Hear how they all have that zzz sound? That buzzing is the Z being doubled. The word quiz is a tricky one because it has a short vowel and ends in Z, but some people spell it with just one Z. Most FLOSS Z words are short and fun: buzz like a bee, fizz like a soda, jazz like the music, fuzz like a peach. The Z doubles because of that short vowel right before it.",
                diagram: null,
            },
            {
                id: "exceptions",
                title: "When the Rule Does NOT Apply",
                content: "The FLOSS rule only works when three things are true: one syllable, short vowel, and ends in F, L, S, or Z. If any of those are missing, do not double! For example, 'leaf' has a long E, not a short vowel, so it is just one F. 'Goal' has a long O, so just one L. 'Base' has a long A, so just one S. Also, if a word has two syllables like 'until,' the rule does not apply. Remember: check all three things before you double.",
                diagram: null,
            },
            {
                id: "summary",
                title: "Remember: F-L-O-S-S",
                content: "Let's put it all together. The word FLOSS helps you remember the whole rule. F stands for ff. L stands for ll. The O in the middle reminds you the vowel must be short. S stands for ss. And the second S reminds you of zz. Three checks: one syllable, short vowel, ends in F, L, S, or Z. If all three are yes, double that last letter! You have learned the FLOSS rule. Now let's put it into practice!",
                diagram: { type: "floss-acronym" },
            },
        ],
        rule: "In a one-syllable word with a short vowel, when the word ends in F, L, S, or Z, you usually double that final consonant. Think FLOSS — the word itself follows the rule! Short vowel + F = ff (stuff). Short vowel + L = ll (fill). Short vowel + S = ss (miss). Short vowel + Z = zz (buzz). This doesn't apply to words ending in other consonants, or words with long vowels.",
        examples: [
            { without: "stuf", with: "stuff", explanation: "Short U + F → double the F (ff)" },
            { without: "fil", with: "fill", explanation: "Short I + L → double the L (ll)" },
            { without: "mes", with: "mess", explanation: "Short E + S → double the S (ss)" },
            { without: "buz", with: "buzz", explanation: "Short U + Z → double the Z (zz)" },
        ],
        words: [
            { word: "bluff", hint: "To pretend you have something you don't", syllables: ["bluff"] },
            { word: "cliff", hint: "A steep rock face", syllables: ["cliff"] },
            { word: "sniff", hint: "To breathe in quickly through your nose", syllables: ["sniff"] },
            { word: "stiff", hint: "Not easy to bend", syllables: ["stiff"] },
            { word: "scuff", hint: "To scratch or scrape your shoe on the ground", syllables: ["scuff"] },
            { word: "spell", hint: "To write or say the letters of a word in order", syllables: ["spell"] },
            { word: "skill", hint: "An ability you develop with practice", syllables: ["skill"] },
            { word: "drill", hint: "A tool for making holes, or to practice repeatedly", syllables: ["drill"] },
            { word: "chill", hint: "A cool or cold feeling", syllables: ["chill"] },
            { word: "skull", hint: "The bones that protect your brain", syllables: ["skull"] },
            { word: "press", hint: "To push firmly against something", syllables: ["press"] },
            { word: "glass", hint: "A see-through material used in windows", syllables: ["glass"] },
            { word: "cross", hint: "To go from one side to the other", syllables: ["cross"] },
            { word: "floss", hint: "Thread used to clean between your teeth", syllables: ["floss"] },
            { word: "dress", hint: "A piece of clothing, or to put clothes on", syllables: ["dress"] },
            { word: "chess", hint: "A strategy board game with kings and queens", syllables: ["chess"] },
            { word: "buzz", hint: "The sound a bee makes", syllables: ["buzz"] },
            { word: "fizz", hint: "The bubbling sound a soda makes", syllables: ["fizz"] },
            { word: "jazz", hint: "A style of music with lots of rhythm", syllables: ["jazz"] },
            { word: "fuzz", hint: "Soft fluffy stuff, like on a peach", syllables: ["fuzz"] },
        ],
    },

    // ============================
    //  UNIT 3: I Before E
    // ============================
    {
        id: "i-before-e",
        unit: 3,
        title: "I Before E (and the Exceptions)",
        icon: "🔀",
        color: "#00cec9",
        teachSlides: [
            {
                id: "intro",
                title: "I Before E!",
                content: "Hey Colton! Today we are tackling one of the most famous spelling rules in English: I before E, except after C. You have probably heard this rhyme before. It is actually really helpful most of the time, but it also has some sneaky exceptions. Let us learn the rule first, and then look at the tricky parts.",
                diagram: null,
            },
            {
                id: "the-main-rule",
                title: "The Basic Rule: I Before E",
                content: "The basic rule is simple. When you are spelling a word with I and E next to each other, the I usually comes first. I before E. Think of believe. B-E-L-I-E-V-E. The I comes before the E. Same with achieve, field, piece, and thief. In all of these words, the I comes first and the E comes second. This is the default. When in doubt, put the I first!",
                diagram: {
                    type: "comparison-table",
                    headers: ["Word", "Pattern", "Rule"],
                    rows: [
                        ["believe", "I before E", "Standard rule"],
                        ["achieve", "I before E", "Standard rule"],
                        ["field", "I before E", "Standard rule"],
                        ["piece", "I before E", "Standard rule"],
                        ["thief", "I before E", "Standard rule"],
                    ],
                    ruleNote: "I before E is the default pattern",
                },
            },
            {
                id: "after-c",
                title: "Except After C!",
                content: "Here is the exception: when the letter C comes right before the I-E pair, you flip the order. It becomes E before I. So receive is spelled R-E-C-E-I-V-E. The E comes before the I because of that C. Same with ceiling, deceive, and perceive. After the letter C, always put the E first. Think of it this way: C is a bossy letter that makes E jump ahead of I!",
                diagram: {
                    type: "comparison-table",
                    headers: ["Word", "Pattern", "Why?"],
                    rows: [
                        ["receive", "E before I", "After C"],
                        ["ceiling", "E before I", "After C"],
                        ["deceive", "E before I", "After C"],
                        ["perceive", "E before I", "After C"],
                    ],
                    ruleNote: "After C, it flips to E before I",
                },
            },
            {
                id: "interactive-fill-1",
                title: "Fill in the Blank!",
                content: "Let us test your knowledge. Look at this word and pick the right letters to fill in the blank. Think about the rule: is there a C before the blank?",
                diagram: null,
                type: "fill-the-gap",
                gapWord: "bel_ve",
                gapOptions: ["ie", "ei", "ee"],
                gapAnswer: "ie",
            },
            {
                id: "a-sound",
                title: "The A Sound Exception",
                content: "There is another part to the rhyme: or when sounding like A, as in neighbor and weigh. When the I-E combination makes an A sound, like the long A in day, then you put E before I. Neighbor has that A sound, and it is spelled N-E-I-G-H-B-O-R. Weigh also has the A sound: W-E-I-G-H. Same with vein, reign, and sleigh. If it sounds like A, go with E before I.",
                diagram: {
                    type: "comparison-table",
                    headers: ["Word", "Sound", "Pattern"],
                    rows: [
                        ["neighbor", "long A", "E before I"],
                        ["weigh", "long A", "E before I"],
                        ["vein", "long A", "E before I"],
                        ["reign", "long A", "E before I"],
                    ],
                    ruleNote: "When it sounds like A, use E before I",
                },
            },
            {
                id: "exceptions",
                title: "The Tricky Exceptions",
                content: "Now here is the honest truth: some words just break the rule. The word weird is spelled W-E-I-R-D with E before I, even though there is no C and it does not sound like A. The word their is T-H-E-I-R. And protein is P-R-O-T-E-I-N. These exceptions just have to be memorized. The good news is there are only a handful of common ones, and you will get used to them with practice.",
                diagram: {
                    type: "comparison-table",
                    headers: ["Word", "Spelling", "Note"],
                    rows: [
                        ["weird", "E before I", "Exception - just memorize"],
                        ["their", "E before I", "Exception - just memorize"],
                        ["protein", "E before I", "Exception - just memorize"],
                        ["foreign", "E before I", "Exception - just memorize"],
                    ],
                    ruleNote: "These common words break the rule",
                },
            },
            {
                id: "interactive-fill-2",
                title: "Another Fill in the Blank!",
                content: "Here is another one. Think carefully. Is there a C before the blank? Does it make an A sound? Or is it just the regular rule?",
                diagram: null,
                type: "fill-the-gap",
                gapWord: "rec_ve",
                gapOptions: ["ie", "ei", "ee"],
                gapAnswer: "ei",
            },
            {
                id: "how-to-decide",
                title: "Your Decision Checklist",
                content: "When you hit an I-E word, run through this checklist. First, is there a C right before it? If yes, use E-I. Second, does it make an A sound? If yes, use E-I. Third, is it one of the known exceptions like weird or their? If yes, use E-I. If none of those apply, go with the default: I before E. This checklist will get you the right answer almost every time!",
                diagram: null,
            },
            {
                id: "summary",
                title: "I Before E Review!",
                content: "Awesome work, Colton! Let us recap. The main rule is I before E. After the letter C, flip it to E before I. When it sounds like A, also use E before I. And a few words like weird, their, and protein are exceptions you just need to memorize. Remember the rhyme: I before E, except after C, or when sounding like A as in neighbor and weigh. Now let us practice!",
                diagram: null,
            },
        ],
        rule: "The classic rule: I before E, except after C, or when sounding like A as in 'neighbor' and 'weigh'. But there are many exceptions — some words just need to be memorized.",
        examples: [
            { without: "beleive", with: "believe", explanation: "I before E — standard rule" },
            { without: "recieve", with: "receive", explanation: "After C, it's E before I" },
            { without: "nieghbor", with: "neighbor", explanation: "Sounds like A, so E before I" },
            { without: "wierd", with: "weird", explanation: "Exception! Just memorize this one" },
        ],
        words: [
            { word: "achieve", hint: "To reach a goal through effort", syllables: ["a", "chieve"] },
            { word: "believe", hint: "To think something is true", syllables: ["be", "lieve"] },
            { word: "receive", hint: "To get something given to you", syllables: ["re", "ceive"] },
            { word: "deceive", hint: "To trick someone into believing something false", syllables: ["de", "ceive"] },
            { word: "perceive", hint: "To notice or become aware of something", syllables: ["per", "ceive"] },
            { word: "ceiling", hint: "The top surface inside a room", syllables: ["ceil", "ing"] },
            { word: "weird", hint: "Strange or unusual", syllables: ["weird"] },
            { word: "foreign", hint: "From a different country", syllables: ["for", "eign"] },
            { word: "protein", hint: "A nutrient that builds muscles", syllables: ["pro", "tein"] },
            { word: "sufficient", hint: "Enough to meet a need", syllables: ["suf", "fi", "cient"] },
        ],
    },

    // ============================
    //  UNIT 4: Prefixes
    // ============================
    {
        id: "prefixes-negative",
        unit: 4,
        title: "Prefixes: un-, dis-, mis-, in-",
        icon: "🔧",
        color: "#fdcb6e",
        teachSlides: [
            {
                id: "intro",
                title: "Negative Prefixes!",
                content: "Hey Colton! Today we are learning about prefixes, and specifically the ones that mean not or opposite. A prefix is a little chunk of letters that you stick onto the beginning of a word to change its meaning. The cool thing about prefixes is that the base word never changes its spelling. You just attach the prefix right to the front. Let us look at four really common negative prefixes: un, dis, mis, and in.",
                diagram: null,
            },
            {
                id: "un-prefix",
                title: "The UN- Prefix",
                content: "The prefix un means not. When you put un in front of a word, it means the opposite. Happy becomes unhappy, which means not happy. Fair becomes unfair, which means not fair. Comfortable becomes uncomfortable. Notice something important: the spelling of the base word does not change at all! You just stick un right on the front. Un plus happy equals unhappy. Easy!",
                diagram: {
                    type: "prefix-breakdown",
                    prefix: "un",
                    base: "happy",
                    result: "unhappy",
                    meaning: "not happy",
                },
            },
            {
                id: "dis-prefix",
                title: "The DIS- Prefix",
                content: "The prefix dis means the opposite of something or to reverse it. Agree becomes disagree, meaning to not agree. Appear becomes disappear, meaning to vanish. Connect becomes disconnect. Again, the base word stays exactly the same. You just add dis to the front. One tricky word is disappoint. Some people forget the double P, but look: dis plus appoint. The base word appoint already starts with A-P-P, so you keep all those letters!",
                diagram: {
                    type: "prefix-breakdown",
                    prefix: "dis",
                    base: "agree",
                    result: "disagree",
                    meaning: "opposite of agree",
                },
            },
            {
                id: "interactive-fill-1",
                title: "Fill in the Prefix!",
                content: "Let us see if you can pick the right prefix. Look at the word and choose which prefix makes it mean the opposite.",
                diagram: null,
                type: "fill-the-gap",
                gapWord: "_comfortable",
                gapOptions: ["un", "dis", "mis"],
                gapAnswer: "un",
            },
            {
                id: "mis-prefix",
                title: "The MIS- Prefix",
                content: "The prefix mis means wrong or badly. Spell becomes misspell, meaning to spell wrong. Understand becomes misunderstand, meaning to understand wrong. Here is a really important spelling tip: when the base word starts with S, like spell, you end up with a double S. Mis plus spell equals misspell. M-I-S-S-P-E-L-L. Both S letters stay! Do not drop one. The prefix keeps its S and the base word keeps its S.",
                diagram: {
                    type: "prefix-breakdown",
                    prefix: "mis",
                    base: "spell",
                    result: "misspell",
                    meaning: "to spell wrong (keep both S letters!)",
                },
            },
            {
                id: "in-prefix",
                title: "The IN- Prefix (and Its Disguises!)",
                content: "The prefix in also means not, but it has a cool trick: it changes its spelling depending on what letter comes next! Before the letter P or B, it becomes im. So possible becomes impossible, not inpossible. Before L, it becomes il. So legal becomes illegal. Before R, it becomes ir. So regular becomes irregular. This happens because in-possible is hard to say, but im-possible flows naturally. The prefix adapts to make the word easier to pronounce!",
                diagram: {
                    type: "prefix-breakdown",
                    prefix: "im",
                    base: "possible",
                    result: "impossible",
                    meaning: "not possible (in becomes im before P)",
                },
            },
            {
                id: "in-variants",
                title: "IN Becomes IM, IL, IR",
                content: "Let us look at all four versions of this prefix side by side. In stays as in before most letters: independent, indirect. In becomes im before P and B: impossible, imbalance. In becomes il before L: illegal, illogical. In becomes ir before R: irregular, irresponsible. The meaning is always the same: not. It is just the spelling that changes to match the next letter. Pretty clever, right?",
                diagram: {
                    type: "comparison-table",
                    headers: ["Prefix Form", "Used Before", "Example"],
                    rows: [
                        ["in-", "most letters", "independent"],
                        ["im-", "P or B", "impossible"],
                        ["il-", "L", "illegal"],
                        ["ir-", "R", "irregular"],
                    ],
                    ruleNote: "Same meaning (not), different spelling based on next letter",
                },
            },
            {
                id: "interactive-fill-2",
                title: "Pick the Right Prefix!",
                content: "Here is a trickier one. Remember, the in prefix changes its form depending on what letter comes next. Which form do you need here?",
                diagram: null,
                type: "fill-the-gap",
                gapWord: "_regular",
                gapOptions: ["in", "im", "ir"],
                gapAnswer: "ir",
            },
            {
                id: "key-reminder",
                title: "The Golden Rule of Prefixes",
                content: "Here is the most important thing to remember about all of these prefixes: the base word NEVER changes. You do not drop letters, you do not change letters. You just attach the prefix to the front. Un plus necessary equals unnecessary, with two N letters right next to each other. Mis plus spell equals misspell with two S letters. Dis plus appear equals disappear. The prefix plus the base word, no changes. That is the golden rule!",
                diagram: null,
            },
            {
                id: "summary",
                title: "Negative Prefixes Review!",
                content: "Great work, Colton! You learned four negative prefixes today. Un means not, like unhappy. Dis means opposite, like disagree. Mis means wrong, like misspell. And in means not, but it can change to im, il, or ir depending on the next letter, like impossible and irregular. The base word never changes its spelling. Just attach the prefix and you are done. Let us practice these!",
                diagram: null,
            },
        ],
        rule: "A prefix is added to the beginning of a word to change its meaning. These prefixes usually mean 'not' or 'opposite'. UN- = not. DIS- = opposite. MIS- = wrong. IN- (also IM-, IL-, IR-) = not. The spelling of the base word never changes.",
        examples: [
            { without: "unhappy", with: "unhappy", explanation: "UN + happy = not happy" },
            { without: "disagree", with: "disagree", explanation: "DIS + agree = opposite of agree" },
            { without: "misspell", with: "misspell", explanation: "MIS + spell = spell wrong (keep both S's!)" },
            { without: "impossible", with: "impossible", explanation: "IM + possible = not possible (IN becomes IM before P)" },
        ],
        words: [
            { word: "unnecessary", hint: "Not needed", syllables: ["un", "nec", "es", "sar", "y"] },
            { word: "uncomfortable", hint: "Not feeling at ease", syllables: ["un", "com", "fort", "a", "ble"] },
            { word: "disappoint", hint: "To fail to meet someone's hopes", syllables: ["dis", "ap", "point"] },
            { word: "disappear", hint: "To vanish from sight", syllables: ["dis", "ap", "pear"] },
            { word: "disconnect", hint: "To break a connection", syllables: ["dis", "con", "nect"] },
            { word: "misunderstand", hint: "To understand something wrong", syllables: ["mis", "un", "der", "stand"] },
            { word: "misspell", hint: "To spell a word incorrectly", syllables: ["mis", "spell"] },
            { word: "impossible", hint: "Cannot be done", syllables: ["im", "pos", "si", "ble"] },
            { word: "irregular", hint: "Not following the normal pattern", syllables: ["ir", "reg", "u", "lar"] },
            { word: "independent", hint: "Not depending on others", syllables: ["in", "de", "pen", "dent"] },
        ],
    },
    {
        id: "prefixes-other",
        unit: 4,
        title: "Prefixes: re-, pre-, over-, under-",
        icon: "🔁",
        color: "#f9ca24",
        teachSlides: [
            {
                id: "intro",
                title: "More Useful Prefixes!",
                content: "Hey Colton! Last lesson we learned prefixes that mean not or opposite. Today we are going to learn four more prefixes that are super useful: re, pre, over, and under. These prefixes show up everywhere in English, and once you know them, you can figure out what tons of words mean just by looking at them. Let us jump in!",
                diagram: null,
            },
            {
                id: "re-prefix",
                title: "RE- Means Again or Back",
                content: "The prefix re means again or back. When you rebuild something, you build it again. When you rewrite a paper, you write it again. When you return, you come back. This is probably the most common prefix in English. You see it everywhere: redo, replay, reread, restart, recharge. Every single time, re means you are doing something again or going back to how it was. And just like before, the base word stays the same!",
                diagram: {
                    type: "prefix-breakdown",
                    prefix: "re",
                    base: "build",
                    result: "rebuild",
                    meaning: "to build again",
                },
            },
            {
                id: "pre-prefix",
                title: "PRE- Means Before",
                content: "The prefix pre means before. A preview is when you see something before it officially comes out. Prehistoric means before history was recorded. A precaution is something you do before danger happens, to stay safe. Pre is like a time marker that tells you something happened earlier or ahead of time. Preheat the oven means heat it before you start cooking. Predetermine means decide before something happens.",
                diagram: {
                    type: "prefix-breakdown",
                    prefix: "pre",
                    base: "view",
                    result: "preview",
                    meaning: "to see before",
                },
            },
            {
                id: "interactive-fill-1",
                title: "Which Prefix Fits?",
                content: "Let us practice! Look at this word and think about the meaning. Which prefix would make sense here?",
                diagram: null,
                type: "fill-the-gap",
                gapWord: "_construct",
                gapOptions: ["re", "pre", "over"],
                gapAnswer: "re",
            },
            {
                id: "over-prefix",
                title: "OVER- Means Too Much or Above",
                content: "The prefix over means too much or above. If you overreact, you react too much. If you overwhelm someone, you are giving them more than they can handle. If you overflow, the water goes above the edge. Think of over as going beyond the normal amount. Overcooked food was cooked too long. An overachiever does more than expected. Overpriced means the price is too high. Over always means you have gone past what is normal.",
                diagram: {
                    type: "prefix-breakdown",
                    prefix: "over",
                    base: "react",
                    result: "overreact",
                    meaning: "to react too much",
                },
            },
            {
                id: "under-prefix",
                title: "UNDER- Means Too Little or Below",
                content: "The prefix under is the opposite of over. It means too little or below. If you underestimate something, you think it is less than it really is. Underground means below the ground. Underpaid means not paid enough. Under is like the low side of things. An underdog is someone who is not expected to win. Undercooked food was not cooked enough. Under and over are perfect opposites, and they work the same way as prefixes!",
                diagram: {
                    type: "prefix-breakdown",
                    prefix: "under",
                    base: "estimate",
                    result: "underestimate",
                    meaning: "to estimate too low",
                },
            },
            {
                id: "over-vs-under",
                title: "Over vs. Under Side by Side",
                content: "Let us compare over and under to really see how they are opposites. Overcooked means cooked too much. Undercooked means not cooked enough. Overpaid means paid too much. Underpaid means not paid enough. Overestimate means you guessed too high. Underestimate means you guessed too low. See the pattern? Over is always the too much side, and under is always the not enough side. They are like two ends of a scale!",
                diagram: {
                    type: "comparison-table",
                    headers: ["Over (too much)", "Under (too little)"],
                    rows: [
                        ["overcooked", "undercooked"],
                        ["overpaid", "underpaid"],
                        ["overestimate", "underestimate"],
                        ["overreact", "underreact"],
                    ],
                    ruleNote: "Over and under are perfect opposites!",
                },
            },
            {
                id: "interactive-fill-2",
                title: "Pick the Right Prefix!",
                content: "One more practice round. Think about the meaning of the sentence to figure out which prefix fits best.",
                diagram: null,
                type: "fill-the-gap",
                gapWord: "_historic",
                gapOptions: ["re", "pre", "under"],
                gapAnswer: "pre",
            },
            {
                id: "all-four",
                title: "All Four Prefixes Together",
                content: "Let us review all four prefixes one more time. Re means again or back: rebuild, rewrite, return. Pre means before: preview, prehistoric, precaution. Over means too much or above: overreact, overwhelm, overflow. Under means too little or below: underestimate, underground, underpaid. And remember the golden rule from last lesson: the base word never changes. You just stick the prefix on the front!",
                diagram: null,
            },
            {
                id: "summary",
                title: "Prefixes Review!",
                content: "Awesome job, Colton! You now know eight prefixes total: un, dis, mis, in from last lesson, plus re, pre, over, and under from today. That is a powerful toolkit! When you see a word you do not recognize, check if it starts with one of these prefixes. If it does, you can often figure out the meaning by breaking the word apart: prefix plus base word. Let us practice these!",
                diagram: null,
            },
        ],
        rule: "RE- = again or back. PRE- = before. OVER- = too much or above. UNDER- = too little or below. The base word stays the same — just attach the prefix.",
        examples: [
            { without: "rebuild", with: "rebuild", explanation: "RE + build = build again" },
            { without: "preview", with: "preview", explanation: "PRE + view = see before" },
            { without: "overcome", with: "overcome", explanation: "OVER + come = rise above" },
            { without: "underestimate", with: "underestimate", explanation: "UNDER + estimate = guess too low" },
        ],
        words: [
            { word: "reconstruct", hint: "To build something again", syllables: ["re", "con", "struct"] },
            { word: "reorganize", hint: "To arrange again in a new way", syllables: ["re", "or", "gan", "ize"] },
            { word: "reproduce", hint: "To make a copy or to create again", syllables: ["re", "pro", "duce"] },
            { word: "prehistoric", hint: "From the time before written history", syllables: ["pre", "his", "tor", "ic"] },
            { word: "precaution", hint: "A step taken ahead of time to prevent danger", syllables: ["pre", "cau", "tion"] },
            { word: "overwhelm", hint: "To be too much to handle", syllables: ["o", "ver", "whelm"] },
            { word: "overreact", hint: "To respond too strongly to something", syllables: ["o", "ver", "re", "act"] },
            { word: "underestimate", hint: "To think something is less than it really is", syllables: ["un", "der", "es", "ti", "mate"] },
            { word: "undergraduate", hint: "A college student who hasn't graduated yet", syllables: ["un", "der", "grad", "u", "ate"] },
            { word: "underprivileged", hint: "Not having the same advantages as others", syllables: ["un", "der", "priv", "i", "leged"] },
        ],
    },

    // ============================
    //  UNIT 5: Suffixes
    // ============================
    {
        id: "suffixes-tion-sion",
        unit: 5,
        title: "Suffixes: -tion vs -sion",
        icon: "🔚",
        color: "#e84393",
        teachSlides: [
            {
                id: "tion-sion-intro",
                title: "Welcome to -TION and -SION!",
                content: "Hey Colton! Today we're tackling two super common word endings: T-I-O-N and S-I-O-N. Here's the cool part — they both make the exact same sound: 'shun.' That's right, whether you see -tion or -sion at the end of a word, you say 'shun.' The tricky part is knowing which spelling to use. But don't worry — there are some handy rules that make it way easier. Let's dive in!",
                diagram: null
            },
            {
                id: "tion-sion-tion-rule",
                title: "When to Use -TION",
                content: "Let's start with -TION, because it's the more common one. You'll use -TION after most consonants, especially the letter T. Think of words like 'education' — the base is 'educate,' which ends in T, so it becomes educa-TION. Or 'competition' — 'compete' ends in a T-E, and it becomes competi-TION. If the base word ends in T or T-E, reach for -TION first.",
                diagram: { type: "suffix-transform", base: "educate", suffix: "tion", result: "education", note: "Base ends in T → use -TION" }
            },
            {
                id: "tion-sion-more-tion",
                title: "More -TION Examples",
                content: "Here are more examples to lock this in. 'Imagine' becomes 'imagination.' 'Communicate' becomes 'communication.' See the pattern? The base word ends in a T-E sound, and we swap it for -TION. This covers a huge number of English words — so when in doubt, -TION is usually your best guess.",
                diagram: { type: "suffix-transform", base: "communicate", suffix: "tion", result: "communication", note: "'-ate' ending → -TION" }
            },
            {
                id: "tion-sion-sion-rule",
                title: "When to Use -SION",
                content: "Now let's talk about -SION. You use -SION when the base word ends in D, D-E, S-E, or S-S. Here's why: 'decide' ends in D-E, so it becomes 'decision' — not 'decition.' And 'expand' ends in D, so it becomes 'expansion.' The D and S sounds in the base word are your clue to pick -SION.",
                diagram: { type: "suffix-transform", base: "decide", suffix: "sion", result: "decision", note: "Base ends in -DE → use -SION" }
            },
            {
                id: "tion-sion-interactive-sort",
                title: "Sort These Words!",
                content: "Alright, let's test what you've learned! Sort these words into the right category: does the word use -TION or -SION? Think about the base word to help you decide.",
                diagram: null,
                type: "sort-it",
                sortCategories: ["-TION words", "-SION words"],
                sortItems: [
                    { word: "education", category: 0 },
                    { word: "explosion", category: 1 },
                    { word: "competition", category: 0 },
                    { word: "television", category: 1 },
                    { word: "imagination", category: 0 },
                    { word: "conclusion", category: 1 }
                ]
            },
            {
                id: "tion-sion-confuse",
                title: "Words That Trip People Up",
                content: "Some words trip people up because they don't follow the obvious pattern. 'Permission' uses -SION because it comes from 'permit' through a Latin root ending in S-S. 'Comprehension' uses -SION because 'comprehend' ends in D. And 'profession' uses -SION because 'profess' ends in S-S. When you see double S in the base, think -SION.",
                diagram: { type: "suffix-transform", base: "confuse", suffix: "sion", result: "confusion", note: "Base ends in -SE → use -SION" }
            },
            {
                id: "tion-sion-interactive-fill",
                title: "Fill in the Gap",
                content: "Let's try another quick challenge. Look at this word and pick the right ending to complete it.",
                diagram: null,
                type: "fill-the-gap",
                gapWord: "explo_",
                gapOptions: ["-tion", "-sion", "-cion"],
                gapAnswer: "-sion"
            },
            {
                id: "tion-sion-tips",
                title: "Quick Memory Tricks",
                content: "Here are two tricks to remember. First: -TION is way more common, so if you're guessing, go with -TION. Second: if the base word has a D or S sound near the end — like 'explode,' 'confuse,' or 'expand' — switch to -SION. Think of it this way: D and S are best friends with -SION.",
                diagram: { type: "comparison-table", headers: ["Base ending", "Use this suffix"], rows: [["T or TE", "-TION"], ["D or DE", "-SION"], ["SE or SS", "-SION"]], ruleNote: "When in doubt, try -TION first" }
            },
            {
                id: "tion-sion-summary",
                title: "You've Got This!",
                content: "Great work today, Colton! Let's recap: -TION and -SION both say 'shun.' Use -TION after T sounds — that's the most common one. Use -SION when the base word ends in D, D-E, S-E, or S-S. With a little practice, you'll spell these words like a pro. Now let's practice with some words!",
                diagram: null
            }
        ],
        rule: "Both -TION and -SION make a 'shun' sound. Use -TION after most consonants (especially T). Use -SION after L, N, R, or S. If the base word ends in -DE, -SE, or -D, it usually becomes -SION.",
        examples: [
            { without: "informasion", with: "information", explanation: "After T → use -TION" },
            { without: "decition", with: "decision", explanation: "From 'decide' (ends in -DE) → -SION" },
            { without: "expantion", with: "expansion", explanation: "From 'expand' (ends in -D) → -SION" },
            { without: "confution", with: "confusion", explanation: "From 'confuse' (ends in -SE) → -SION" },
        ],
        words: [
            { word: "education", hint: "The process of learning and being taught", syllables: ["ed", "u", "ca", "tion"] },
            { word: "imagination", hint: "The ability to create pictures in your mind", syllables: ["i", "mag", "i", "na", "tion"] },
            { word: "communication", hint: "Sharing information with others", syllables: ["com", "mu", "ni", "ca", "tion"] },
            { word: "competition", hint: "A contest to see who is best", syllables: ["com", "pe", "ti", "tion"] },
            { word: "explosion", hint: "A sudden violent burst", syllables: ["ex", "plo", "sion"] },
            { word: "television", hint: "A device that shows video and sound", syllables: ["tel", "e", "vi", "sion"] },
            { word: "permission", hint: "Being allowed to do something", syllables: ["per", "mis", "sion"] },
            { word: "conclusion", hint: "The end result or final decision", syllables: ["con", "clu", "sion"] },
            { word: "comprehension", hint: "Understanding something fully", syllables: ["com", "pre", "hen", "sion"] },
            { word: "profession", hint: "A job that requires special training", syllables: ["pro", "fes", "sion"] },
        ],
    },
    {
        id: "suffixes-able-ible",
        unit: 5,
        title: "Suffixes: -able vs -ible",
        icon: "✅",
        color: "#fd79a8",
        teachSlides: [
            {
                id: "able-ible-intro",
                title: "Welcome to -ABLE and -IBLE!",
                content: "Hey Colton! Ready for another suffix lesson? Today we're looking at -ABLE and -IBLE. They both mean the same thing: 'can be done.' Something that is 'enjoyable' can be enjoyed. Something that is 'visible' can be seen. The challenge? Knowing when to use A-B-L-E and when to use I-B-L-E. Good news — there's a really helpful trick for this one!",
                diagram: null
            },
            {
                id: "able-ible-able-rule",
                title: "The -ABLE Rule",
                content: "Here's the big rule: use -ABLE when the base is a complete, real English word all by itself. 'Enjoy' is a word, right? So it becomes 'enjoyable.' 'Depend' is a word? 'Dependable.' 'Comfort' is a word? 'Comfortable.' If you can strip away the ending and you're left with a real word, -ABLE is your answer.",
                diagram: { type: "suffix-transform", base: "enjoy", suffix: "able", result: "enjoyable", note: "Base is a complete word → -ABLE" }
            },
            {
                id: "able-ible-more-able",
                title: "More -ABLE Examples",
                content: "Let's see a few more. 'Reason' is a word — so 'reasonable.' 'Fashion' is a word — so 'fashionable.' 'Notice' is a word — so 'noticeable.' See how the base always stands on its own? That's your clue. If the base word makes sense by itself, slap on -ABLE and you're good to go.",
                diagram: { type: "comparison-table", headers: ["Base word", "With -ABLE"], rows: [["reason", "reasonable"], ["fashion", "fashionable"], ["notice", "noticeable"], ["predict", "predictable"]], ruleNote: "Complete base word → use -ABLE" }
            },
            {
                id: "able-ible-ible-rule",
                title: "The -IBLE Rule",
                content: "Now for -IBLE. Use -IBLE when the base is NOT a complete word on its own. Think about 'visible' — is 'vis' a word? Nope! What about 'horrible' — is 'horr' a word? No way! Or 'incredible' — 'cred' isn't a word either. When you strip away the ending and the leftover part doesn't make sense as a word, that's your signal to use -IBLE.",
                diagram: { type: "comparison-table", headers: ["Leftover base", "Is it a word?", "Suffix"], rows: [["vis", "No", "-IBLE"], ["horr", "No", "-IBLE"], ["flex", "No", "-IBLE"], ["enjoy", "Yes!", "-ABLE"]], ruleNote: "Not a complete word → use -IBLE" }
            },
            {
                id: "able-ible-interactive-sort",
                title: "Sort These Suffixes!",
                content: "Time for a challenge! Look at each word and decide: does it use -ABLE or -IBLE? Remember the trick — check if the base is a real word on its own.",
                diagram: null,
                type: "sort-it",
                sortCategories: ["-ABLE words", "-IBLE words"],
                sortItems: [
                    { word: "comfortable", category: 0 },
                    { word: "visible", category: 1 },
                    { word: "reasonable", category: 0 },
                    { word: "horrible", category: 1 },
                    { word: "dependable", category: 0 },
                    { word: "flexible", category: 1 }
                ]
            },
            {
                id: "able-ible-exceptions",
                title: "Watch Out for Tricky Ones",
                content: "I won't lie to you, Colton — there are some exceptions. 'Compatible' uses -IBLE even though 'compat' isn't really a word you'd recognize. And 'accessible' uses -IBLE because 'access' links to a Latin root. The good news? The base-word trick works most of the time. For the exceptions, you'll learn them through practice.",
                diagram: { type: "suffix-transform", base: "access", suffix: "ible", result: "accessible", note: "Latin root → exception, uses -IBLE" }
            },
            {
                id: "able-ible-interactive-fill",
                title: "Fill in the Gap",
                content: "Let's test your skills! Which suffix completes this word correctly?",
                diagram: null,
                type: "fill-the-gap",
                gapWord: "incred_",
                gapOptions: ["-able", "-ible", "-uble"],
                gapAnswer: "-ible"
            },
            {
                id: "able-ible-frequency",
                title: "A Handy Stat",
                content: "Here's something cool: -ABLE is used way more often than -IBLE. There are hundreds of -ABLE words but only about a hundred common -IBLE words. So if you're truly stuck and can't figure out the base word, -ABLE is the safer guess. But always try the base-word test first!",
                diagram: { type: "comparison-table", headers: ["Suffix", "How common?"], rows: [["-ABLE", "Very common (hundreds of words)"], ["-IBLE", "Less common (about 100 words)"]], ruleNote: "When totally stuck, guess -ABLE" }
            },
            {
                id: "able-ible-summary",
                title: "Wrap-Up!",
                content: "Awesome job, Colton! Here's your cheat sheet: if the base is a complete English word, use -ABLE. If the base isn't a real word on its own, use -IBLE. And when in total doubt, -ABLE is more common. You're building some serious spelling skills here. Let's go practice!",
                diagram: null
            }
        ],
        rule: "Both mean 'can be done'. Use -ABLE if the base is a complete word on its own (enjoy → enjoyable). Use -IBLE if the base is NOT a complete word (vis → visible, not visable). There are exceptions, but this works most of the time.",
        examples: [
            { without: "enjoyible", with: "enjoyable", explanation: "'Enjoy' is a complete word → -ABLE" },
            { without: "visable", with: "visible", explanation: "'Vis' is not a word → -IBLE" },
            { without: "dependible", with: "dependable", explanation: "'Depend' is a complete word → -ABLE" },
            { without: "horrble", with: "horrible", explanation: "'Horr' is not a word → -IBLE" },
        ],
        words: [
            { word: "comfortable", hint: "Feeling relaxed and at ease", syllables: ["com", "fort", "a", "ble"] },
            { word: "reasonable", hint: "Fair and sensible", syllables: ["rea", "son", "a", "ble"] },
            { word: "noticeable", hint: "Easy to see or spot", syllables: ["no", "tice", "a", "ble"] },
            { word: "fashionable", hint: "In style and trendy", syllables: ["fash", "ion", "a", "ble"] },
            { word: "responsible", hint: "In charge of something or trustworthy", syllables: ["re", "spon", "si", "ble"] },
            { word: "incredible", hint: "Hard to believe because it is so amazing", syllables: ["in", "cred", "i", "ble"] },
            { word: "accessible", hint: "Easy to reach or use", syllables: ["ac", "ces", "si", "ble"] },
            { word: "flexible", hint: "Able to bend or change easily", syllables: ["flex", "i", "ble"] },
            { word: "unpredictable", hint: "Cannot be known ahead of time", syllables: ["un", "pre", "dict", "a", "ble"] },
            { word: "compatible", hint: "Able to work well together", syllables: ["com", "pat", "i", "ble"] },
        ],
    },

    // ============================
    //  UNIT 6: Tricky Combos
    // ============================
    {
        id: "ough-patterns",
        unit: 6,
        title: "The Tricky -OUGH",
        icon: "😤",
        color: "#00b894",
        teachSlides: [
            {
                id: "ough-intro",
                title: "The Wildest Letters in English!",
                content: "Colton, buckle up — we're about to tackle one of the trickiest parts of English spelling. The letters O-U-G-H can make at least five completely different sounds. Yep, the same four letters, totally different pronunciations depending on the word. It sounds unfair, but once you learn the groups, it gets a lot more manageable. Let's break it down!",
                diagram: null
            },
            {
                id: "ough-uff",
                title: "OUGH = 'uff'",
                content: "Our first sound is 'uff.' Think of 'tough,' 'rough,' and 'enough.' In these words, OUGH sounds just like U-F-F. These are some of the most common OUGH words, so this is a great place to start. If you see OUGH and the word feels short and punchy, try the 'uff' sound first.",
                diagram: { type: "sound-map", pattern: "OUGH", variants: [{ sound: "/uff/", examples: ["tough", "rough", "enough"] }] }
            },
            {
                id: "ough-oh",
                title: "OUGH = 'oh'",
                content: "Next up: the 'oh' sound. 'Though' and 'dough' both end with an 'oh' sound, like the letter O. 'Although' works the same way. This is probably the second most common OUGH pronunciation. Notice that these words often end right after the OUGH — there's usually no extra letters tacked on.",
                diagram: { type: "sound-map", pattern: "OUGH", variants: [{ sound: "/oh/", examples: ["though", "dough", "although"] }] }
            },
            {
                id: "ough-all-sounds",
                title: "The Full Sound Map",
                content: "Let's see all five sounds together. 'Uff' as in tough. 'Oh' as in though. 'Oo' as in through. 'Ow' as in bough. And 'aw' as in thought. That's five different sounds from the same four letters! The 'aw' group is special because it usually has a T at the end — thought, bought, brought, ought.",
                diagram: { type: "sound-map", pattern: "OUGH", variants: [{ sound: "/uff/", examples: ["tough", "rough"] }, { sound: "/oh/", examples: ["though", "dough"] }, { sound: "/oo/", examples: ["through"] }, { sound: "/ow/", examples: ["bough", "plough"] }, { sound: "/aw/", examples: ["thought", "bought"] }] }
            },
            {
                id: "ough-interactive-listen",
                title: "Listen and Choose!",
                content: "Let's see if you can match the sound to the word. Listen carefully to this word and pick the correct spelling.",
                diagram: null,
                type: "listen-and-choose",
                audioWord: "through",
                choices: ["thruff", "through", "throh"],
                correctChoice: 1
            },
            {
                id: "ough-ought-group",
                title: "The OUGHT Family",
                content: "The 'aw' sound group deserves extra attention because these words are super common. 'Thought,' 'bought,' 'brought,' 'ought,' and 'fought' all use OUGHT and rhyme with each other. They all have that 'aw-t' sound at the end. If a word rhymes with 'thought,' chances are it's spelled with O-U-G-H-T.",
                diagram: { type: "sound-map", pattern: "OUGHT", variants: [{ sound: "/awt/", examples: ["thought", "bought", "brought", "ought", "fought"] }] }
            },
            {
                id: "ough-interactive-listen2",
                title: "One More Listen!",
                content: "Here's another one. Listen to this word and pick the right spelling. Think about which OUGH sound group it belongs to.",
                diagram: null,
                type: "listen-and-choose",
                audioWord: "tough",
                choices: ["toff", "tough", "tow"],
                correctChoice: 1
            },
            {
                id: "ough-strategy",
                title: "How to Remember",
                content: "Here's a strategy that works: learn OUGH words in family groups. The 'uff' family: tough, rough, enough. The 'oh' family: though, dough, although. The 'oo' family: through, throughout. The 'aw-t' family: thought, bought, brought. When you learn a new OUGH word, ask yourself: which family does it belong to?",
                diagram: { type: "sound-map", pattern: "OUGH", variants: [{ sound: "/uff/", examples: ["tough", "rough", "enough"] }, { sound: "/oh/", examples: ["though", "dough"] }, { sound: "/oo/", examples: ["through", "throughout"] }, { sound: "/awt/", examples: ["thought", "bought", "brought"] }] }
            },
            {
                id: "ough-summary",
                title: "You Survived OUGH!",
                content: "You did it, Colton! OUGH is honestly one of the hardest things in English, and you just learned all five of its sounds. Remember: 'uff' like tough, 'oh' like though, 'oo' like through, 'ow' like bough, and 'aw' like thought. Learn them in families, and it'll stick. Now let's practice some words!",
                diagram: null
            }
        ],
        rule: "The letters OUGH can make many different sounds — this is one of the hardest parts of English. 'uff' (tough, rough), 'oh' (though, dough), 'oo' (through), 'ow' (bough, plough), 'aw' (thought, bought). You need to learn each word individually.",
        examples: [
            { without: "tuff", with: "tough", explanation: "OUGH = 'uff' sound" },
            { without: "thoh", with: "though", explanation: "OUGH = 'oh' sound" },
            { without: "throo", with: "through", explanation: "OUGH = 'oo' sound" },
            { without: "thawt", with: "thought", explanation: "OUGHT = 'aw-t' sound" },
        ],
        words: [
            { word: "enough", hint: "As much as you need", syllables: ["e", "nough"] },
            { word: "rough", hint: "Not smooth, bumpy", syllables: ["rough"] },
            { word: "tough", hint: "Strong and able to handle difficulty", syllables: ["tough"] },
            { word: "although", hint: "Even though, despite the fact", syllables: ["al", "though"] },
            { word: "thorough", hint: "Complete and careful, leaving nothing out", syllables: ["thor", "ough"] },
            { word: "throughout", hint: "In every part of something", syllables: ["through", "out"] },
            { word: "thought", hint: "An idea in your mind", syllables: ["thought"] },
            { word: "drought", hint: "A long period with no rain", syllables: ["drought"] },
            { word: "ought", hint: "Should, the right thing to do", syllables: ["ought"] },
            { word: "breakthrough", hint: "An important discovery or achievement", syllables: ["break", "through"] },
        ],
    },
    {
        id: "ph-gh-sounds",
        unit: 6,
        title: "PH = F and GH = F (or Silent)",
        icon: "📞",
        color: "#55efc4",
        teachSlides: [
            {
                id: "ph-gh-intro",
                title: "Hidden F Sounds!",
                content: "Hey Colton! Today we're looking at two letter combos that can make an F sound even though there's no F in sight: P-H and G-H. English borrowed a lot of words from Greek, and the Greeks used PH where we'd normally use F. Meanwhile, GH is a wildcard — sometimes it sounds like F, sometimes it's completely silent. Let's sort it all out!",
                diagram: null
            },
            {
                id: "ph-gh-ph-rule",
                title: "PH Always = F",
                content: "Here's the easy one: PH always makes an F sound. Always. No exceptions. 'Phone' sounds like 'fone.' 'Photo' sounds like 'foto.' 'Pharmacy' sounds like 'farmacy.' Why? Because these words came from ancient Greek, where the letter phi made an F sound. English kept the PH spelling to honor the Greek roots.",
                diagram: { type: "sound-map", pattern: "PH", variants: [{ sound: "/f/", examples: ["phone", "photo", "pharmacy", "graph"] }] }
            },
            {
                id: "ph-gh-ph-examples",
                title: "PH Words Are Everywhere",
                content: "You'll find PH in tons of everyday words. 'Photograph,' 'telephone,' 'paragraph,' 'physical,' 'atmosphere,' 'philosophy.' Notice that PH can appear at the beginning of a word like 'phone,' in the middle like 'telephone,' or at the end like 'graph.' Wherever it shows up, it always says F.",
                diagram: { type: "sound-map", pattern: "PH", variants: [{ sound: "/f/ at start", examples: ["phone", "photo", "physical"] }, { sound: "/f/ at end", examples: ["graph", "triumph", "telegraph"] }] }
            },
            {
                id: "ph-gh-gh-f",
                title: "GH = F (Sometimes)",
                content: "Now GH is trickier. Sometimes GH makes an F sound, but only at the end of a word or syllable. Think of 'laugh,' 'cough,' 'enough,' and 'rough.' In these words, GH at the end sounds like F. But this only happens in certain words — you can't predict it from a rule alone, so you need to learn these words.",
                diagram: { type: "sound-map", pattern: "GH", variants: [{ sound: "/f/", examples: ["laugh", "cough", "enough", "rough"] }] }
            },
            {
                id: "ph-gh-interactive-tap",
                title: "Tap the Pattern!",
                content: "Let's practice spotting these letter combos. Find the PH in this word — the part that makes the F sound.",
                diagram: null,
                type: "tap-the-pattern",
                tapWord: "photograph",
                tapTarget: "ph",
                tapExplanation: "Both the PH at the start (pho-) and the PH at the end (-graph) make the F sound!"
            },
            {
                id: "ph-gh-silent",
                title: "GH = Silent!",
                content: "Here's where GH gets really interesting. In many words, GH makes no sound at all — it's completely silent! 'Night,' 'daughter,' 'weight,' 'neighbor,' 'straight,' 'fight.' In these words, the GH is just there for historical reasons. English used to pronounce these sounds hundreds of years ago, but we stopped while keeping the old spelling.",
                diagram: { type: "sound-map", pattern: "GH", variants: [{ sound: "silent", examples: ["night", "daughter", "weight", "fight", "straight"] }] }
            },
            {
                id: "ph-gh-gh-start",
                title: "GH at the Start = Hard G",
                content: "One more GH rule: when GH appears at the very start of a word, it always makes a hard G sound — like a regular G. 'Ghost,' 'ghastly,' 'ghee,' 'gherkin.' There aren't many of these words, but they're good to know. So GH has three possible sounds: F at the end, silent in the middle, and hard G at the start.",
                diagram: { type: "sound-map", pattern: "GH", variants: [{ sound: "/g/ at start", examples: ["ghost", "ghastly"] }, { sound: "/f/ at end", examples: ["laugh", "cough"] }, { sound: "silent", examples: ["night", "daughter"] }] }
            },
            {
                id: "ph-gh-interactive-tap2",
                title: "Find the Silent GH!",
                content: "Now try spotting the silent letters. Tap the GH in this word — the part that makes no sound at all.",
                diagram: null,
                type: "tap-the-pattern",
                tapWord: "daughter",
                tapTarget: "gh",
                tapExplanation: "The GH in 'daughter' is completely silent — you just say 'daw-ter.'"
            },
            {
                id: "ph-gh-summary",
                title: "Great Work!",
                content: "Nice job, Colton! Let's recap: PH always makes an F sound — no exceptions. GH is trickier: it can be F at the end of a word, silent in the middle, or a hard G at the start. The key with GH is learning which words use which sound. PH is your reliable friend, and GH is the wildcard. Let's go practice!",
                diagram: null
            }
        ],
        rule: "PH always makes an F sound — it comes from Greek words. GH sometimes makes an F sound (laugh, cough) and is sometimes silent (night, daughter). At the start of a word, GH is always hard G (ghost, ghastly).",
        examples: [
            { without: "fonetic", with: "phonetic", explanation: "PH = F sound (from Greek)" },
            { without: "laf", with: "laugh", explanation: "GH = F sound at end of word" },
            { without: "nite", with: "night", explanation: "GH is silent after I" },
            { without: "gost", with: "ghost", explanation: "GH = hard G at start of word" },
        ],
        words: [
            { word: "photograph", hint: "A picture taken with a camera", syllables: ["pho", "to", "graph"] },
            { word: "philosophy", hint: "The study of big questions about life and meaning", syllables: ["phi", "los", "o", "phy"] },
            { word: "paragraph", hint: "A section of writing with related sentences", syllables: ["par", "a", "graph"] },
            { word: "telephone", hint: "A device for talking to someone far away", syllables: ["tel", "e", "phone"] },
            { word: "laughter", hint: "The sound of laughing", syllables: ["laugh", "ter"] },
            { word: "daughter", hint: "A female child", syllables: ["daugh", "ter"] },
            { word: "straightforward", hint: "Simple and easy to understand", syllables: ["straight", "for", "ward"] },
            { word: "neighborhood", hint: "The area around where you live", syllables: ["neigh", "bor", "hood"] },
            { word: "physical", hint: "Related to the body", syllables: ["phys", "i", "cal"] },
            { word: "atmosphere", hint: "The layer of air around Earth", syllables: ["at", "mos", "phere"] },
        ],
    },

    // ============================
    //  UNIT 7: Commonly Confused
    // ============================
    {
        id: "confused-words",
        unit: 7,
        title: "Commonly Confused Words",
        icon: "🤔",
        color: "#0984e3",
        teachSlides: [
            {
                id: "confused-intro",
                title: "Words That Love to Trick You!",
                content: "Hey Colton! Today we're dealing with words that confuse everyone — even adults. These are words that sound the same or almost the same but are spelled differently and mean totally different things. They're called homophones, and they're one of the sneakiest parts of English. But once you learn the differences, you'll catch mistakes that most people miss!",
                diagram: null
            },
            {
                id: "confused-there",
                title: "There, Their, They're",
                content: "Let's start with the most famous trio. 'There' means a place — 'over there.' Think: t-h-e-r-e has the word 'here' in it, and 'here' is a place. 'Their' means belonging to them — 'their house.' Think: t-h-e-i-r has the word 'heir' in it, someone who inherits things. 'They're' is short for 'they are' — the apostrophe replaces the missing A.",
                diagram: { type: "highlight-word", words: [{ word: "there", highlight: "here", note: "A place (has 'here' in it)", color: "#0984e3" }, { word: "their", highlight: "heir", note: "Belonging to them", color: "#e17055" }, { word: "they're", highlight: "'re", note: "They ARE (contraction)", color: "#00b894" }] }
            },
            {
                id: "confused-its",
                title: "It's vs Its",
                content: "This one trips up everybody. 'It's' with an apostrophe always means 'it is' or 'it has.' That's it. If you can replace the word with 'it is' and the sentence still works, use the apostrophe. 'Its' without an apostrophe means 'belonging to it' — like 'the dog wagged its tail.' I know it seems backwards, but possessive 'its' has no apostrophe, just like 'his' and 'hers' don't.",
                diagram: { type: "highlight-word", words: [{ word: "it's", highlight: "'s", note: "It IS or it HAS (contraction)", color: "#e17055" }, { word: "its", highlight: "its", note: "Belonging to it (no apostrophe!)", color: "#0984e3" }] }
            },
            {
                id: "confused-affect-effect",
                title: "Affect vs Effect",
                content: "Here's a pair that even adults struggle with. 'Affect' with an A is usually a verb — it means to influence something. 'The rain will affect the game.' 'Effect' with an E is usually a noun — it means the result. 'The effect of the rain was a muddy field.' Memory trick: A for Action (affect is the action verb), E for End result (effect is the noun).",
                diagram: { type: "highlight-word", words: [{ word: "affect", highlight: "a", note: "A = Action (verb)", color: "#e17055" }, { word: "effect", highlight: "e", note: "E = End result (noun)", color: "#0984e3" }] }
            },
            {
                id: "confused-interactive-listen",
                title: "Listen and Choose!",
                content: "Let's test your ear. Listen to this sentence and pick the correct spelling of the missing word: 'The weather will ___ our plans.'",
                diagram: null,
                type: "listen-and-choose",
                audioWord: "affect",
                choices: ["affect", "effect", "affeckt"],
                correctChoice: 0
            },
            {
                id: "confused-tricky-spellings",
                title: "Commonly Misspelled Words",
                content: "Some words aren't homophones but are just easy to misspell. 'Definitely' — people write 'definately,' but there's no A. Think: it has the word 'finite' in it. 'Separate' — people write 'seperate,' but remember: there's 'a rat' hiding in sep-A-RAT-e. 'Necessary' — one C, two S's. Think: one Collar, two Socks.",
                diagram: { type: "highlight-word", words: [{ word: "definitely", highlight: "finite", note: "Has 'finite' in it — no A!", color: "#e17055" }, { word: "separate", highlight: "a rat", note: "A RAT hides inside!", color: "#00b894" }, { word: "necessary", highlight: "ss", note: "One C, two S's (1 Collar, 2 Socks)", color: "#0984e3" }] }
            },
            {
                id: "confused-interactive-listen2",
                title: "Pick the Right Spelling!",
                content: "One more challenge. Listen to this word and pick the correct way to spell it.",
                diagram: null,
                type: "listen-and-choose",
                audioWord: "definitely",
                choices: ["definately", "definitely", "definetly"],
                correctChoice: 1
            },
            {
                id: "confused-more-traps",
                title: "More Spelling Traps",
                content: "A few more to watch for: 'privilege' has no D — it's not 'priviledge.' 'Occurrence' has double C and double R. 'Independent' ends in E-N-T, not A-N-T. And 'maintenance' — think of 'main-ten-ance,' breaking it into chunks helps you spell it right. These words are tough, but learning them puts you ahead of most people.",
                diagram: { type: "highlight-word", words: [{ word: "privilege", highlight: "lege", note: "No D — not 'ledge'!", color: "#e17055" }, { word: "occurrence", highlight: "cc...rr", note: "Double C and double R", color: "#0984e3" }] }
            },
            {
                id: "confused-summary",
                title: "You're a Word Detective!",
                content: "Great work, Colton! Remember: 'there' is a place, 'their' is ownership, 'they're' is 'they are.' 'It's' always means 'it is.' 'Affect' is the action, 'effect' is the result. And for tricky spellings, use memory tricks like 'a rat in separate' and 'finite in definitely.' You've got some powerful tools now. Let's practice!",
                diagram: null
            }
        ],
        rule: "Some words sound the same (or nearly the same) but are spelled differently and mean different things. These are called homophones. You need to know which spelling matches which meaning.",
        examples: [
            { without: "there going", with: "they're going", explanation: "THEY'RE = they are" },
            { without: "over their", with: "over there", explanation: "THERE = a place" },
            { without: "its raining", with: "it's raining", explanation: "IT'S = it is" },
            { without: "the affect", with: "the effect", explanation: "EFFECT = noun (the result)" },
        ],
        words: [
            { word: "definitely", hint: "Without any doubt (not 'definately')", syllables: ["def", "i", "nite", "ly"] },
            { word: "separate", hint: "To divide apart (not 'seperate' — think 'a rat' in the middle)", syllables: ["sep", "a", "rate"] },
            { word: "necessary", hint: "Needed (one C, two S's — one Collar, two Socks)", syllables: ["nec", "es", "sar", "y"] },
            { word: "occasion", hint: "A special event (two C's, one S)", syllables: ["oc", "ca", "sion"] },
            { word: "independent", hint: "Not relying on others (ends in -ent, not -ant)", syllables: ["in", "de", "pen", "dent"] },
            { word: "existence", hint: "The state of being real (ends in -ence, not -ance)", syllables: ["ex", "is", "tence"] },
            { word: "privilege", hint: "A special right or advantage (no D — not 'priviledge')", syllables: ["priv", "i", "lege"] },
            { word: "schedule", hint: "A plan for when things happen", syllables: ["sched", "ule"] },
            { word: "maintenance", hint: "Keeping something in good condition (main + ten + ance)", syllables: ["main", "ten", "ance"] },
            { word: "occurrence", hint: "Something that happens (double C, double R)", syllables: ["oc", "cur", "rence"] },
        ],
    },

    // ============================
    //  UNIT 8: Greek & Latin Roots
    // ============================
    {
        id: "greek-roots",
        unit: 8,
        title: "Greek Roots: bio, graph, phon, scope",
        icon: "🏛️",
        color: "#d63031",
        teachSlides: [
            {
                id: "greek-intro",
                title: "Unlock Words with Greek Roots!",
                content: "Colton, this lesson is like getting a superpower. A huge number of English words are built from ancient Greek word parts called roots. If you learn just a handful of these roots, you can figure out the meaning of words you've never even seen before. It's like having a secret decoder ring for English. Let's learn the most important Greek roots!",
                diagram: null
            },
            {
                id: "greek-bio",
                title: "BIO = Life",
                content: "Our first root is BIO, which means 'life.' When you see BIO in a word, it's always connected to living things. 'Biology' is the study of life. 'Biography' is the written story of someone's life. 'Antibiotic' is medicine that works against living bacteria. See how knowing BIO helps you understand all these words?",
                diagram: { type: "root-tree", root: "bio", meaning: "life", branches: ["biology", "biography", "antibiotic"] }
            },
            {
                id: "greek-graph",
                title: "GRAPH = Write or Draw",
                content: "Next up: GRAPH, meaning 'to write' or 'to draw.' A 'photograph' is light writing — drawing with light. An 'autograph' is writing your own name. 'Geography' is writing about the earth. Notice how GRAPH often appears at the end of words. It tells you the word involves recording or writing something down.",
                diagram: { type: "root-tree", root: "graph", meaning: "write/draw", branches: ["photograph", "autograph", "geography"] }
            },
            {
                id: "greek-phon",
                title: "PHON = Sound",
                content: "PHON means 'sound.' A 'telephone' carries sound far away. A 'microphone' makes small sounds bigger. A 'symphony' means sounds played together. And remember our PH lesson? 'Phon' itself uses PH to make the F sound — because it's Greek! These roots connect to each other, which makes them easier to remember.",
                diagram: { type: "root-tree", root: "phon", meaning: "sound", branches: ["telephone", "microphone", "symphony"] }
            },
            {
                id: "greek-interactive-tap",
                title: "Find the Root!",
                content: "Let's practice spotting roots in real words. Tap the Greek root hiding inside this word.",
                diagram: null,
                type: "tap-the-pattern",
                tapWord: "autobiography",
                tapTarget: "bio",
                tapExplanation: "BIO means 'life' — an autobiography is the story of your own life, written by you!"
            },
            {
                id: "greek-scope-tele-auto",
                title: "SCOPE, TELE, and AUTO",
                content: "Three more roots to add to your toolkit. SCOPE means 'to see or watch' — a telescope lets you see far, a microscope lets you see small things. TELE means 'far' — television brings pictures from far away. AUTO means 'self' — an automobile moves by itself, and automatic means it works by itself.",
                diagram: { type: "root-tree", root: "scope", meaning: "see/watch", branches: ["telescope", "microscope", "horoscope"] }
            },
            {
                id: "greek-combining",
                title: "Combining Roots",
                content: "Here's where it gets really cool. Greek roots stack together like building blocks. 'Autobiography' is AUTO (self) plus BIO (life) plus GRAPH (write) — writing about your own life. 'Telephone' is TELE (far) plus PHONE (sound) — sound from far away. Once you know the pieces, you can decode almost any Greek-based word!",
                diagram: { type: "root-tree", root: "tele", meaning: "far", branches: ["telephone", "telescope", "television"] }
            },
            {
                id: "greek-interactive-tap2",
                title: "Spot Another Root!",
                content: "One more round! Find the Greek root in this word that tells you what the word is about.",
                diagram: null,
                type: "tap-the-pattern",
                tapWord: "microscope",
                tapTarget: "scope",
                tapExplanation: "SCOPE means 'to see' — a microscope lets you see tiny things up close!"
            },
            {
                id: "greek-summary",
                title: "You're a Root Detective!",
                content: "Amazing work, Colton! You've just learned six Greek roots: BIO means life, GRAPH means write, PHON means sound, SCOPE means see, TELE means far, and AUTO means self. These six roots unlock hundreds of English words. Whenever you see a big, unfamiliar word, look for these roots — they'll help you crack the code. Time to practice!",
                diagram: null
            }
        ],
        rule: "Many English words come from Greek roots. BIO = life. GRAPH/GRAM = write/draw. PHON = sound. SCOPE = see/watch. AUTO = self. TELE = far. If you learn these roots, you can decode words you've never seen before.",
        examples: [
            { without: "life study", with: "biology", explanation: "BIO (life) + LOGY (study of)" },
            { without: "far sound", with: "telephone", explanation: "TELE (far) + PHONE (sound)" },
            { without: "self life story", with: "autobiography", explanation: "AUTO (self) + BIO (life) + GRAPH (write)" },
            { without: "small see", with: "microscope", explanation: "MICRO (small) + SCOPE (see)" },
        ],
        words: [
            { word: "biography", hint: "A written story of someone's life", syllables: ["bi", "og", "ra", "phy"] },
            { word: "geography", hint: "The study of Earth's places and features", syllables: ["ge", "og", "ra", "phy"] },
            { word: "autograph", hint: "A person's own signature", syllables: ["au", "to", "graph"] },
            { word: "microphone", hint: "A device that picks up sound", syllables: ["mi", "cro", "phone"] },
            { word: "telescope", hint: "A device for seeing things far away", syllables: ["tel", "e", "scope"] },
            { word: "microscope", hint: "A device for seeing very small things", syllables: ["mi", "cro", "scope"] },
            { word: "autobiography", hint: "A story of your own life written by you", syllables: ["au", "to", "bi", "og", "ra", "phy"] },
            { word: "photography", hint: "The art of taking pictures", syllables: ["pho", "tog", "ra", "phy"] },
            { word: "symphony", hint: "A large musical composition for an orchestra", syllables: ["sym", "pho", "ny"] },
            { word: "antibiotics", hint: "Medicine that kills bacteria", syllables: ["an", "ti", "bi", "ot", "ics"] },
        ],
    },
    {
        id: "latin-roots",
        unit: 8,
        title: "Latin Roots: rupt, struct, port, ject",
        icon: "📚",
        color: "#e55039",
        teachSlides: [
            {
                id: "latin-intro",
                title: "Latin Roots — The Building Blocks!",
                content: "Hey Colton! Last lesson we learned Greek roots, and now it's time for Latin roots. Latin was the language of ancient Rome, and a massive chunk of English comes from it — especially words used in school, science, and everyday life. Learning these roots is like having X-ray vision for big words. Let's get started!",
                diagram: null
            },
            {
                id: "latin-rupt",
                title: "RUPT = Break",
                content: "Our first Latin root is RUPT, meaning 'to break.' An 'interruption' is when someone breaks into your conversation. An 'eruption' is when a volcano breaks out. 'Corruption' is when trust is broken. 'Rupture' means something literally breaks apart. Whenever you see RUPT in a word, think: something is breaking!",
                diagram: { type: "root-tree", root: "rupt", meaning: "break", branches: ["interrupt", "eruption", "corruption", "rupture"] }
            },
            {
                id: "latin-struct",
                title: "STRUCT = Build",
                content: "Next: STRUCT means 'to build.' 'Construction' is the act of building something together. 'Destruction' is building something apart — wait, that's the opposite! DE means 'un-do,' so destruction is un-building. 'Infrastructure' is the basic structures a society is built on. And 'instruction' is building knowledge in someone's mind.",
                diagram: { type: "root-tree", root: "struct", meaning: "build", branches: ["construction", "destruction", "infrastructure", "instruction"] }
            },
            {
                id: "latin-port",
                title: "PORT = Carry",
                content: "PORT means 'to carry.' 'Transportation' is carrying things across distances. 'Export' is carrying goods out of a country. 'Import' is carrying goods into a country. Even 'portable' means something that can be carried. A port is where ships carry goods in and out. This root is everywhere once you start looking!",
                diagram: { type: "root-tree", root: "port", meaning: "carry", branches: ["transport", "export", "import", "portable"] }
            },
            {
                id: "latin-interactive-tap",
                title: "Find the Latin Root!",
                content: "Time to put your root-finding skills to work. Tap the Latin root hiding inside this word.",
                diagram: null,
                type: "tap-the-pattern",
                tapWord: "interrupt",
                tapTarget: "rupt",
                tapExplanation: "RUPT means 'break' — to interrupt is to break into the middle of something!"
            },
            {
                id: "latin-ject",
                title: "JECT = Throw",
                content: "JECT means 'to throw.' An 'injection' is throwing medicine into your body with a needle. A 'projection' is throwing an image forward onto a screen. To 'reject' is to throw something back. And a 'subject' is something thrown under discussion. The throwing meaning isn't always literal, but it's always there if you look closely.",
                diagram: { type: "root-tree", root: "ject", meaning: "throw", branches: ["injection", "projection", "reject", "subject"] }
            },
            {
                id: "latin-dict-duct",
                title: "DICT = Say, DUCT = Lead",
                content: "Two more powerful roots! DICT means 'to say or speak.' A 'dictionary' tells you what words say. 'Predict' means to say something before it happens. 'Dictate' means to say words for someone to write down. DUCT means 'to lead.' 'Conduct' means to lead together. 'Introduction' means leading someone into something new.",
                diagram: { type: "root-tree", root: "dict", meaning: "say/speak", branches: ["dictionary", "predict", "dictate", "contradict"] }
            },
            {
                id: "latin-interactive-tap2",
                title: "Spot the Root!",
                content: "One more challenge! Find the Latin root in this word that tells you its core meaning.",
                diagram: null,
                type: "tap-the-pattern",
                tapWord: "destruction",
                tapTarget: "struct",
                tapExplanation: "STRUCT means 'build' — destruction is the opposite of building, it means tearing something down!"
            },
            {
                id: "latin-prefixes",
                title: "Roots + Prefixes = Power",
                content: "Here's a pro tip: Latin roots become even more powerful when you pair them with prefixes. EX means 'out' — export is carry out. IN means 'in' — inject is throw in. DE means 'down or apart' — destruction is building apart. RE means 'back' — reject is throw back. Prefix plus root gives you the whole meaning!",
                diagram: { type: "root-tree", root: "port", meaning: "carry", branches: ["export (carry out)", "import (carry in)", "transport (carry across)", "deport (carry away)"] }
            },
            {
                id: "latin-summary",
                title: "Root Master!",
                content: "Incredible work, Colton! You now know six Latin roots: RUPT means break, STRUCT means build, PORT means carry, JECT means throw, DICT means say, and DUCT means lead. Combined with the Greek roots from last lesson, you can decode dozens and dozens of English words just by looking at their parts. That's a real superpower. Let's practice!",
                diagram: null
            }
        ],
        rule: "Latin roots are everywhere in English. RUPT = break. STRUCT = build. PORT = carry. JECT = throw. DICT = say/speak. DUCT = lead. Knowing these helps you figure out unfamiliar words.",
        examples: [
            { without: "break apart", with: "interrupt", explanation: "INTER (between) + RUPT (break)" },
            { without: "build together", with: "construct", explanation: "CON (together) + STRUCT (build)" },
            { without: "carry out", with: "export", explanation: "EX (out) + PORT (carry)" },
            { without: "throw back", with: "reject", explanation: "RE (back) + JECT (throw)" },
        ],
        words: [
            { word: "interrupt", hint: "To break into a conversation", syllables: ["in", "ter", "rupt"] },
            { word: "corruption", hint: "Dishonest behavior that breaks trust", syllables: ["cor", "rup", "tion"] },
            { word: "destruction", hint: "The act of breaking something completely", syllables: ["de", "struc", "tion"] },
            { word: "infrastructure", hint: "The basic systems a society is built on", syllables: ["in", "fra", "struc", "ture"] },
            { word: "transportation", hint: "Carrying people or goods from place to place", syllables: ["trans", "por", "ta", "tion"] },
            { word: "opportunity", hint: "A chance (carries you toward something)", syllables: ["op", "por", "tu", "ni", "ty"] },
            { word: "injection", hint: "Throwing medicine into the body with a needle", syllables: ["in", "jec", "tion"] },
            { word: "projection", hint: "Throwing an image forward onto a screen", syllables: ["pro", "jec", "tion"] },
            { word: "dictionary", hint: "A book that speaks the meaning of words", syllables: ["dic", "tion", "ar", "y"] },
            { word: "introduction", hint: "Leading someone into a new topic or person", syllables: ["in", "tro", "duc", "tion"] },
        ],
    },

    // ============================
    //  UNIT 9: Plurals & Word Endings
    // ============================
    {
        id: "plural-rules",
        unit: 9,
        title: "Tricky Plurals",
        icon: "📦",
        color: "#636e72",
        teachSlides: [
            {
                id: "plural-intro",
                title: "Welcome to Plurals!",
                content: "Hey Colton! Today we're going to learn about making words plural — that just means turning one thing into more than one thing. Most of the time it's easy, but English has some tricky rules that trip people up. Let's walk through them together so you'll always know which ending to use.",
                diagram: null
            },
            {
                id: "plural-s-es",
                title: "The Basic Rules: -S and -ES",
                content: "The simplest rule is this: most words just add S to become plural. Cat becomes cats, dog becomes dogs. But if a word ends in S, SH, CH, X, or Z, you need to add ES instead. Think about it — try saying 'boxs' out loud. It's really hard! That extra E makes it possible to pronounce.",
                diagram: { type: "suffix-transform", base: "box", suffix: "es", result: "boxes", note: "Words ending in S, SH, CH, X, Z need -ES" }
            },
            {
                id: "plural-y-rule",
                title: "The Y Rule",
                content: "Here's where it gets interesting. If a word ends in a consonant plus Y, you change the Y to I and add ES. So 'city' becomes 'cities' and 'story' becomes 'stories'. But be careful — if there's a vowel before the Y, you just add S normally. 'Day' becomes 'days' and 'key' becomes 'keys'.",
                diagram: { type: "suffix-transform", base: "city", suffix: "ies", result: "cities", note: "Consonant + Y: change Y to I, add -ES" }
            },
            {
                id: "plural-sort-1",
                title: "Let's Sort These!",
                content: "Alright, let's practice! Sort these words by whether they add just -S or need -ES.",
                type: "sort-it",
                sortCategories: ["Add -S", "Add -ES"],
                sortItems: [
                    { word: "cats", category: 0 },
                    { word: "dishes", category: 1 },
                    { word: "trees", category: 0 },
                    { word: "foxes", category: 1 },
                    { word: "buses", category: 1 },
                    { word: "books", category: 0 }
                ],
                diagram: null
            },
            {
                id: "plural-f-fe",
                title: "The F and FE Rule",
                content: "This one is pretty cool. Many words that end in F or FE change to VES when they become plural. Knife becomes knives. Wolf becomes wolves. Leaf becomes leaves. It's like the F softens into a V sound. Not all F words do this — 'roofs' stays 'roofs' — but many of the common ones do.",
                diagram: { type: "suffix-transform", base: "knife", suffix: "ves", result: "knives", note: "FE drops off, add -VES" }
            },
            {
                id: "plural-irregular",
                title: "Irregular Plurals",
                content: "Some words just break all the rules, and you have to memorize them. Child becomes children. Person becomes people. Mouse becomes mice. Tooth becomes teeth. The good news is there aren't that many of these, and you probably already know most of them from everyday talking!",
                diagram: null
            },
            {
                id: "plural-sort-2",
                title: "Sort the Tricky Plurals!",
                content: "Now let's sort some trickier ones. Which of these follow the Y-to-IES rule, and which change F to VES?",
                type: "sort-it",
                sortCategories: ["Y to IES", "F to VES"],
                sortItems: [
                    { word: "cities", category: 0 },
                    { word: "knives", category: 1 },
                    { word: "stories", category: 0 },
                    { word: "wolves", category: 1 },
                    { word: "parties", category: 0 },
                    { word: "leaves", category: 1 }
                ],
                diagram: null
            },
            {
                id: "plural-greek-latin",
                title: "Fancy Plurals from Greek and Latin",
                content: "Some words that came to English from Greek or Latin have their own special plural forms. Analysis becomes analyses. Phenomenon becomes phenomena. Criterion becomes criteria. These show up a lot in school and science writing. When you see words like these, remember they follow the rules of their original language.",
                diagram: null
            },
            {
                id: "plural-summary",
                title: "Plural Rules Recap",
                content: "Great work today, Colton! Let's recap. Most words just add S. Words ending in S, SH, CH, X, or Z add ES. Consonant plus Y changes to IES. Many F and FE words change to VES. And a few irregular words just need to be memorized. You've got this!",
                diagram: null
            }
        ],
        rule: "Most words add -S. Words ending in S, SH, CH, X, Z add -ES. Words ending in consonant + Y change Y to I and add -ES (city → cities). Words ending in F or FE often change to -VES (knife → knives). Some are irregular (child → children).",
        examples: [
            { without: "boxs", with: "boxes", explanation: "Ends in X → add -ES" },
            { without: "citys", with: "cities", explanation: "Consonant + Y → change to -IES" },
            { without: "knifes", with: "knives", explanation: "FE → VES" },
            { without: "childs", with: "children", explanation: "Irregular — just memorize it" },
        ],
        words: [
            { word: "categories", hint: "Groups or classes of things (category → categories)", syllables: ["cat", "e", "gor", "ies"] },
            { word: "opportunities", hint: "Chances to do something (opportunity → opportunities)", syllables: ["op", "por", "tu", "ni", "ties"] },
            { word: "responsibilities", hint: "Duties you are in charge of", syllables: ["re", "spon", "si", "bil", "i", "ties"] },
            { word: "strategies", hint: "Plans for achieving goals", syllables: ["strat", "e", "gies"] },
            { word: "boundaries", hint: "Lines that mark the edge of an area", syllables: ["bound", "a", "ries"] },
            { word: "themselves", hint: "Used when they do something to their own group", syllables: ["them", "selves"] },
            { word: "analyses", hint: "Detailed examinations of something (analysis → analyses)", syllables: ["a", "nal", "y", "ses"] },
            { word: "phenomena", hint: "Observable events (phenomenon → phenomena)", syllables: ["phe", "nom", "e", "na"] },
            { word: "criteria", hint: "Standards for judging (criterion → criteria)", syllables: ["cri", "te", "ri", "a"] },
            { word: "consequences", hint: "Results of actions", syllables: ["con", "se", "quen", "ces"] },
        ],
    },
    // ============================
    //  UNIT 10: Vowel Patterns
    // ============================
    {
        id: "vowel-teams",
        unit: 10,
        title: "Vowel Teams (ai, ea, oa, ee)",
        icon: "👥",
        color: "#74b9ff",
        teachSlides: [
            {
                id: "vowel-teams-intro",
                title: "Vowel Teams Are Best Friends!",
                content: "Hey Colton! Today we're learning about vowel teams. When two vowels appear side by side in a word, they team up to make just one sound. There's a handy rhyme for this: 'When two vowels go walking, the first one does the talking.' That means the first vowel usually says its long sound, and the second vowel stays quiet.",
                diagram: null
            },
            {
                id: "vowel-teams-ai",
                title: "The AI Team",
                content: "Let's start with the AI team. When you see A and I together, they make the long A sound — like in 'rain', 'brain', and 'explain'. The A does the talking and says its name, while the I stays silent. You'll find AI in the middle of lots of common words.",
                diagram: { type: "vowel-team", team: "ai", sound: "long A", examples: ["rain", "brain", "explain"] }
            },
            {
                id: "vowel-teams-ea",
                title: "The EA Team",
                content: "Next up is EA. This team usually makes the long E sound — like in 'mean', 'release', and 'defeat'. The E does the talking and the A stays quiet. EA is one of the most common vowel teams you'll see in English words.",
                diagram: { type: "vowel-team", team: "ea", sound: "long E", examples: ["mean", "release", "defeat"] }
            },
            {
                id: "vowel-teams-tap-1",
                title: "Find the Vowel Team!",
                content: "Let's practice spotting vowel teams. Tap on the vowel team hiding inside this word!",
                type: "tap-the-pattern",
                tapWord: "explain",
                tapTarget: "ai",
                tapExplanation: "The AI vowel team makes the long A sound in 'explain'.",
                diagram: null
            },
            {
                id: "vowel-teams-oa",
                title: "The OA Team",
                content: "The OA team makes the long O sound — like in 'boat', 'approach', and 'coach'. The O says its name and the A is silent. When you hear a long O sound in the middle of a word, OA is one of the spellings to try.",
                diagram: { type: "vowel-team", team: "oa", sound: "long O", examples: ["boat", "approach", "coach"] }
            },
            {
                id: "vowel-teams-ee",
                title: "The EE Team",
                content: "Finally, let's look at EE. Two E's together make the long E sound — like in 'succeed', 'proceed', and 'sleep'. This one is easy to remember because both letters are the same! When you hear a long E, it might be spelled EE or EA — that's the tricky part.",
                diagram: { type: "vowel-team", team: "ee", sound: "long E", examples: ["succeed", "proceed", "sleep"] }
            },
            {
                id: "vowel-teams-tap-2",
                title: "Spot Another Vowel Team!",
                content: "Great job! Now find the vowel team in this word.",
                type: "tap-the-pattern",
                tapWord: "approach",
                tapTarget: "oa",
                tapExplanation: "The OA vowel team makes the long O sound in 'approach'.",
                diagram: null
            },
            {
                id: "vowel-teams-exceptions",
                title: "A Few Surprises",
                content: "Now, I should be honest with you — this rule works most of the time, but not always. Sometimes EA makes a short E sound, like in 'bread' and 'head'. And sometimes vowel pairs make unexpected sounds. But the 'first one does the talking' rule is a great starting point that works for most words you'll see.",
                diagram: null
            },
            {
                id: "vowel-teams-summary",
                title: "Vowel Teams Recap",
                content: "Awesome work, Colton! Remember: AI says long A, EA usually says long E, OA says long O, and EE says long E. When two vowels go walking, the first one does the talking. Keep your eyes open for these teams in your reading — once you start noticing them, you'll see them everywhere!",
                diagram: null
            }
        ],
        rule: "When two vowels appear side by side, they often work as a team to make one sound. Usually the first vowel says its name (long sound) and the second is silent. Remember the rhyme: 'When two vowels go walking, the first one does the talking.'",
        examples: [
            { without: "rane", with: "rain", explanation: "AI makes the long A sound" },
            { without: "bote", with: "boat", explanation: "OA makes the long O sound" },
            { without: "meen", with: "mean", explanation: "EA makes the long E sound" },
            { without: "slep", with: "sleep", explanation: "EE makes the long E sound" },
        ],
        words: [
            { word: "explain", hint: "To make something clear to someone", syllables: ["ex", "plain"] },
            { word: "approach", hint: "To come closer to something", syllables: ["ap", "proach"] },
            { word: "proceed", hint: "To continue moving forward", syllables: ["pro", "ceed"] },
            { word: "maintain", hint: "To keep something in good condition", syllables: ["main", "tain"] },
            { word: "release", hint: "To let go of something", syllables: ["re", "lease"] },
            { word: "contain", hint: "To hold something inside", syllables: ["con", "tain"] },
            { word: "defeat", hint: "To win against an opponent", syllables: ["de", "feat"] },
            { word: "retreat", hint: "To move back or withdraw", syllables: ["re", "treat"] },
            { word: "succeed", hint: "To achieve what you tried to do", syllables: ["suc", "ceed"] },
            { word: "increase", hint: "To become larger or greater", syllables: ["in", "crease"] },
        ],
    },
    {
        id: "magic-e-patterns",
        unit: 10,
        title: "Magic E in Longer Words",
        icon: "✨",
        color: "#a29bfe",
        teachSlides: [
            {
                id: "magic-e-intro",
                title: "The Magic E Returns!",
                content: "Hey Colton! You probably already know that adding an E to the end of a word can change a short vowel to a long vowel — like 'hop' becomes 'hope'. But did you know Magic E works in longer words too? Today we're going to explore how this rule shows up in bigger, more complex words.",
                diagram: null
            },
            {
                id: "magic-e-how-it-works",
                title: "How Magic E Works in Big Words",
                content: "The pattern is the same as in short words: consonant, vowel, consonant, E. The E at the end stays silent but reaches back to make the vowel say its long sound. In 'compete', the final E makes the second E say its name. In 'survive', it makes the I say its name.",
                diagram: { type: "highlight-word", words: [{ word: "compete", highlight: "ete", note: "E makes the middle E say its name", color: "#a29bfe" }, { word: "survive", highlight: "ive", note: "E makes the I say its name", color: "#a29bfe" }] }
            },
            {
                id: "magic-e-long-a",
                title: "Magic E with Long A and Long I",
                content: "Look at words like 'escape' and 'migrate' — the Magic E makes the A say its long sound. In words like 'decline' and 'combine', the E makes the I say its long sound. The E is always at the end, quietly doing its magic from a distance!",
                diagram: { type: "highlight-word", words: [{ word: "escape", highlight: "ape", note: "E makes A say its name", color: "#74b9ff" }, { word: "decline", highlight: "ine", note: "E makes I say its name", color: "#74b9ff" }] }
            },
            {
                id: "magic-e-listen-1",
                title: "Listen and Choose!",
                content: "I'm going to say a word. Listen carefully for the long vowel sound, then pick the correct spelling.",
                type: "listen-and-choose",
                audioWord: "explore",
                choices: ["explor", "explore", "exploor"],
                correctChoice: 1,
                diagram: null
            },
            {
                id: "magic-e-long-o-u",
                title: "Magic E with Long O and Long U",
                content: "Magic E also works with O and U. In 'compose' and 'explode', the E makes the O say its long sound. In 'immune' and 'dispute', the E makes the U say its long sound. See the pattern? It's always that same setup: consonant, vowel, consonant, silent E.",
                diagram: { type: "highlight-word", words: [{ word: "compose", highlight: "ose", note: "E makes O say its name", color: "#55efc4" }, { word: "immune", highlight: "une", note: "E makes U say its name", color: "#55efc4" }] }
            },
            {
                id: "magic-e-spotting",
                title: "Spotting the Pattern",
                content: "Here's a tip for reading longer words: when you see a word ending in a consonant plus E, check if there's a vowel just before that consonant. If so, try saying the vowel with its long sound. It won't always be right, but it works most of the time and gives you a great starting point.",
                diagram: null
            },
            {
                id: "magic-e-listen-2",
                title: "Listen and Choose Again!",
                content: "Here's another one. Listen for the long vowel and choose the right spelling.",
                type: "listen-and-choose",
                audioWord: "combine",
                choices: ["combin", "combyne", "combine"],
                correctChoice: 2,
                diagram: null
            },
            {
                id: "magic-e-without-vs-with",
                title: "Without E vs. With E",
                content: "Notice what happens without the E: 'compet' isn't a word, 'surviv' looks wrong, and 'invit' is incomplete. The Magic E doesn't just change the vowel sound — it completes the word and makes it look right. Your brain will start to recognize when a word needs that final E.",
                diagram: { type: "highlight-word", words: [{ word: "extreme", highlight: "eme", note: "E makes the second E long", color: "#fd79a8" }, { word: "migrate", highlight: "ate", note: "E makes A long", color: "#fd79a8" }] }
            },
            {
                id: "magic-e-summary",
                title: "Magic E Recap",
                content: "Great job, Colton! Magic E works the same way in long words as in short ones — it sits silently at the end and makes the vowel before the last consonant say its long name. Look for the consonant-vowel-consonant-E pattern, and you'll crack these words every time!",
                diagram: null
            }
        ],
        rule: "The Magic E rule doesn't just work in small words like 'hope' — it shows up in longer words too. Look for the pattern: consonant + vowel + consonant + E at the end of a syllable. The E stays silent but makes the vowel say its name.",
        examples: [
            { without: "compeet", with: "compete", explanation: "The E makes the second E say its name" },
            { without: "surviv", with: "survive", explanation: "The E makes the I say its name" },
            { without: "invit", with: "invite", explanation: "The E makes the I say its name" },
            { without: "explod", with: "explode", explanation: "The E makes the O say its name" },
        ],
        words: [
            { word: "escape", hint: "To get away from danger", syllables: ["es", "cape"] },
            { word: "compete", hint: "To try to win against others", syllables: ["com", "pete"] },
            { word: "explore", hint: "To travel and discover new things", syllables: ["ex", "plore"] },
            { word: "extreme", hint: "Very great or intense", syllables: ["ex", "treme"] },
            { word: "decline", hint: "To go down or politely say no", syllables: ["de", "cline"] },
            { word: "compose", hint: "To create music or writing", syllables: ["com", "pose"] },
            { word: "combine", hint: "To join things together into one", syllables: ["com", "bine"] },
            { word: "migrate", hint: "To move from one place to another", syllables: ["mi", "grate"] },
            { word: "immune", hint: "Protected from a disease", syllables: ["im", "mune"] },
            { word: "dispute", hint: "An argument or disagreement", syllables: ["dis", "pute"] },
        ],
    },

    // ============================
    //  UNIT 11: Soft Sounds
    // ============================
    {
        id: "soft-c-g",
        unit: 11,
        title: "Soft C and Soft G",
        icon: "🔉",
        color: "#ffeaa7",
        teachSlides: [
            {
                id: "soft-cg-intro",
                title: "Two Sounds for C and G",
                content: "Hey Colton! Did you know that the letters C and G are kind of sneaky? Each one can make two completely different sounds depending on which letter comes after them. Today we're going to learn the rule that tells you which sound to use. Once you know it, you'll be able to read and spell so many more words!",
                diagram: null
            },
            {
                id: "soft-cg-the-rule",
                title: "The Golden Rule",
                content: "Here's the rule: when C or G is followed by E, I, or Y, they make their soft sounds. C says 'S' and G says 'J'. But when C or G comes before A, O, U, or a consonant, they keep their hard sounds — C says 'K' and G says the regular G sound like in 'go'.",
                diagram: { type: "comparison-table", headers: ["Soft (before E, I, Y)", "Hard (before A, O, U)"], rows: [["city (S sound)", "cat (K sound)"], ["center (S sound)", "coat (K sound)"], ["giant (J sound)", "game (G sound)"], ["gentle (J sound)", "goat (G sound)"]], ruleNote: "E, I, or Y after C/G triggers the soft sound" }
            },
            {
                id: "soft-cg-soft-c",
                title: "Soft C in Action",
                content: "Let's focus on soft C first. Remember, C says 'S' before E, I, or Y. Look at 'citizen' — the C comes before I, so it says S. In 'century', the C comes before E, so it says S. In 'ceremony', the C comes before E too. Once you spot the vowel after the C, you know which sound to use!",
                diagram: { type: "comparison-table", headers: ["Word", "Why It's Soft"], rows: [["citizen", "C before I"], ["century", "C before E"], ["ceremony", "C before E"], ["principal", "C before I"]], ruleNote: "C before E, I, or Y always says S" }
            },
            {
                id: "soft-cg-sort-1",
                title: "Sort the C Sounds!",
                content: "Now it's your turn! Sort these words by whether the C makes a soft S sound or a hard K sound.",
                type: "sort-it",
                sortCategories: ["Soft C (S sound)", "Hard C (K sound)"],
                sortItems: [
                    { word: "circle", category: 0 },
                    { word: "castle", category: 1 },
                    { word: "center", category: 0 },
                    { word: "corner", category: 1 },
                    { word: "ceiling", category: 0 },
                    { word: "capture", category: 1 }
                ],
                diagram: null
            },
            {
                id: "soft-cg-soft-g",
                title: "Soft G in Action",
                content: "Now let's look at soft G. G says 'J' before E, I, or Y. Think of 'giant' — G before I makes the J sound. 'General' — G before E makes the J sound. 'Imagine' — G before I makes the J sound. It's the same rule as C, just a different letter!",
                diagram: { type: "comparison-table", headers: ["Word", "Why It's Soft"], rows: [["giant", "G before I"], ["general", "G before E"], ["imagine", "G before I"], ["emergency", "G before E"]], ruleNote: "G before E, I, or Y usually says J" }
            },
            {
                id: "soft-cg-exceptions",
                title: "A Few Rule-Breakers",
                content: "I should warn you — the soft G rule has more exceptions than the soft C rule. Words like 'get', 'girl', and 'give' have G before E or I but still use the hard G sound. These are mostly short, common words that came from Old English. The rule works best with longer, fancier words that came from Latin or French.",
                diagram: null
            },
            {
                id: "soft-cg-sort-2",
                title: "Sort the G Sounds!",
                content: "Let's sort some G words! Does the G make a soft J sound or a hard G sound?",
                type: "sort-it",
                sortCategories: ["Soft G (J sound)", "Hard G (G sound)"],
                sortItems: [
                    { word: "gentle", category: 0 },
                    { word: "garden", category: 1 },
                    { word: "generous", category: 0 },
                    { word: "goal", category: 1 },
                    { word: "imagine", category: 0 },
                    { word: "great", category: 1 }
                ],
                diagram: null
            },
            {
                id: "soft-cg-both-together",
                title: "C and G in the Same Word!",
                content: "Sometimes you'll find both soft C and soft G in the same word! Look at 'emergency' — the G before E makes a J sound, and the C before Y also makes an S sound. Or 'generous' — the G before E says J. Knowing this rule helps you decode even the trickiest words.",
                diagram: null
            },
            {
                id: "soft-cg-summary",
                title: "Soft C and G Recap",
                content: "You did great, Colton! Remember the simple rule: C and G make their soft sounds before E, I, or Y. Soft C says S, and soft G says J. Before A, O, U, or consonants, they stay hard. Check the letter right after the C or G, and you'll know which sound to use!",
                diagram: null
            }
        ],
        rule: "The letters C and G each have two sounds. C says 'S' when followed by E, I, or Y (like 'city' and 'center'). G says 'J' when followed by E, I, or Y (like 'giant' and 'gentle'). Before A, O, U, or consonants, C says 'K' and G says hard 'G'.",
        examples: [
            { without: "sircle", with: "circle", explanation: "C before I makes the S sound" },
            { without: "jiant", with: "giant", explanation: "G before I makes the J sound" },
            { without: "senter", with: "center", explanation: "C before E makes the S sound" },
            { without: "jentle", with: "gentle", explanation: "G before E makes the J sound" },
        ],
        words: [
            { word: "citizen", hint: "A person who belongs to a country", syllables: ["cit", "i", "zen"] },
            { word: "imagine", hint: "To picture something in your mind", syllables: ["i", "mag", "ine"] },
            { word: "general", hint: "Overall, or a high military rank", syllables: ["gen", "er", "al"] },
            { word: "century", hint: "A period of one hundred years", syllables: ["cen", "tu", "ry"] },
            { word: "generous", hint: "Willing to give and share freely", syllables: ["gen", "er", "ous"] },
            { word: "ceremony", hint: "A formal event or celebration", syllables: ["cer", "e", "mo", "ny"] },
            { word: "emergency", hint: "A sudden dangerous situation", syllables: ["e", "mer", "gen", "cy"] },
            { word: "principal", hint: "The head of a school", syllables: ["prin", "ci", "pal"] },
            { word: "original", hint: "The first, not a copy", syllables: ["o", "rig", "i", "nal"] },
            { word: "innocent", hint: "Not guilty of a crime", syllables: ["in", "no", "cent"] },
        ],
    },

    // ============================
    //  UNIT 12: R-Controlled Vowels
    // ============================
    {
        id: "r-controlled",
        unit: 12,
        title: "Bossy R Vowels (ar, er, ir, or, ur)",
        icon: "🏴‍☠️",
        color: "#fab1a0",
        teachSlides: [
            {
                id: "r-controlled-intro",
                title: "Meet Bossy R!",
                content: "Hey Colton! Today we're meeting one of the bossiest letters in the alphabet — the letter R. When R comes right after a vowel, it completely changes the vowel's sound. We call these R-controlled vowels, or sometimes 'Bossy R' vowels, because R is so bossy it won't let the vowel make its normal sound!",
                diagram: null
            },
            {
                id: "r-controlled-ar",
                title: "The AR Sound",
                content: "Let's start with AR. When A teams up with R, it makes the sound you hear in 'car' and 'star'. Think of a pirate saying 'ARRR!' That's the AR sound! You'll find it in words like 'garden', 'departure', and 'particular'. AR is the easiest R-controlled vowel because it has its own unique sound.",
                diagram: { type: "sound-map", pattern: "AR", variants: [{ sound: "/ar/", examples: ["garden", "departure", "particular"] }] }
            },
            {
                id: "r-controlled-er-ir-ur",
                title: "The Tricky Trio: ER, IR, and UR",
                content: "Here's where it gets tricky. ER, IR, and UR all make the exact same sound! Listen: 'her', 'bird', 'fur' — they all have that same 'er' sound in the middle. The hard part is knowing which spelling to use, because you can't tell just by listening. You kind of have to memorize which words use which spelling.",
                diagram: { type: "sound-map", pattern: "ER/IR/UR", variants: [{ sound: "/er/", examples: ["determine", "nervous"] }, { sound: "/ir/", examples: ["circular", "thirsty"] }, { sound: "/ur/", examples: ["surprise", "furniture"] }] }
            },
            {
                id: "r-controlled-sort-1",
                title: "Sort by R-Controlled Spelling!",
                content: "Let's practice! Sort these words by which R-controlled vowel they use.",
                type: "sort-it",
                sortCategories: ["ER spelling", "IR spelling"],
                sortItems: [
                    { word: "determine", category: 0 },
                    { word: "circular", category: 1 },
                    { word: "nervous", category: 0 },
                    { word: "thirsty", category: 1 },
                    { word: "perform", category: 0 },
                    { word: "birthday", category: 1 }
                ],
                diagram: null
            },
            {
                id: "r-controlled-or",
                title: "The OR Sound",
                content: "OR makes the sound you hear in 'for', 'door', and 'more'. It's a nice round sound. You'll see it in words like 'perform', 'therefore', and 'fortunate'. Like AR, the OR sound is pretty distinctive and easy to recognize when you hear it.",
                diagram: { type: "sound-map", pattern: "OR", variants: [{ sound: "/or/", examples: ["perform", "therefore", "fortunate"] }] }
            },
            {
                id: "r-controlled-tips",
                title: "Tips for Spelling R-Controlled Vowels",
                content: "Since ER, IR, and UR sound the same, here are some tips. ER is the most common spelling — when in doubt, try ER first. IR often appears in the middle of words. UR shows up in words like 'surprise', 'furniture', and 'murmur'. Reading a lot helps your brain remember which spelling looks right for each word.",
                diagram: null
            },
            {
                id: "r-controlled-sort-2",
                title: "AR or OR?",
                content: "Now let's sort words with the AR and OR sounds. These are easier to tell apart!",
                type: "sort-it",
                sortCategories: ["AR sound", "OR sound"],
                sortItems: [
                    { word: "garden", category: 0 },
                    { word: "fortune", category: 1 },
                    { word: "departure", category: 0 },
                    { word: "perform", category: 1 },
                    { word: "particular", category: 0 },
                    { word: "therefore", category: 1 }
                ],
                diagram: null
            },
            {
                id: "r-controlled-double",
                title: "Double R-Controlled!",
                content: "Some words have more than one R-controlled vowel! Look at 'murmur' — it has UR twice! And 'particular' has both AR and another AR. 'Circular' has IR and AR. Once you start looking for Bossy R patterns, you'll notice them everywhere in longer words.",
                diagram: null
            },
            {
                id: "r-controlled-summary",
                title: "Bossy R Recap",
                content: "Great work, Colton! Remember: AR has its own unique sound, OR has its own sound, and ER, IR, and UR all make the same 'er' sound with different spellings. R is bossy — it always changes the vowel's sound. Keep an eye out for these patterns and you'll master them in no time!",
                diagram: null
            }
        ],
        rule: "When the letter R comes after a vowel, it changes the vowel's sound completely — that's why we call it 'Bossy R'. AR sounds like 'car'. ER, IR, and UR all make the same 'er' sound (her, bird, fur). OR sounds like 'for'. The tricky part is knowing which spelling to use for the 'er' sound.",
        examples: [
            { without: "gaden", with: "garden", explanation: "AR makes the 'ar' sound" },
            { without: "nervus", with: "nervous", explanation: "ER makes the 'er' sound" },
            { without: "thersty", with: "thirsty", explanation: "IR also makes the 'er' sound" },
            { without: "perpus", with: "purpose", explanation: "UR also makes the 'er' sound" },
        ],
        words: [
            { word: "departure", hint: "The act of leaving a place", syllables: ["de", "par", "ture"] },
            { word: "determine", hint: "To find out or decide firmly", syllables: ["de", "ter", "mine"] },
            { word: "circular", hint: "Shaped like a circle, round", syllables: ["cir", "cu", "lar"] },
            { word: "therefore", hint: "For that reason, so", syllables: ["there", "fore"] },
            { word: "surprise", hint: "Something you didn't expect", syllables: ["sur", "prise"] },
            { word: "perform", hint: "To carry out an action or show", syllables: ["per", "form"] },
            { word: "murmur", hint: "To speak very softly", syllables: ["mur", "mur"] },
            { word: "particular", hint: "Specific, one certain thing", syllables: ["par", "tic", "u", "lar"] },
            { word: "furniture", hint: "Tables, chairs, desks, and beds", syllables: ["fur", "ni", "ture"] },
            { word: "fortunate", hint: "Lucky, having good fortune", syllables: ["for", "tu", "nate"] },
        ],
    },

    // ============================
    //  UNIT 13: Word Families
    // ============================
    {
        id: "ight-family",
        unit: 13,
        title: "The -ight Family & -tion Pattern",
        icon: "👨‍👩‍👧‍👦",
        color: "#55efc4",
        teachSlides: [
            {
                id: "ight-intro",
                title: "Word Families to the Rescue!",
                content: "Hey Colton! Today we're learning about word families — groups of words that share the same spelling pattern. Once you learn one word in a family, you can read and spell all the others! We'll focus on two super useful families: the -IGHT family and the -TION pattern.",
                diagram: null
            },
            {
                id: "ight-the-pattern",
                title: "The -IGHT Family",
                content: "The -IGHT pattern is one of the trickiest in English because the GH is completely silent! The whole chunk 'ight' just says 'ite'. Night, light, right, fight — they all end with that same 'ite' sound. It looks like there should be more sounds in there, but nope — the GH is just along for the ride.",
                diagram: { type: "highlight-word", words: [{ word: "night", highlight: "gh", note: "GH is silent", color: "#e17055" }, { word: "light", highlight: "gh", note: "GH is silent", color: "#e17055" }, { word: "fight", highlight: "gh", note: "GH is silent", color: "#e17055" }] }
            },
            {
                id: "ight-bigger-words",
                title: "-IGHT in Bigger Words",
                content: "The cool thing about knowing the -IGHT pattern is that it shows up in lots of bigger words too. Midnight has 'night' inside it. Spotlight has 'light'. Frightened has 'fright'. Delightful has 'light'. When you spot the -IGHT chunk in a long word, you already know how to say that part!",
                diagram: { type: "highlight-word", words: [{ word: "midnight", highlight: "ight", note: "Same -IGHT pattern", color: "#55efc4" }, { word: "spotlight", highlight: "ight", note: "Same -IGHT pattern", color: "#55efc4" }, { word: "delightful", highlight: "ight", note: "Same -IGHT pattern", color: "#55efc4" }] }
            },
            {
                id: "ight-fill-1",
                title: "Fill in the Blank!",
                content: "Let's practice! Fill in the missing letters to complete this -IGHT word.",
                type: "fill-the-gap",
                gapWord: "fr_____ened",
                gapOptions: ["ight", "ite", "igt"],
                gapAnswer: "ight",
                diagram: null
            },
            {
                id: "ight-tion-pattern",
                title: "The -TION Pattern",
                content: "Now let's meet another word family: -TION. This pattern always makes the 'shun' sound. Nation, station, education — they all end with that 'shun' sound spelled T-I-O-N. This is one of the most common endings in English, especially in longer, more formal words.",
                diagram: { type: "highlight-word", words: [{ word: "nation", highlight: "tion", note: "Says 'shun'", color: "#74b9ff" }, { word: "station", highlight: "tion", note: "Says 'shun'", color: "#74b9ff" }, { word: "celebration", highlight: "tion", note: "Says 'shun'", color: "#74b9ff" }] }
            },
            {
                id: "ight-tion-examples",
                title: "-TION in Everyday Words",
                content: "You use -TION words all the time without even thinking about it! Situation, operation, generation, information, celebration — these are all words you know. The -TION is always at the end, and it always says 'shun'. If you can spell the beginning of the word, just stick -TION on the end.",
                diagram: null
            },
            {
                id: "ight-fill-2",
                title: "Fill in Another Gap!",
                content: "Here's another one. What letters complete this -TION word?",
                type: "fill-the-gap",
                gapWord: "informa____",
                gapOptions: ["shun", "tion", "sion"],
                gapAnswer: "tion",
                diagram: null
            },
            {
                id: "ight-straight",
                title: "A Special -IGHT Word",
                content: "Let's look at 'straighten' — it has the -IGHT pattern hiding inside it! S-T-R-A-I-G-H-T. The GH is silent as always. This is a word a lot of people find tricky to spell, but once you see the -IGHT family connection, it makes much more sense. Straight is part of the same family as night and light!",
                diagram: { type: "highlight-word", words: [{ word: "straighten", highlight: "igh", note: "Same silent GH pattern", color: "#fdcb6e" }] }
            },
            {
                id: "ight-summary",
                title: "Word Families Recap",
                content: "Awesome work, Colton! You learned two powerful word families today. The -IGHT family says 'ite' with a silent GH, and the -TION pattern always says 'shun'. When you see these patterns in new words, you already know how they sound. Word families are like cheat codes for reading!",
                diagram: null
            }
        ],
        rule: "English has word families — groups of words that share a spelling pattern. The -IGHT family makes a 'ite' sound (the GH is silent). The -TION pattern always makes a 'shun' sound. Learning these families helps you spell many words at once.",
        examples: [
            { without: "nite", with: "night", explanation: "-IGHT says 'ite' — GH is silent" },
            { without: "fite", with: "fight", explanation: "-IGHT pattern, same as night" },
            { without: "nashun", with: "nation", explanation: "-TION always says 'shun'" },
            { without: "stashun", with: "station", explanation: "-TION pattern, same sound" },
        ],
        words: [
            { word: "midnight", hint: "12 o'clock at night", syllables: ["mid", "night"] },
            { word: "spotlight", hint: "A bright beam of light on a stage", syllables: ["spot", "light"] },
            { word: "frightened", hint: "Feeling scared or afraid", syllables: ["fright", "ened"] },
            { word: "delightful", hint: "Very pleasing and enjoyable", syllables: ["de", "light", "ful"] },
            { word: "straighten", hint: "To make something not crooked", syllables: ["straight", "en"] },
            { word: "situation", hint: "The circumstances you're in", syllables: ["sit", "u", "a", "tion"] },
            { word: "operation", hint: "A medical procedure or a planned action", syllables: ["op", "er", "a", "tion"] },
            { word: "generation", hint: "A group of people born around the same time", syllables: ["gen", "er", "a", "tion"] },
            { word: "celebration", hint: "A party or special event", syllables: ["cel", "e", "bra", "tion"] },
            { word: "information", hint: "Facts and details about something", syllables: ["in", "for", "ma", "tion"] },
        ],
    },
    {
        id: "ous-ful-less",
        unit: 13,
        title: "Endings: -ous, -ful, -less, -ment, -ness",
        icon: "🔗",
        color: "#81ecec",
        teachSlides: [
            {
                id: "ous-ful-less-intro",
                title: "Building Words with Endings!",
                content: "Hey Colton! Today we're learning about word endings that let you build new words from ones you already know. These endings — called suffixes — are like building blocks. If you know the base word and the suffix, you can create and understand tons of new words. Let's explore five really common ones!",
                diagram: null
            },
            {
                id: "ous-ful-less-ous",
                title: "The -OUS Ending",
                content: "The suffix -OUS means 'full of' or 'having a lot of'. Danger becomes dangerous — full of danger. Mystery becomes mysterious — full of mystery. Courage becomes courageous — full of courage. When you see -OUS at the end of a word, think 'full of whatever comes before it'.",
                diagram: { type: "suffix-transform", base: "danger", suffix: "ous", result: "dangerous", note: "-OUS means 'full of'" }
            },
            {
                id: "ous-ful-less-ful",
                title: "The -FUL Ending",
                content: "The suffix -FUL also means 'full of', just like -OUS! Hope becomes hopeful — full of hope. Thought becomes thoughtful — full of thought. Meaning becomes meaningful — full of meaning. Here's a spelling tip: even though it means 'full', the suffix is only spelled with one L: F-U-L, not F-U-L-L.",
                diagram: { type: "suffix-transform", base: "thought", suffix: "ful", result: "thoughtful", note: "-FUL means 'full of' (only one L!)" }
            },
            {
                id: "ous-ful-less-sort-1",
                title: "Sort: -OUS or -FUL?",
                content: "Both -OUS and -FUL mean 'full of', but words use one or the other. Sort these words by their ending!",
                type: "sort-it",
                sortCategories: ["-OUS words", "-FUL words"],
                sortItems: [
                    { word: "dangerous", category: 0 },
                    { word: "hopeful", category: 1 },
                    { word: "mysterious", category: 0 },
                    { word: "thoughtful", category: 1 },
                    { word: "courageous", category: 0 },
                    { word: "meaningful", category: 1 }
                ],
                diagram: null
            },
            {
                id: "ous-ful-less-less",
                title: "The -LESS Ending",
                content: "The suffix -LESS is the opposite of -FUL! It means 'without'. Hopeful means full of hope, but hopeless means without hope. Careless means without care. Reckless means without thinking about risk. Regardless means without regard. See how one little ending completely flips the meaning?",
                diagram: { type: "suffix-transform", base: "care", suffix: "less", result: "careless", note: "-LESS means 'without'" }
            },
            {
                id: "ous-ful-less-ment-ness",
                title: "The -MENT and -NESS Endings",
                content: "These two endings turn words into nouns — naming words. -MENT turns verbs into nouns: enjoy becomes enjoyment, achieve becomes achievement, govern becomes government. -NESS turns adjectives into nouns: dark becomes darkness, aware becomes awareness, kind becomes kindness. They're word transformers!",
                diagram: { type: "suffix-transform", base: "enjoy", suffix: "ment", result: "enjoyment", note: "-MENT turns a verb into a noun" }
            },
            {
                id: "ous-ful-less-sort-2",
                title: "Sort by Suffix Meaning!",
                content: "Let's sort these words. Does the suffix mean 'full of', 'without', or does it turn the word into a noun?",
                type: "sort-it",
                sortCategories: ["Full of (OUS/FUL)", "Without (LESS)"],
                sortItems: [
                    { word: "courageous", category: 0 },
                    { word: "careless", category: 1 },
                    { word: "thoughtful", category: 0 },
                    { word: "reckless", category: 1 },
                    { word: "ridiculous", category: 0 },
                    { word: "regardless", category: 1 }
                ],
                diagram: null
            },
            {
                id: "ous-ful-less-spelling",
                title: "Spelling Tips for Suffixes",
                content: "A few things to watch out for when adding these endings. Sometimes the base word changes a little — courage drops the E before adding -OUS to make courageous. But enjoy keeps its Y before -MENT: enjoyment. And with -NESS, the base word usually stays exactly the same: aware plus ness equals awareness.",
                diagram: { type: "suffix-transform", base: "aware", suffix: "ness", result: "awareness", note: "Base word stays the same with -NESS" }
            },
            {
                id: "ous-ful-less-summary",
                title: "Suffix Recap",
                content: "Fantastic work, Colton! You learned five powerful suffixes today. -OUS and -FUL both mean 'full of'. -LESS means 'without'. -MENT and -NESS turn words into nouns. These building blocks show up in hundreds of English words, and now you know exactly what they mean!",
                diagram: null
            }
        ],
        rule: "These common endings help build new words. -OUS means 'full of' (danger → dangerous). -FUL means 'full of' (hope → hopeful). -LESS means 'without' (hope → hopeless). -MENT turns a verb into a noun (enjoy → enjoyment). -NESS turns an adjective into a noun (dark → darkness).",
        examples: [
            { without: "dangeros", with: "dangerous", explanation: "-OUS means 'full of danger'" },
            { without: "hopful", with: "hopeful", explanation: "-FUL means 'full of hope'" },
            { without: "carelss", with: "careless", explanation: "-LESS means 'without care'" },
            { without: "enjoiment", with: "enjoyment", explanation: "-MENT turns a verb into a noun" },
        ],
        words: [
            { word: "courageous", hint: "Full of courage, very brave", syllables: ["cour", "a", "geous"] },
            { word: "mysterious", hint: "Full of mystery, hard to explain", syllables: ["mys", "te", "ri", "ous"] },
            { word: "ridiculous", hint: "So silly it deserves to be laughed at", syllables: ["ri", "dic", "u", "lous"] },
            { word: "meaningful", hint: "Full of meaning and purpose", syllables: ["mean", "ing", "ful"] },
            { word: "thoughtful", hint: "Showing care for others' feelings", syllables: ["thought", "ful"] },
            { word: "reckless", hint: "Without thought for danger", syllables: ["reck", "less"] },
            { word: "regardless", hint: "Without regard, no matter what", syllables: ["re", "gard", "less"] },
            { word: "achievement", hint: "Something accomplished through effort", syllables: ["a", "chieve", "ment"] },
            { word: "government", hint: "The system that runs a country", syllables: ["gov", "ern", "ment"] },
            { word: "awareness", hint: "The state of knowing about something", syllables: ["a", "ware", "ness"] },
        ],
    },
];

// Build a quick lookup: unit number → lessons in that unit
const LESSON_UNITS = {};
LESSONS.forEach((lesson) => {
    if (!LESSON_UNITS[lesson.unit]) LESSON_UNITS[lesson.unit] = [];
    LESSON_UNITS[lesson.unit].push(lesson);
});

const UNIT_NAMES = {
    1: "Silent Letters",
    2: "Double Letters",
    3: "I Before E",
    4: "Prefixes",
    5: "Suffixes",
    6: "Tricky Combos",
    7: "Commonly Confused",
    8: "Greek & Latin Roots",
    9: "Plurals & Endings",
    10: "Vowel Patterns",
    11: "Soft Sounds",
    12: "R-Controlled Vowels",
    13: "Word Families & Endings",
};
