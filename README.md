# Match Cut
Školní webová aplikace pro lidi, kteří hledají tip na film od někoho s podobným vkusem. Zaregistrujete se, ohodnotíte známé filmy a v sekci **Taste Twins** uvidíte, kdo je hodnotil podobně a které další filmy doporučuje.

[Otevřít aplikaci](https://match-cut-film-club.classicpaper16.chatgpt.site/)

## Spuštění na počítači
Použijte Node.js 22.13 nebo novější. Z kořenového adresáře spusťte:

```sh
npm ci
npm test
npm run build
```

Při prvním spuštění vytvořte v místní databázi tabulky. Oba příkazy spusťte v uvedeném pořadí a pouze jednou pro novou databázi:

```sh
npx wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_dusty_iron_lad.sql
npx wrangler d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_slow_mentallo.sql
npm start
```

Otevřete adresu vypsanou v terminálu. Při dalším spuštění stačí `npm start`. Pro úpravy rozhraní použijte `npm run dev`.

## Orientace v projektu
- [Zadání projektu](docs/PROJECT.md)
- [Architektura a výpočet doporučení](DESIGN.md)
- [Přehled realizovaných kroků](ROADMAP.md)
- [Testování](docs/TESTING.md)
- [Pokyny pro další práci s AI](AGENTS.md)

Web běží na Sites. GitHub slouží ke sdílení zdrojového kódu. Lokální spuštění používá vlastní databázi bez účtů návštěvníků veřejného webu.
