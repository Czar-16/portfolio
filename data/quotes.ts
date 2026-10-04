/**
 * Quote library for /quotes.
 *
 * These are real, widely published quotations with their commonly cited
 * authors — add, edit or remove entries freely. Provenance of popular quotes
 * is often murky, so verify anything you plan to publish elsewhere.
 */

export const quoteCategories = [
  "All",
  "Life",
  "Work",
  "Learning",
  "Motivation",
  "Philosophy",
  "Technology",
  "Leadership",
  "Other",
] as const;

export type QuoteCategory = (typeof quoteCategories)[number];

export type Quote = {
  id: string;
  text: string;
  author: string;
  tags: Exclude<QuoteCategory, "All">[];
};

export const quotes: Quote[] = [
  {
    id: "nobody-coming",
    text: "Nobody is coming to save you. Build the life yourself.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "fewer-excuses",
    text: "You don't need more motivation. You need fewer excuses.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "avoided-work",
    text: "The work you keep avoiding is probably the work that changes your life.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "future-over-mood",
    text: "Discipline is choosing your future over your current mood.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "repeatedly-tolerate",
    text: "Your results are usually a reflection of what you repeatedly tolerate.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "ready-through-action",
    text: "Stop waiting to feel ready. Readiness is built through action.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "when-excitement-disappears",
    text: "If you can keep working when the excitement disappears, you'll become dangerous.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "compound-effect",
    text: "Most people don't fail because the goal was impossible. They quit before the compound effect arrived.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "boring-work",
    text: "Boring work repeated for years beats exciting work abandoned after weeks.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "endure-boredom",
    text: "Your ability to endure boredom may be one of your greatest competitive advantages.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "unreasonable-time",
    text: "Success isn't complicated. Doing the right things for an unreasonable amount of time is.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "something-valuable",
    text: "You don't need to be exceptional at everything. Become exceptional at something valuable.",
    author: "Inspired",
    tags: ["Work", "Learning"],
  },
  {
    id: "stay-in-game",
    text: "The person willing to stay in the game longest eventually becomes hard to compete with.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "become-useful",
    text: "Stop trying to look successful. Start becoming useful.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "higher-standards",
    text: "Your life changes when your standards become higher than your excuses.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "chase-evidence",
    text: "Don't chase applause. Chase evidence.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "scoreboard",
    text: "The scoreboard doesn't care about your intentions.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "potential-execution",
    text: "Your potential means nothing without repeated execution.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "repetitions",
    text: "The gap between where you are and where you want to be is mostly repetitions.",
    author: "Inspired",
    tags: ["Work", "Learning"],
  },
  {
    id: "uncommon-results",
    text: "If you want uncommon results, become comfortable doing uncommon amounts of work.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },

  {
    id: "strategy-execution",
    text: "A mediocre strategy executed relentlessly beats ten brilliant strategies executed inconsistently.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "commitment-tax",
    text: "Every unnecessary commitment is a tax on your ambition.",
    author: "Inspired",
    tags: ["Work", "Life"],
  },
  {
    id: "changing-direction",
    text: "You can't build something great while constantly changing what you're building.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "remove-distractions",
    text: "Focus isn't doing more. It's aggressively removing what doesn't matter.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "one-direction",
    text: "One direction for years beats ten directions for months.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "attention-investment",
    text: "Your attention is an investment. Spend it like money.",
    author: "Inspired",
    tags: ["Life", "Work"],
  },
  {
    id: "meaningless-yes",
    text: "Every time you say yes to something meaningless, you're saying no to something important.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "movement-progress",
    text: "Don't confuse movement with progress.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "opportunities-distractions",
    text: "More opportunities can become more distractions.",
    author: "Inspired",
    tags: ["Life", "Work"],
  },
  {
    id: "stop-doing",
    text: "The fastest way forward is often deciding what you will stop doing.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },

  {
    id: "failure-evidence",
    text: "Failure isn't evidence that you're incapable. It's evidence that you found something that didn't work.",
    author: "Inspired",
    tags: ["Learning", "Motivation"],
  },
  {
    id: "take-shots",
    text: "Take enough shots and eventually one of them changes everything.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "cheap-to-fail",
    text: "You don't need to avoid failure. You need to become cheap to fail.",
    author: "Inspired",
    tags: ["Learning", "Motivation"],
  },
  {
    id: "learn-from-mistakes",
    text: "A mistake becomes expensive when you refuse to learn from it.",
    author: "Inspired",
    tags: ["Learning", "Motivation"],
  },
  {
    id: "losing-teaches",
    text: "Losing teaches you what winning often hides.",
    author: "Inspired",
    tags: ["Learning", "Life"],
  },
  {
    id: "ego-future",
    text: "Don't protect your ego at the expense of your future.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "attempt-enough",
    text: "If you're never embarrassed by your attempts, you're probably not attempting enough.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "failure-tuition",
    text: "Failure is tuition. Make sure you're learning from what you paid for.",
    author: "Inspired",
    tags: ["Learning", "Motivation"],
  },
  {
    id: "recover-better",
    text: "The goal isn't zero mistakes. The goal is becoming better at recovering from them.",
    author: "Inspired",
    tags: ["Learning", "Life"],
  },
  {
    id: "survive-hardship",
    text: "You become harder to stop every time you survive something you thought would break you.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },

  {
    id: "confidence-evidence",
    text: "Confidence is accumulated evidence that you can trust yourself.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "act-into-confidence",
    text: "You don't think your way into confidence. You act your way into it.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "self-belief",
    text: "Self-belief becomes easier when your actions give you reasons to believe.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "collect-proof",
    text: "Stop asking whether you are capable. Start collecting proof.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "silence-doubt",
    text: "The fastest way to silence doubt is to produce results.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "fixed-standards",
    text: "Your mind will negotiate with you when your standards aren't fixed.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "stop-betraying-yourself",
    text: "You don't need everyone to believe in you. You need to stop betraying yourself.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "doubt-action",
    text: "Doubt gets louder when action gets quieter.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "future-self",
    text: "Become the person your future self can depend on.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "self-respect",
    text: "Keep promises to yourself long enough and self-respect follows.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },

  {
    id: "solve-painful-problems",
    text: "Solve painful problems and people become willing to pay you.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "value-creation",
    text: "Value creation is more important than looking busy.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "market-outcomes",
    text: "The market rewards outcomes, not effort.",
    author: "Inspired",
    tags: ["Work", "Other"],
  },
  {
    id: "wrong-product",
    text: "If nobody wants what you're selling, working harder won't fix the fundamental problem.",
    author: "Inspired",
    tags: ["Work", "Learning"],
  },
  {
    id: "valuable-result",
    text: "Make the result so valuable that price becomes a secondary conversation.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "learn-to-sell",
    text: "Learn to sell before complaining that nobody understands your value.",
    author: "Inspired",
    tags: ["Work", "Learning"],
  },
  {
    id: "genuinely-useful",
    text: "The best business advantage is being genuinely useful.",
    author: "Inspired",
    tags: ["Work", "Leadership"],
  },
  {
    id: "difficult-to-compare",
    text: "Don't compete harder in a commodity market. Become difficult to compare.",
    author: "Inspired",
    tags: ["Work", "Motivation"],
  },
  {
    id: "retain-customers",
    text: "More customers isn't always the answer. Sometimes the answer is keeping the customers you already have.",
    author: "Inspired",
    tags: ["Work", "Leadership"],
  },
  {
    id: "reasons-to-stay",
    text: "Your business gets stronger when your customers have more reasons to stay.",
    author: "Inspired",
    tags: ["Work", "Leadership"],
  },

  {
    id: "opportunity-safe",
    text: "Opportunity rarely looks safe when it first appears.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "upside-disappears",
    text: "By the time everyone agrees something is safe, most of the upside has already disappeared.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "risk-opportunity",
    text: "Risk and opportunity often look identical from a distance.",
    author: "Inspired",
    tags: ["Philosophy", "Life"],
  },
  {
    id: "enough-evidence",
    text: "You don't need certainty to move. You need enough evidence to take the next step.",
    author: "Inspired",
    tags: ["Motivation", "Learning"],
  },
  {
    id: "perfect-conditions",
    text: "Waiting for perfect conditions is another form of fear.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "window-open",
    text: "The window doesn't stay open because you're still thinking.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "calculated-risks",
    text: "Take calculated risks, not comfortable ones.",
    author: "Inspired",
    tags: ["Motivation", "Life"],
  },
  {
    id: "survivable-downside",
    text: "If the upside is enormous and the downside is survivable, pay attention.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "greatest-risk",
    text: "Sometimes the biggest risk is remaining exactly where you are.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "uncertainty-danger",
    text: "Don't confuse uncertainty with danger.",
    author: "Inspired",
    tags: ["Philosophy", "Life"],
  },

  {
    id: "cannot-recover-yesterday",
    text: "You can recover money. You can't recover yesterday.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },
  {
    id: "calendar-priorities",
    text: "Your calendar reveals your real priorities better than your words do.",
    author: "Inspired",
    tags: ["Life", "Work"],
  },
  {
    id: "calendar-matters",
    text: "If something matters, eventually it needs a place on your calendar.",
    author: "Inspired",
    tags: ["Work", "Life"],
  },
  {
    id: "decide-time",
    text: "You don't find time. You decide what deserves it.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "years-drifting",
    text: "Every year you spend drifting is a year you can't buy back.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "finite-attention",
    text: "Your attention is finite. Your ambitions aren't.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "cost-distraction",
    text: "The opportunity cost of distraction is invisible until years have passed.",
    author: "Inspired",
    tags: ["Life", "Work"],
  },
  {
    id: "build-for-thirties",
    text: "Spend your twenties building things your thirties will thank you for.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "trajectory",
    text: "A year of focused effort can completely change the trajectory of a life.",
    author: "Inspired",
    tags: ["Motivation", "Work"],
  },
  {
    id: "lowest-impulses",
    text: "Don't waste your most energetic years negotiating with your lowest impulses.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },

  {
    id: "hidden-sacrifices",
    text: "The life you envy is often built from sacrifices you aren't seeing.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },
  {
    id: "today-tomorrow",
    text: "What feels good today can quietly make tomorrow worse.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },
  {
    id: "hard-today",
    text: "What feels difficult today can quietly make tomorrow better.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "environment",
    text: "Your environment shapes your behavior more than your intentions do.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },
  {
    id: "mediocrity-normal",
    text: "If everyone around you normalizes mediocrity, ambition starts feeling abnormal.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "repeated-exposure",
    text: "You become what you repeatedly expose yourself to.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },
  {
    id: "protect-attention",
    text: "Protect your attention from people who profit from your distraction.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "act-on-knowledge",
    text: "You don't need more information. You need to act on the information you already have.",
    author: "Inspired",
    tags: ["Learning", "Motivation"],
  },
  {
    id: "knowing-doing",
    text: "Knowing what to do and doing it are two completely different skills.",
    author: "Inspired",
    tags: ["Learning", "Motivation"],
  },
  {
    id: "meaningful-life",
    text: "A meaningful life isn't necessarily an easy life.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },

  {
    id: "advice",
    text: "Don't take advice from people whose lives you wouldn't trade for yours.",
    author: "Inspired",
    tags: ["Life", "Learning"],
  },
  {
    id: "environment-influence",
    text: "Choose your environment carefully; proximity becomes influence.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },
  {
    id: "normalize-goals",
    text: "The people around you can either normalize your goals or normalize your excuses.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "outgrown-relationships",
    text: "Some relationships survive only because neither person is willing to admit they've outgrown them.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },
  {
    id: "better-apart",
    text: "You can love someone and still recognize that you're better apart.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },
  {
    id: "possible-life",
    text: "The people you spend your time with quietly shape what you consider possible.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "future-over-opinion",
    text: "Don't sacrifice your entire future to preserve someone's opinion of your present.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "ambition-normal",
    text: "Find people who make ambition feel normal rather than embarrassing.",
    author: "Inspired",
    tags: ["Life", "Motivation"],
  },
  {
    id: "who-you-become",
    text: "Pay attention to who you become around different people.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },
  {
    id: "life-to-escape",
    text: "Build a life you don't constantly need to escape from.",
    author: "Inspired",
    tags: ["Life", "Philosophy"],
  },
];
