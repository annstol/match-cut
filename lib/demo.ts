import { films } from "./films";
import type { Viewer } from "./taste";

const profiles = [
  ["Maya Chen","violet","Big ideas, quiet sci-fi, and stories that stick with you.","Sci-Fi","Drama","Blade Runner 2049|Contact|Gattaca|Her|Moon|2001: A Space Odyssey|Solaris","545324535455533344354454"],
  ["Jonah Reed","teal","Space operas, intricate timelines, and a good chase scene.","Sci-Fi","Action","Dune: Part Two|Edge of Tomorrow|The Empire Strikes Back|Terminator 2: Judgment Day|The Martian|Minority Report|Tenet","543325535445522343433454"],
  ["Lena Ortiz","rose","Messy relationships, warm comedies, and big feelings.","Romance","Comedy","Past Lives|Before Sunrise|Eternal Sunshine of the Spotless Mind|Brooklyn|Amélie|About Time|Notting Hill","433455343424224354455324"],
  ["Eli Brooks","amber","Courtrooms, crime sagas, and moral gray areas.","Crime","Drama","12 Angry Men|Heat|The Godfather|City of God|Goodfellas|Prisoners|The Departed","455235324523333353543233"],
  ["Noor Haddad","green","Animated worlds, folklore, and handmade details.","Animation","Fantasy","Princess Mononoke|Howl's Moving Castle|Wolfwalkers|Kubo and the Two Strings|My Neighbor Totoro|Coraline|Fantastic Mr. Fox","333542344423425323354435"],
  ["Sofia Bell","rose","Musicals, bittersweet romances, and performers under pressure.","Music","Romance","Sing Street|Once|Amadeus|Singin' in the Rain|The Sound of Music|Moulin Rouge!|A Star Is Born","345454352422224334343325"],
  ["Ravi Kapoor","teal","Twisty mysteries, tense thrillers, and unreliable narrators.","Thriller","Crime","Memento|Memories of Murder|The Prestige|Zodiac|Se7en|Gone Girl|The Silence of the Lambs","455245435433445355553343"],
  ["Iris Morgan","violet","Atmospheric horror and films that linger after the credits.","Horror","Thriller","The Thing|The Shining|Hereditary|The Witch|Talk to Me|The Wailing|Alien","354233423322454254532342"],
  ["Theo Park","amber","Stunts, practical effects, and fast-paced adventures.","Action","Fantasy","Mad Max: Fury Road|Top Gun: Maverick|Mission: Impossible – Fallout|John Wick|The Raid|Police Story|Gladiator","443335435454423443335554"],
  ["Ana Silva","green","Intimate dramas and a soft spot for world cinema.","Drama","Romance","A Separation|Aftersun|Drive My Car|Shoplifters|Portrait of a Lady on Fire|In the Mood for Love|Perfect Days","355453354523234534344325"],
  ["Jules Hart","rose","Oddball comedies, inventive sets, and memorable ensembles.","Comedy","Animation","Moonrise Kingdom|The Royal Tenenbaums|The Big Lebowski|Little Miss Sunshine|Hot Fuzz|Barbie|Ratatouille","343553343325325534345435"],
  ["Sam Rivera","amber","Pixar, superhero stories, and a proper movie-night blockbuster.","Animation","Action","Toy Story|The Incredibles|Up|The Lord of the Rings: The Return of the King|Paddington 2|Kung Fu Panda|Puss in Boots: The Last Wish","433525334424524343354555"],
] as const;

export const demoViewers: Viewer[] = profiles.map(([name, color, bio, favorite, second, favoritesText, scores], index) => {
  const favorites = new Set(favoritesText.split("|"));
  const ratings: Viewer["ratings"] = {};
  films.forEach((film, filmIndex) => {
    if (filmIndex < scores.length) {
      ratings[film.id] = Number(scores[filmIndex]);
      return;
    }
    if (favorites.has(film.title)) {
      ratings[film.id] = 5;
      return;
    }
    // Different people discover different films, but their ratings follow genre preferences.
    const variation = (film.id.length + film.year + filmIndex * 13 + index * 7) % 11;
    if (film.genres.includes(favorite) && variation < 6) ratings[film.id] = variation < 4 ? 4 : 3;
    else if (film.genres.includes(second) && variation < 4) ratings[film.id] = variation < 2 ? 4 : 3;
    else if (variation === 10) ratings[film.id] = 2;
  });
  return { id: `demo-${index + 1}`, name, color, bio, demo: true, ratings };
});
