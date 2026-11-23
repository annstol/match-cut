const featured = [
  ["Interstellar",2014,"Sci-Fi,Drama","gEU2QniE6E77NI6lCU6MxlNBvIx"],
  ["Parasite",2019,"Thriller,Drama","7IiTTgloJzvGI1TAYymCfbfl3vT"],
  ["Whiplash",2014,"Drama,Music","7fn624j5lj3xTme2SgiLCeuedmO"],
  ["Spirited Away",2001,"Animation,Fantasy","39wmItIWsg5sZMyRUHLkWBcuVCM"],
  ["The Grand Budapest Hotel",2014,"Comedy,Drama","eWdyYQreja6JGCzqHWXpWHDrrPo"],
  ["The Dark Knight",2008,"Action,Thriller","qJ2tW6WMUDux911r6m7haRef0WH"],
  ["Arrival",2016,"Sci-Fi,Drama","x2FJsf1ElAgr63Y3PNPtJrcmpoe"],
  ["La La Land",2016,"Romance,Music","uDO8zWDhfWwoFdKS4fzkUJt0Rf0"],
  ["Inception",2010,"Sci-Fi,Action","oYuLEt3zVCKq57qu2F8dT7NIa6f"],
  ["The Shawshank Redemption",1994,"Drama","q6y0Go1tsGEsmtFryDOJo3dEmqu"],
  ["Dune",2021,"Sci-Fi,Action","d5NXSklXo0qyIYkgV94XAgMIckC"],
  ["Everything Everywhere All at Once",2022,"Sci-Fi,Comedy","w3LxiVYdWWRvEVdn5RYq6jIqkb1"],
  ["The Matrix",1999,"Sci-Fi,Action","f89U3ADr1oiB1s9GkdPOEpXUk5H"],
  ["Get Out",2017,"Horror,Thriller","tFXcEccSQMf3lfhfXKSU9iRBpa3"],
  ["WALL·E",2008,"Animation,Sci-Fi","hbhFnRzzg6ZDmm8YAmxBnQpQIPh"],
  ["The Social Network",2010,"Drama","n0ybibhJtQ5icDqTp8eRytcIHJx"],
  ["Pulp Fiction",1994,"Crime,Comedy","d5iIlFn5s0ImszYzBPb8JPIfbXD"],
  ["Forrest Gump",1994,"Drama,Romance","arw2vcBveWOVZr6pxd9XTd1TdQa"],
  ["Fight Club",1999,"Thriller,Drama","pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK"],
  ["Spider-Man: Into the Spider-Verse",2018,"Animation,Action","iiZZdoQBEYBv6id8su7ImL0oCbD"],
  ["The Truman Show",1998,"Comedy,Drama","vuza0WqY239yBXOadKlGwJsZJFE"],
  ["Back to the Future",1985,"Sci-Fi,Comedy","fNOH9f1aA7XRTzl1sAOx9iF553Q"],
  ["Mad Max: Fury Road",2015,"Action,Sci-Fi","hA2ple9q4qnwxp3hKVNhroipsir"],
  ["Coco",2017,"Animation,Music","gGEsBPAijhVUFoiNpgZXqRVWJt2"],
] as const;

const collections: Record<string,string> = {
  "Sci-Fi,Drama": "Blade Runner 2049|2017;Her|2013;Ex Machina|2014;Contact|1997;2001: A Space Odyssey|1968;Moon|2009;Gattaca|1997;Solaris|1972;Ad Astra|2019;Close Encounters of the Third Kind|1977;The Martian|2015;Gravity|2013;Stalker|1979;A.I. Artificial Intelligence|2001;Under the Skin|2013",
  "Sci-Fi,Action": "Dune: Part Two|2024;Edge of Tomorrow|2014;Terminator 2: Judgment Day|1991;Aliens|1986;Rogue One: A Star Wars Story|2016;Star Wars|1977;The Empire Strikes Back|1980;Return of the Jedi|1983;RoboCop|1987;Total Recall|1990;Minority Report|2002;District 9|2009;Children of Men|2006;Looper|2012;Tenet|2020;War for the Planet of the Apes|2017",
  "Action,Thriller": "Die Hard|1988;John Wick|2014;Mission: Impossible – Fallout|2018;The Bourne Identity|2002;Casino Royale|2006;Top Gun: Maverick|2022;The Raid|2011;Speed|1994;Kill Bill: Vol. 1|2003;Gladiator|2000;Baby Driver|2017;The Fugitive|1993;Police Story|1985;The Batman|2022;The Dark Knight Rises|2012;Batman Begins|2005",
  "Thriller,Crime": "Se7en|1995;Zodiac|2007;Prisoners|2013;Gone Girl|2014;Memento|2000;The Silence of the Lambs|1991;The Departed|2006;Heat|1995;No Country for Old Men|2007;Oldboy|2003;Memories of Murder|2003;Decision to Leave|2022;Nightcrawler|2014;Sicario|2015;Knives Out|2019;Glass Onion|2022;The Prestige|2006;Shutter Island|2010;Collateral|2004;The Girl with the Dragon Tattoo|2011",
  "Crime,Drama": "The Godfather|1972;The Godfather Part II|1974;Goodfellas|1990;Casino|1995;City of God|2002;A Prophet|2009;The Irishman|2019;The Untouchables|1987;Reservoir Dogs|1992;Dog Day Afternoon|1975;Taxi Driver|1976;A Clockwork Orange|1971",
  "Drama": "12 Angry Men|1957;The Green Mile|1999;Oppenheimer|2023;Anatomy of a Fall|2023;The Zone of Interest|2023;Aftersun|2022;The Father|2020;Nomadland|2020;Moonlight|2016;Manchester by the Sea|2016;There Will Be Blood|2007;Phantom Thread|2017;The Master|2012;Good Will Hunting|1997;Dead Poets Society|1989;The Holdovers|2023;Perfect Days|2023;Sound of Metal|2019;The Lives of Others|2006;Shoplifters|2018;A Separation|2011;Drive My Car|2021;Cinema Paradiso|1988;Minari|2020;Boyhood|2014;The Hunt|2012;Portrait of a Lady on Fire|2019;Incendies|2010;Rocky|1976;Creed|2015",
  "Comedy,Drama": "Little Miss Sunshine|2006;Lady Bird|2017;The French Dispatch|2021;Moonrise Kingdom|2012;The Royal Tenenbaums|2001;Rushmore|1998;The Banshees of Inisherin|2022;The Worst Person in the World|2021;The Farewell|2019;Palm Springs|2020;Groundhog Day|1993;Lost in Translation|2003;The Big Lebowski|1998;The Apartment|1960;Barbie|2023;Clueless|1995;Mean Girls|2004;Booksmart|2019;School of Rock|2003;Ferris Bueller's Day Off|1986;The Nice Guys|2016;Hot Fuzz|2007;Shaun of the Dead|2004;The Intouchables|2011;Amélie|2001;Jojo Rabbit|2019;Hunt for the Wilderpeople|2016;Frances Ha|2012",
  "Romance,Drama": "Eternal Sunshine of the Spotless Mind|2004;Before Sunrise|1995;Before Sunset|2004;Before Midnight|2013;Past Lives|2023;In the Mood for Love|2000;Chungking Express|1994;Pride & Prejudice|2005;Casablanca|1942;Titanic|1997;Roman Holiday|1953;Notting Hill|1999;When Harry Met Sally...|1989;About Time|2013;Brooklyn|2015;Little Women|2019;Brokeback Mountain|2005;The Notebook|2004;Call Me by Your Name|2017;10 Things I Hate About You|1999;The Big Sick|2017",
  "Music,Drama": "Sing Street|2016;Once|2007;Inside Llewyn Davis|2013;Almost Famous|2000;A Star Is Born|2018;Amadeus|1984;Walk the Line|2005;The Sound of Music|1965;Singin' in the Rain|1952;Moulin Rouge!|2001;West Side Story|2021;tick, tick... BOOM!|2021",
  "Animation,Fantasy": "My Neighbor Totoro|1988;Princess Mononoke|1997;Howl's Moving Castle|2004;Kiki's Delivery Service|1989;Castle in the Sky|1986;The Boy and the Heron|2023;Your Name|2016;Suzume|2022;Coraline|2009;Kubo and the Two Strings|2016;Song of the Sea|2014;Wolfwalkers|2020;Fantastic Mr. Fox|2009;The Nightmare Before Christmas|1993;Shrek|2001;Puss in Boots: The Last Wish|2022",
  "Animation,Comedy": "Toy Story|1995;Toy Story 2|1999;Toy Story 3|2010;Inside Out|2015;Up|2009;Ratatouille|2007;Finding Nemo|2003;Monsters, Inc.|2001;The Incredibles|2004;Soul|2020;The Mitchells vs. the Machines|2021;Marcel the Shell with Shoes On|2021;Zootopia|2016;Kung Fu Panda|2008;The Lego Movie|2014;Klaus|2019;Paddington 2|2017",
  "Horror,Thriller": "Alien|1979;The Thing|1982;The Shining|1980;Psycho|1960;Jaws|1975;Halloween|1978;Scream|1996;The Sixth Sense|1999;Hereditary|2018;Midsommar|2019;The Witch|2015;The Lighthouse|2019;The Babadook|2014;It Follows|2014;A Quiet Place|2018;Train to Busan|2016;The Wailing|2016;The Ring|2002;The Blair Witch Project|1999;Nope|2022;Us|2019;Talk to Me|2022;The Substance|2024;Nosferatu|2024",
  "Fantasy,Action": "The Lord of the Rings: The Fellowship of the Ring|2001;The Lord of the Rings: The Two Towers|2002;The Lord of the Rings: The Return of the King|2003;Harry Potter and the Sorcerer's Stone|2001;Harry Potter and the Prisoner of Azkaban|2004;Pirates of the Caribbean: The Curse of the Black Pearl|2003;Pan's Labyrinth|2006;The Princess Bride|1987;Stardust|2007;The NeverEnding Story|1984;Crouching Tiger, Hidden Dragon|2000;The Green Knight|2021",
};

export type Film = { id: string; title: string; year: number; genres: string[]; poster?: string };
function film(title: string, year: number, genres: string, poster?: string): Film {
  const slug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/-$/, "");
  return { id: `${slug}-${year}`, title, year, genres: genres.split(","), poster };
}
export const films = [
  ...featured.map(([title, year, genres, poster]) => film(title, year, genres, poster)),
  ...Object.entries(collections).flatMap(([genres, entries]) => entries.split(";").map((entry) => {
    const [title, year] = entry.split("|");
    return film(title, Number(year), genres);
  })),
];
export const filmsById = new Map(films.map((entry) => [entry.id, entry]));
export const genres = [...new Set(films.flatMap((entry) => entry.genres))].sort();
