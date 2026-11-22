# Jak funguje Match Cut
Rozhraní v Reactu najdete v `app/match-cut.tsx`, katalog v `lib/films.ts` a profily fiktivních diváků v `lib/demo.ts`. Vinext sestaví aplikaci pro Cloudflare Workers. Rozhraní `app/api/auth` obsluhuje účty a relace, `app/api/taste` pracuje s hodnocením a výsledky. Účty a hodnocení skutečných uživatelů se ukládají do databáze D1. SQL migrace jsou ve složce `drizzle/`.

## Shoda mezi diváky
Funkce `findMatches` v `lib/taste.ts` potřebuje alespoň pět filmů, které oba lidé ohodnotili. Z průměrného absolutního rozdílu známek na škále 1–5 vypočítá míru shody. U malého počtu společných filmů posune výsledek blíž k 50 %. Shody pod 55 % vyřadí a vrátí nejvýše šest profilů.

## Výběr filmu
Funkce `buildResults` vybere až tři nejbližší profily. Vyřadí filmy, které už uživatel ohodnotil nebo označil jako zhlédnuté. Alespoň jeden z profilů musí dát filmu 4 nebo 5 bodů a vážený průměr musí být alespoň 3,75. U každého tipu je uvedeno, komu se film líbil.
