/** Editable collection: replace posters in public/watch/<slug>.jpg. */
export type WatchItem = {
  rank: number;
  title: string;
  year: number;
  slug: string;
  type: "Film" | "Series";
};

export const watchItems: WatchItem[] = [
  { rank: 1, title: "The Social Network", year: 2010, slug: "the-social-network", type: "Film" },
  { rank: 2, title: "October Sky", year: 1999, slug: "october-sky", type: "Film" },
  { rank: 3, title: "Tenet", year: 2020, slug: "tenet", type: "Film" },
  { rank: 4, title: "The Odyssey", year: 2026, slug: "the-odyssey", type: "Film" },
  { rank: 5, title: "Warrior", year: 2011, slug: "warrior", type: "Film" },
  { rank: 6, title: "Tony", year: 2026, slug: "tony", type: "Film" },
  { rank: 7, title: "The Pursuit of Happyness", year: 2006, slug: "the-pursuit-of-happyness", type: "Film" },
  { rank: 8, title: "Oppenheimer", year: 2023, slug: "oppenheimer", type: "Film" },
  { rank: 9, title: "Upgrade", year: 2018, slug: "upgrade", type: "Film" },
  { rank: 10, title: "Snatch", year: 2000, slug: "snatch", type: "Film" },
  { rank: 11, title: "Marty Supreme", year: 2025, slug: "marty-supreme", type: "Film" },
  { rank: 12, title: "Super Pumped", year: 2022, slug: "super-pumped", type: "Series" },
  { rank: 13, title: "Pitchers", year: 2015, slug: "pitchers", type: "Series" },
  { rank: 14, title: "Silicon Valley", year: 2014, slug: "silicon-valley", type: "Series" },
  { rank: 15, title: "Pantheon", year: 2022, slug: "pantheon", type: "Series" },
  { rank: 16, title: "Peaky Blinders", year: 2013, slug: "peaky-blinders", type: "Series" },
  { rank: 17, title: "Nightcrawler", year: 2014, slug: "nightcrawler", type: "Film" },
  { rank: 18, title: "Source Code", year: 2011, slug: "source-code", type: "Film" },
  { rank: 19, title: "The Batman", year: 2022, slug: "the-batman", type: "Film" },
  { rank: 20, title: "True Detective", year: 2014, slug: "true-detective", type: "Series" },
  { rank: 21, title: "The Uprising", year: 2026, slug: "the-uprising", type: "Film" },
  { rank: 22, title: "The Gentlemen (2019)", year: 2019, slug: "the-gentlemen", type: "Film" },
  { rank: 23, title: "Wrath of Man", year: 2021, slug: "wrath-of-man", type: "Film" },
  { rank: 24, title: "The Covenant", year: 2023, slug: "the-covenant", type: "Film" },
  { rank: 25, title: "The Rip", year: 2026, slug: "the-rip", type: "Film" },
  { rank: 26, title: "The Terminal List", year: 2022, slug: "the-terminal-list", type: "Series" },
  { rank: 27, title: "The Day of the Jackal", year: 2024, slug: "the-day-of-the-jackal", type: "Series" },
  { rank: 28, title: "Rush", year: 2013, slug: "rush", type: "Film" },
  { rank: 29, title: "F1", year: 2025, slug: "f1", type: "Film" },
  { rank: 30, title: "Fight Club", year: 1999, slug: "fight-club", type: "Film" },
  { rank: 31, title: "Sicario 2", year: 2018, slug: "sicario-2", type: "Film" },
  { rank: 32, title: "ZeroZeroZero", year: 2019, slug: "zerozerozero", type: "Series" },
  { rank: 33, title: "Death Note", year: 2006, slug: "death-note", type: "Series" },
  { rank: 34, title: "Cars", year: 2006, slug: "cars", type: "Film" },
  { rank: 35, title: "Breaking Bad", year: 2008, slug: "breaking-bad", type: "Series" },
  { rank: 36, title: "Obsession", year: 2025, slug: "obsession", type: "Film" },
  { rank: 37, title: "BlackBerry (2023)", year: 2023, slug: "blackberry", type: "Film" },
  { rank: 38, title: "Steve Jobs (2015)", year: 2015, slug: "steve-jobs", type: "Film" },
  { rank: 39, title: "Halt and Catch Fire", year: 2014, slug: "halt-and-catch-fire", type: "Series" },
  { rank: 40, title: "The Wolf of Wall Street", year: 2013, slug: "the-wolf-of-wall-street", type: "Film" },
  { rank: 41, title: "Dumb Money", year: 2023, slug: "dumb-money", type: "Film" },
  { rank: 42, title: "Bitconned", year: 2024, slug: "bitconned", type: "Film" },
];
