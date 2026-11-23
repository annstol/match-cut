"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { Check, Clapperboard, Film as FilmIcon, Heart, List, Search, Sparkles, Star, User, Users, X } from "lucide-react";
import { films, filmsById, genres, type Film } from "../lib/films";
import { minimumOverlap, type Results, type Scores } from "../lib/taste";

type View = "Discover" | "My Ratings" | "Taste Twins";
type Profile = { name: string; color: string };
type Account = Partial<Results> & { signedIn: boolean; profile: Profile | null; scores?: Scores };
type Match = Results["matches"][number];
const emptyScores: Scores = {};
const pageSize = 15;
const initialGenres = ["All genres", "Drama", "Sci-Fi", "Thriller", "Comedy", "Animation"];
const swatches = ["#572334", "#193f44", "#584020", "#24335c", "#54434e", "#434222", "#452f54"];

function initials(name: string) {
  return name.split(/\s+/).slice(0, 2).map((piece) => Array.from(piece)[0]).join("").toUpperCase();
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
  }, []);
  return <dialog ref={ref} className="modal" aria-labelledby="dialog-title"
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="modal-body">
      <button className="icon-button close" aria-label="Close" onClick={onClose}><X size={22} /></button>
      <h2 id="dialog-title">{title}</h2>
      {children}
    </div>
  </dialog>;
}

export function MatchCut() {
  const [view, setView] = useState<View>("Discover");
  const [account, setAccount] = useState<Account | null>(null);
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState("All genres");
  const [count, setCount] = useState(pageSize);
  const [selected, setSelected] = useState<Film | null>(null);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);
  const [name, setName] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const gridStart = useRef<HTMLElement>(null);
  const searchField = useRef<HTMLInputElement>(null);

  async function refresh() {
    const response = await fetch("/api/taste", { cache: "no-store" });
    const data = await response.json() as Account & { error?: string };
    if (!response.ok) throw new Error(data.error);
    setAccount(data);
  }
  useEffect(() => {
    refresh().catch((reason) => setError(reason.message));
  }, []);

  const scores = account?.scores ?? emptyScores;
  const ratedCount = Object.values(scores).filter((score) => score !== null).length;
  const watchedCount = Object.keys(scores).length;
  const matches = account?.matches ?? [];
  const recommendations = account?.recommendations ?? [];
  const search = query.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const filtered = films.filter((film) => {
    const title = film.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    return (genre === "All genres" || film.genres.includes(genre)) && (!search || `${title} ${film.year}`.includes(search));
  });
  const ratedFilms = films.filter((film) => Object.hasOwn(scores, film.id));

  function navigate(next: View) {
    setView(next);
    setError("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function discover() {
    if (view === "Discover") gridStart.current?.scrollIntoView({ behavior: "smooth" });
    else {
      setView("Discover");
      window.setTimeout(() => gridStart.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }
  function openProfile(mode: "login" | "register" = "login") {
    setError("");
    setName(account?.profile?.name ?? "");
    setAuthMode(mode);
    setUsername("");
    setPassword("");
    setProfileOpen(true);
  }
  function closeProfile() {
    setError("");
    setPassword("");
    setProfileOpen(false);
  }
  async function post(command: object, endpoint = "/api/taste") {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(command),
    });
    const data = await response.json() as { error?: string };
    if (!response.ok) throw new Error(data.error);
  }
  async function authenticate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post({ action: authMode, username, password }, "/api/auth");
      setPassword("");
      await refresh();
      closeProfile();
      setNotice(authMode === "register" ? "Your account is ready." : "You’re logged in.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not sign in.");
    } finally {
      setBusy(false);
    }
  }
  async function logOut() {
    setBusy(true);
    setError("");
    try {
      await post({ action: "logout" }, "/api/auth");
      setAccount({ signedIn: false, profile: null });
      closeProfile();
      setNotice("You’re logged out.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not log out.");
    } finally {
      setBusy(false);
    }
  }
  async function saveProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await post({ action: "profile", name });
      await refresh();
      closeProfile();
      setNotice("Display name saved.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save your profile.");
    } finally {
      setBusy(false);
    }
  }
  async function rate(film: Film, score?: number | null) {
    if (!account?.profile) {
      openProfile("register");
      return;
    }
    setBusy(true);
    setError("");
    try {
      await post({ action: score === undefined ? "clear" : "rate", filmId: film.id, score });
      await refresh();
      setSelected(null);
      setNotice(score === undefined ? `Removed ${film.title} from your films.` : score === null
        ? `Marked ${film.title} as watched.` : `Saved ${score}/5 for ${film.title}.`);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not save your rating.");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3900);
    return () => window.clearTimeout(timer);
  }, [notice]);

  function filmCard(film: Film, pick?: Results["recommendations"][number]) {
    const score = scores[film.id];
    return <article className="film-card" key={film.id}>
      <button className={`poster ${film.poster ? "has-poster" : "catalog-art"}`}
        style={{ backgroundColor: swatches[(film.year + film.title.length) % swatches.length] }}
        aria-label={`Rate ${film.title}`} onClick={() => { setError(""); setSelected(film); }}>
        {film.poster ? <img src={`/posters/${film.poster}.jpg`} alt="" loading="lazy" /> :
          <span className="poster-title"><FilmIcon size={24} strokeWidth={1.4} />{film.title}</span>}
        {Object.hasOwn(scores, film.id) && <span className="rating-pin">{score === null ? <Check size={15} /> : <><Star size={13} fill="currentColor" />{score}</>}</span>}
        <span className="poster-action"><Star size={15} /> {score != null ? "Edit rating" : "Rate film"}</span>
      </button>
      <button className="film-title" onClick={() => { setError(""); setSelected(film); }}>{film.title}</button>
      <p className="film-meta">{film.year} <span>·</span> {film.genres[0]}</p>
      {pick && <p className="why-pick">{pick.fans.slice(0, 2).map((fan) => `${fan.name} · ${fan.score}/5`).join(" · ")}{pick.fans.length > 2 && ` +${pick.fans.length - 2}`}</p>}
    </article>;
  }

  const steps = Math.min(ratedCount, minimumOverlap);
  return <>
    <header className="topbar">
      <div className="top-inner">
        <button className="brand" onClick={() => navigate("Discover")} aria-label="Match Cut home">
          <span className="brand-icon"><Clapperboard size={19} strokeWidth={2.4} /></span><span>MATCH<span className="accent">CUT</span></span>
        </button>
        <nav aria-label="Main navigation">
          <button className={view === "Discover" ? "active" : ""} onClick={() => navigate("Discover")}><FilmIcon size={16} /> Discover</button>
          <button className={view === "My Ratings" ? "active" : ""} onClick={() => navigate("My Ratings")}><Star size={16} /> My Ratings</button>
          <button className={view === "Taste Twins" ? "active" : ""} onClick={() => navigate("Taste Twins")}><Users size={17} /> Taste Twins</button>
        </nav>
        <button className="profile-button" onClick={() => openProfile()}><User size={16} /> <span>{account?.profile?.name ?? "Log in"}</span></button>
      </div>
    </header>
    <main className="shell">
      {error && !selected && !profileOpen && <p className="error" role="alert">{error} <button onClick={() => { setError(""); refresh().catch((reason) => setError(reason.message)); }}>Retry</button></p>}

      {view === "Discover" && <>
        <section className="hero">
          <div className="hero-content">
            <h1>Find your<br /><em>taste twin.</em></h1>
            <p>Rate films you’ve seen, meet people who share your taste, and find your next favorite.</p>
            <div className="hero-actions">
              <button className="button primary" onClick={discover}><Star size={17} /> Start rating</button>
            </div>
          </div>
        </section>
        <div className="content-layout">
          <section ref={gridStart} className="browse" aria-labelledby="browse-title">
            <div className="section-top">
              <div><h2 id="browse-title">Discover films</h2><p className="section-note">{films.length} films to explore</p></div>
              <label className="search"><Search size={18} /><input ref={searchField} aria-label="Search films" placeholder="Search films…" value={query} onChange={(event) => { setQuery(event.target.value); setCount(pageSize); }} />
                {query && <button className="icon-button" type="button" aria-label="Clear search" onClick={() => { setQuery(""); setCount(pageSize); searchField.current?.focus(); }}><X size={15} /></button>}</label>
            </div>
            <div className="filters" aria-label="Genre filters">
              {initialGenres.map((label) => <button className={genre === label ? "chosen" : ""} aria-pressed={genre === label} key={label} onClick={() => { setGenre(label); setCount(pageSize); }}>{label}</button>)}
              <select aria-label="More genres" value={initialGenres.includes(genre) ? "" : genre} onChange={(event) => { setGenre(event.target.value || "All genres"); setCount(pageSize); }}>
                <option value="">More genres</option>
                {genres.filter((entry) => !initialGenres.includes(entry)).map((entry) => <option key={entry}>{entry}</option>)}
              </select>
            </div>
            {filtered.length ? <div className="film-grid">{filtered.slice(0, count).map((film) => filmCard(film))}</div> :
              <div className="empty"><Search size={28} /><h3>No films found</h3><p>Try a different title, year, or genre.</p><button className="button quiet" onClick={() => { setQuery(""); setGenre("All genres"); setCount(pageSize); }}>Clear filters</button></div>}
            {filtered.length > count && <button className="button more" onClick={() => setCount(count + pageSize)}>Show more films <span>{count} / {filtered.length}</span></button>}
          </section>
          <aside className="sidebar">
            <section className="panel progress-panel">
              <div className="panel-icon"><Users size={21} /></div>
              <h3>Your taste twins</h3>
              <p>{ratedCount < minimumOverlap ? "Rate five films to start finding people who share your taste." : matches.length ? `We found ${matches.length} ${matches.length === 1 ? "person" : "people"} with similar film taste.` : "Keep rating films to find someone with enough ratings in common."}</p>
              <div className="progress-label"><span>Ratings</span><strong>{steps} / {minimumOverlap}</strong></div>
              <div className="progress-track" role="progressbar" aria-label="Ratings toward taste twins" aria-valuenow={steps} aria-valuemax={minimumOverlap} aria-valuemin={0}>
                {Array.from({ length: minimumOverlap }, (_, index) => <span key={index} className={index < steps ? "filled" : ""} />)}
              </div>
              <button className="button panel-button" onClick={() => navigate("Taste Twins")}><Users size={16} /> View taste twins</button>
            </section>
            <section className="panel how-panel">
              <h3>How it works</h3>
              <ul>
                <li><span><Star size={17} /></span><div><strong>Rate what you’ve seen</strong><p>Give films one to five stars.</p></div></li>
                <li><span><Users size={17} /></span><div><strong>Find your twins</strong><p>Compare ratings on films you both know.</p></div></li>
                <li><span><Sparkles size={17} /></span><div><strong>Find your next watch</strong><p>See films your twins loved.</p></div></li>
              </ul>
            </section>
          </aside>
        </div>
      </>}

      {view === "My Ratings" && <section className="inner-page">
        <div className="inner-heading"><span className="panel-icon"><List size={24} /></span><h1>My Ratings</h1>
          <p>{watchedCount ? `${ratedCount} rated · ${watchedCount} watched` : "Keep a record of the films you’ve seen."}</p></div>
        {ratedFilms.length ? <div className="film-grid large-grid">{ratedFilms.map((film) => filmCard(film))}</div> :
          <div className="empty"><Star size={32} /><h2>No rated or watched films yet</h2><p>Pick a film from the catalog and give it a rating or mark it as watched.</p><button className="button primary" onClick={discover}>Browse films</button></div>}
      </section>}

      {view === "Taste Twins" && <section className="inner-page">
        <div className="inner-heading"><span className="panel-icon"><Users size={24} /></span><h1>Taste Twins</h1>
          <p>See who shares your taste and what they’d put on your watchlist.</p></div>
        {matches.length ? <>
          <div className="match-grid">{matches.map((match) => <article className="panel match-card" key={match.id}>
            <div className="match-top"><span className={`avatar ${match.color}`}>{initials(match.name)}</span><span className="match-score">{match.percent}% match</span></div>
            <h2>{match.name}</h2><p>{match.bio || "Match Cut member"}</p>
            <button className="button quiet" onClick={() => setSelectedMatch(match)}><FilmIcon size={16} /> {match.shared.length} films in common</button>
            {match.demo && <span className="seed-tag">Fictional profile</span>}
          </article>)}</div>
          <div className="recommend-heading"><h2>Recommended for you</h2><p>Films your closest twins rated highly. Mark a film as watched to remove it from your recommendations.</p></div>
          {recommendations.length ? <div className="film-grid large-grid">{recommendations.map((pick) => {
            const film = filmsById.get(pick.filmId);
            return film ? filmCard(film, pick) : null;
          })}</div> : <div className="empty"><FilmIcon size={28} /><h3>You’re caught up</h3><p>There are no unwatched picks from your closest twins right now.</p></div>}
          <details className="method"><summary>How matches and recommendations are calculated</summary>
            <p>We compare ratings on at least five films you both rated. Smaller gaps mean a closer match, and more shared ratings make the score more reliable. Recommendations use ratings from your three closest matches, with more weight given to the closest ones. A film must have at least one rating of four stars or more. Films you’ve rated or marked as watched are left out.</p></details>
        </> : <div className="empty">
          <Heart size={32} /><h2>{ratedCount < minimumOverlap ? "Your twins are a few ratings away" : "No close matches yet"}</h2>
          <p>{ratedCount < minimumOverlap ? `Rate ${minimumOverlap - ratedCount} more ${minimumOverlap - ratedCount === 1 ? "film" : "films"} to start matching.` : "Try rating more of the suggested films to build up your shared ratings."}</p>
          <button className="button primary" onClick={discover}>Rate films</button>
        </div>}
      </section>}

      <footer><span className="footer-brand"><Clapperboard size={16} /> MATCH<span className="accent">CUT</span></span><span>A school project about shared taste in film. Poster artwork via TMDB.</span></footer>
    </main>
    {notice && <div className="toast" role="status"><Check size={18} /> {notice}</div>}
    {selected && !profileOpen && <Modal title={selected.title} onClose={() => { setSelected(null); setError(""); }}>
      <p className="section-note">{selected.year} · {selected.genres.join(", ")}</p>
      <div className="star-buttons" aria-label="Rate this film">
        {[1, 2, 3, 4, 5].map((value) => <button disabled={busy} key={value} aria-label={`Rate ${value} ${value === 1 ? "star" : "stars"}`} aria-pressed={scores[selected.id] === value}
          className={value <= (scores[selected.id] ?? 0) ? "lit" : ""} onClick={() => rate(selected, value)}><Star size={32} /></button>)}
      </div>
      <div className="film-options">
        <button className="button quiet" disabled={busy || Object.hasOwn(scores, selected.id)} onClick={() => rate(selected, null)}><Check size={17} /> {Object.hasOwn(scores, selected.id) ? "Watched" : "Mark as watched"}</button>
        {Object.hasOwn(scores, selected.id) && <button className="text-button" disabled={busy} onClick={() => rate(selected)}>Remove from my films</button>}
      </div>
      {error && <p className="error" role="alert">{error}</p>}
    </Modal>}
    {selectedMatch && <Modal title={selectedMatch.name} onClose={() => setSelectedMatch(null)}>
      <p>{selectedMatch.percent}% match · {selectedMatch.shared.length} shared ratings</p>
      <div className="comparison"><table><thead><tr><th>Film</th><th>You</th><th>{selectedMatch.name.split(" ")[0]}</th></tr></thead>
        <tbody>{[...selectedMatch.shared].sort((a, b) => Math.abs(a.own - a.theirs) - Math.abs(b.own - b.theirs)).map((pair) =>
          <tr key={pair.filmId}><td>{filmsById.get(pair.filmId)?.title}</td><td>{pair.own}/5</td><td>{pair.theirs}/5</td></tr>)}</tbody></table></div>
    </Modal>}
    {profileOpen && <Modal title={account?.profile ? "Your profile" : authMode === "register" ? "Create an account" : "Log in to Match Cut"} onClose={closeProfile}>
      {account?.profile ? <form onSubmit={saveProfile}>
        <p>Choose the name your taste twins will see.</p>
        <label className="form-label">Display name<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Enter your name" minLength={2} maxLength={30} required /></label>
        <div className="film-options"><button className="button primary" type="submit" disabled={busy}>Save name</button>
          <button className="button quiet" type="button" onClick={logOut} disabled={busy}>Log out</button></div>
      </form> : <form onSubmit={authenticate}>
        {authMode === "register" && <p>Create a username and password to save your ratings and find your taste twins.</p>}
        <label className="form-label">Username
          <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" autoCapitalize="none" spellCheck={false} minLength={3} maxLength={24}
            pattern="[A-Za-z0-9_]{3,24}" aria-describedby={authMode === "register" ? "username-hint" : undefined} required />
          {authMode === "register" && <span id="username-hint" className="field-hint">3–24 letters, numbers, or underscores.</span>}
        </label>
        <label className="form-label">Password
          <input key={authMode} type="password" value={password} onChange={(event) => setPassword(event.target.value)}
            autoComplete={authMode === "register" ? "new-password" : "current-password"} minLength={12} maxLength={128}
            aria-describedby={authMode === "register" ? "password-hint" : undefined} required />
          {authMode === "register" && <span id="password-hint" className="field-hint">Use at least 12 characters.</span>}
        </label>
        <div className="film-options">
          <button className="button primary" type="submit" disabled={busy}>{busy ? "Please wait…" : authMode === "register" ? "Create account" : "Log in"}</button>
          <button className="text-button" type="button" disabled={busy} onClick={() => {
            setError("");
            setPassword("");
            setAuthMode(authMode === "register" ? "login" : "register");
          }}>{authMode === "register" ? "I already have an account" : "Create an account"}</button>
        </div>
      </form>}
      {error && <p className="error" role="alert">{error}</p>}
    </Modal>}
  </>;
}
