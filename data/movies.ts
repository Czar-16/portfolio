/** Editable shelf: change titles and years here and replace public/movies/<slug>.jpg. */
export type Movie = {
  rank: number;
  title: string;
  year: number;
  slug: string;
};

export const movies: Movie[] = [
  { rank: 1, title: "The Shawshank Redemption", year: 1994, slug: "the-shawshank-redemption" },
  { rank: 2, title: "Inception", year: 2010, slug: "inception" },
  { rank: 3, title: "Interstellar", year: 2014, slug: "interstellar" },
  { rank: 4, title: "The Dark Knight", year: 2008, slug: "the-dark-knight" },
  { rank: 5, title: "Parasite", year: 2019, slug: "parasite" },
  { rank: 6, title: "The Matrix", year: 1999, slug: "the-matrix" },
  { rank: 7, title: "Whiplash", year: 2014, slug: "whiplash" },
  { rank: 8, title: "The Godfather", year: 1972, slug: "the-godfather" },
  { rank: 9, title: "Pulp Fiction", year: 1994, slug: "pulp-fiction" },
  { rank: 10, title: "Arrival", year: 2016, slug: "arrival" },
  { rank: 11, title: "Mad Max: Fury Road", year: 2015, slug: "mad-max-fury-road" },
  { rank: 12, title: "Blade Runner 2049", year: 2017, slug: "blade-runner-2049" },
  { rank: 13, title: "Oppenheimer", year: 2023, slug: "oppenheimer" },
  { rank: 14, title: "Se7en", year: 1995, slug: "se7en" },
  { rank: 15, title: "Goodfellas", year: 1990, slug: "goodfellas" },
  { rank: 16, title: "Fight Club", year: 1999, slug: "fight-club" },
  { rank: 17, title: "Dune", year: 2021, slug: "dune" },
  { rank: 18, title: "Joker", year: 2019, slug: "joker" },
  { rank: 19, title: "The Prestige", year: 2006, slug: "the-prestige" },
  { rank: 20, title: "Gladiator", year: 2000, slug: "gladiator" },
];
