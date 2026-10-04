/**
 * Personal movie library.
 *
 * IMPORTANT: the list below is a neutral, editable starter set — it is *not*
 * claimed to be Anoop's actual top 50. Replace the entries (or drop your own
 * files into `public/movies/<slug>.jpg`) and the page updates automatically.
 * The UI labels the list as a placeholder until `isPlaceholder` is false.
 */

export const genres = [
  "All",
  "Action",
  "Thriller",
  "Sci-Fi",
  "Drama",
  "Crime",
  "Comedy",
  "Adventure",
] as const;

export type Genre = (typeof genres)[number];

export type Movie = {
  rank: number;
  title: string;
  year: number;
  genres: Exclude<Genre, "All">[];
  slug: string;
};

/** Set to false once the list is your own curation. */
export const moviesArePlaceholder = true;

export const movies: Movie[] = [
  { rank: 1, title: "The Shawshank Redemption", year: 1994, genres: ["Drama", "Crime"], slug: "the-shawshank-redemption" },
  { rank: 2, title: "Inception", year: 2010, genres: ["Sci-Fi", "Thriller", "Action"], slug: "inception" },
  { rank: 3, title: "Interstellar", year: 2014, genres: ["Sci-Fi", "Drama", "Adventure"], slug: "interstellar" },
  { rank: 4, title: "The Dark Knight", year: 2008, genres: ["Action", "Crime", "Drama"], slug: "the-dark-knight" },
  { rank: 5, title: "Parasite", year: 2019, genres: ["Drama", "Thriller"], slug: "parasite" },
  { rank: 6, title: "The Matrix", year: 1999, genres: ["Sci-Fi", "Action"], slug: "the-matrix" },
  { rank: 7, title: "Whiplash", year: 2014, genres: ["Drama"], slug: "whiplash" },
  { rank: 8, title: "The Godfather", year: 1972, genres: ["Crime", "Drama"], slug: "the-godfather" },
  { rank: 9, title: "Pulp Fiction", year: 1994, genres: ["Crime", "Drama"], slug: "pulp-fiction" },
  { rank: 10, title: "Arrival", year: 2016, genres: ["Sci-Fi", "Drama"], slug: "arrival" },
  { rank: 11, title: "Mad Max: Fury Road", year: 2015, genres: ["Action", "Adventure", "Sci-Fi"], slug: "mad-max-fury-road" },
  { rank: 12, title: "Blade Runner 2049", year: 2017, genres: ["Sci-Fi", "Drama"], slug: "blade-runner-2049" },
  { rank: 13, title: "Oppenheimer", year: 2023, genres: ["Drama", "Thriller"], slug: "oppenheimer" },
  { rank: 14, title: "Se7en", year: 1995, genres: ["Crime", "Thriller"], slug: "se7en" },
  { rank: 15, title: "Goodfellas", year: 1990, genres: ["Crime", "Drama"], slug: "goodfellas" },
  { rank: 16, title: "Fight Club", year: 1999, genres: ["Drama", "Thriller"], slug: "fight-club" },
  { rank: 17, title: "Dune", year: 2021, genres: ["Sci-Fi", "Adventure"], slug: "dune" },
  { rank: 18, title: "Joker", year: 2019, genres: ["Drama", "Crime", "Thriller"], slug: "joker" },
  { rank: 19, title: "The Prestige", year: 2006, genres: ["Drama", "Thriller"], slug: "the-prestige" },
  { rank: 20, title: "Gladiator", year: 2000, genres: ["Action", "Drama", "Adventure"], slug: "gladiator" },
  { rank: 21, title: "Spirited Away", year: 2001, genres: ["Adventure", "Drama"], slug: "spirited-away" },
  { rank: 22, title: "Zodiac", year: 2007, genres: ["Crime", "Drama", "Thriller"], slug: "zodiac" },
  { rank: 23, title: "Prisoners", year: 2013, genres: ["Thriller", "Crime", "Drama"], slug: "prisoners" },
  { rank: 24, title: "The Departed", year: 2006, genres: ["Crime", "Drama", "Thriller"], slug: "the-departed" },
  { rank: 25, title: "Sicario", year: 2015, genres: ["Crime", "Thriller", "Action"], slug: "sicario" },
  { rank: 26, title: "Heat", year: 1995, genres: ["Crime", "Drama"], slug: "heat" },
  { rank: 27, title: "Casino", year: 1995, genres: ["Crime", "Drama"], slug: "casino" },
  { rank: 28, title: "2001: A Space Odyssey", year: 1968, genres: ["Sci-Fi", "Adventure"], slug: "2001-a-space-odyssey" },
  { rank: 29, title: "Alien", year: 1979, genres: ["Sci-Fi", "Thriller"], slug: "alien" },
  { rank: 30, title: "The Martian", year: 2015, genres: ["Sci-Fi", "Adventure", "Drama"], slug: "the-martian" },
  { rank: 31, title: "Forrest Gump", year: 1994, genres: ["Drama"], slug: "forrest-gump" },
  { rank: 32, title: "Saving Private Ryan", year: 1998, genres: ["Action", "Drama"], slug: "saving-private-ryan" },
  { rank: 33, title: "Top Gun: Maverick", year: 2022, genres: ["Action", "Drama"], slug: "top-gun-maverick" },
  { rank: 34, title: "John Wick", year: 2014, genres: ["Action", "Thriller"], slug: "john-wick" },
  { rank: 35, title: "Skyfall", year: 2012, genres: ["Action", "Thriller"], slug: "skyfall" },
  { rank: 36, title: "Avengers: Endgame", year: 2019, genres: ["Action", "Adventure", "Sci-Fi"], slug: "avengers-endgame" },
  { rank: 37, title: "Spider-Man: Into the Spider-Verse", year: 2018, genres: ["Adventure", "Action", "Comedy"], slug: "into-the-spider-verse" },
  { rank: 38, title: "Your Name", year: 2016, genres: ["Drama", "Adventure"], slug: "your-name" },
  { rank: 39, title: "Knives Out", year: 2019, genres: ["Comedy", "Crime", "Thriller"], slug: "knives-out" },
  { rank: 40, title: "Get Out", year: 2017, genres: ["Thriller"], slug: "get-out" },
  { rank: 41, title: "The Grand Budapest Hotel", year: 2014, genres: ["Comedy", "Drama"], slug: "the-grand-budapest-hotel" },
  { rank: 42, title: "Dr. Strangelove", year: 1964, genres: ["Comedy", "Drama"], slug: "dr-strangelove" },
  { rank: 43, title: "Superbad", year: 2007, genres: ["Comedy"], slug: "superbad" },
  { rank: 44, title: "The Wolf of Wall Street", year: 2013, genres: ["Crime", "Drama", "Comedy"], slug: "the-wolf-of-wall-street" },
  { rank: 45, title: "Catch Me If You Can", year: 2002, genres: ["Crime", "Drama", "Comedy"], slug: "catch-me-if-you-can" },
  { rank: 46, title: "Moneyball", year: 2011, genres: ["Drama"], slug: "moneyball" },
  { rank: 47, title: "Gone Girl", year: 2014, genres: ["Thriller", "Drama", "Crime"], slug: "gone-girl" },
  { rank: 48, title: "Casablanca", year: 1942, genres: ["Drama"], slug: "casablanca" },
  { rank: 49, title: "Psycho", year: 1960, genres: ["Thriller", "Crime"], slug: "psycho" },
  { rank: 50, title: "The Social Network", year: 2010, genres: ["Drama"], slug: "the-social-network" },
];
