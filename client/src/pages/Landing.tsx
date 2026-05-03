import { useEffect, useRef, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import styles from "./Landing.module.css";
import { useAuth } from "../context/AuthContext.js";

const MARQUEE_ITEMS = [
  "Strokes Gained: Tee",
  "Strokes Gained: Approach",
  "Strokes Gained: Short Game",
  "Strokes Gained: Putting",
  "Round-by-round trends",
  "PGA Tour baseline",
];

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(" ");
}

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function Landing() {
  const { user, loading } = useAuth();
  const az1Ref = useRef<HTMLImageElement>(null);
  const az2Ref = useRef<HTMLImageElement>(null);
  const az3Ref = useRef<HTMLImageElement>(null);
  const [scrolled, setScrolled] = useState(false);

  if (!loading && user) return <Navigate to="/profile" replace />;

  useEffect(() => {
    document.body.style.overflowX = "hidden";
    return () => { document.body.style.overflowX = ""; };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const speeds = [-0.15, 0.08, -0.25];
      [az1Ref, az2Ref, az3Ref].forEach((ref, i) => {
        if (ref.current) ref.current.style.transform = `translateY(${y * speeds[i]}px)`;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const inClass = styles.in;
    const io = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add(inClass); }),
      { threshold: 0.12 },
    );
    document.querySelectorAll(`.${styles.reveal}`).forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className={styles.wrapper}>
      <div className={styles.heroBg} aria-hidden="true" />

      {/* ── Sticky nav ─────────────────────────────────────────────────── */}
      <header className={cn(styles.top, scrolled && styles.scrolled)}>
        <a className={styles.brand} href="#hero">
          <span className={styles.brandDot} />
          Eagle Eyes
        </a>
        <nav className={styles.nav}>
          <a className={styles.navLink} href="#features">Features</a>
          <a className={styles.navLink} href="#workflow">How it works</a>
          <a className={styles.navLink} href="#stats">By the numbers</a>
          <a className={styles.navLink} href="/login">Sign In</a>
          <a className={styles.navCta} href="/register">Get Started →</a>
        </nav>
      </header>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className={styles.hero} id="hero">
        <img ref={az1Ref} className={styles.heroAzalea}
          style={{ top: 60, right: -40, width: 280, opacity: 0.55 }}
          src="/azaleas/azalea-purple.svg" alt="" />
        <img ref={az2Ref} className={styles.heroAzalea}
          style={{ bottom: -60, left: -40, width: 240, opacity: 0.35 }}
          src="/azaleas/azalea-white.svg" alt="" />
        <img ref={az3Ref} className={styles.heroAzalea}
          style={{ top: 320, left: "42%", width: 90, opacity: 0.45 }}
          src="/azaleas/azalea-purple.svg" alt="" />

        {/* Left column */}
        <div>
          <span className={cn(styles.eyebrow, styles.reveal)}>
            Strokes-gained tracking · for golfers
          </span>
          <h1 className={cn(styles.h1, styles.reveal, styles.d1)}>
            Sharper eyes<br />
            on every <span className={styles.h1Accent}>round.</span>
          </h1>
          <p className={cn(styles.lede, styles.reveal, styles.d2)}>
            Log shots in seconds. See exactly which part of your game is winning
            you strokes — and which is bleeding them — against a real PGA Tour baseline.
          </p>
          <div className={cn(styles.reveal, styles.d3)} style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <a className={cn(styles.btn, styles.btnPrimary)} href="/register">
              <PlusIcon />
              Get started free
            </a>
            <a className={cn(styles.btn, styles.btnGhost)} href="#features">
              See what you'll learn
            </a>
          </div>
          <div className={cn(styles.heroMeta, styles.reveal, styles.d4)}>
            <div className={styles.avatarStack}>
              {["JM", "RK", "AH", "SP"].map(init => (
                <span key={init} className={styles.avatar}>{init}</span>
              ))}
            </div>
            <div>
              <strong style={{ color: "#003D2B" }}>2,400+</strong> rounds logged this season ·{" "}
              <strong style={{ color: "#003D2B" }}>avg +0.8</strong> SG improvement after 10 rounds
            </div>
          </div>
        </div>

        {/* Right column — card stack */}
        <div className={cn(styles.cardStack, styles.reveal, styles.d3)}>
          {/* Card A — Scorecard */}
          <div className={cn(styles.floatCard, styles.cardScorecard)}>
            <div className={styles.scHead}>
              <div>
                <h4 style={{ margin: 0, color: "#003D2B", fontSize: 16, fontWeight: 800 }}>Pebble Beach</h4>
                <p style={{ margin: 0, color: "#4A6B57", fontSize: 12 }}>Apr 12 · 78 (+6)</p>
              </div>
              <span className={styles.scPill}>Hole 4</span>
            </div>
            {([
              { n: 1, lie: "Tee · 380y",      res: "→ Fairway",    sg: "+0.10", good: true  },
              { n: 2, lie: "Fairway · 140y",   res: "→ Green 12'", sg: "+0.42", good: true  },
              { n: 3, lie: "Green · 12'",      res: "→ 2'",        sg: "−0.05", good: false },
              { n: 4, lie: "Green · 2'",       res: "→ Holed",     sg: "+0.00", good: true  },
            ] as const).map(row => (
              <div key={row.n} className={styles.scRow}>
                <span className={styles.scNum}>{row.n}</span>
                <span className={styles.scLie}>{row.lie}</span>
                <span className={styles.scLie}>{row.res}</span>
                <span className={row.good ? styles.sgGood : styles.sgBad}>{row.sg}</span>
              </div>
            ))}
          </div>

          {/* Card B — Approach metric */}
          <div className={cn(styles.floatCard, styles.cardMetric)}>
            <p className={styles.metricLabel}>Avg SG : Approach</p>
            <p className={styles.metricValue}><span className={styles.metricPlus}>+</span>1.84</p>
            <div className={styles.metricBar}>
              <div className={styles.metricBarFill} style={{ width: "78%" }} />
            </div>
            <p className={styles.metricFoot}>Up 0.9 since March · 78th percentile</p>
          </div>

          {/* Card C — Sparkline */}
          <div className={cn(styles.floatCard, styles.cardChart)}>
            <p className={styles.chartTitle}>SG Total · last 8 rounds</p>
            <svg className={styles.visSpark} viewBox="0 0 280 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="sparkGrad" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%"   stopColor="#00563F" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#00563F" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="60" x2="280" y2="60" stroke="#C8DDD0" strokeDasharray="3 3" />
              <path d="M0,72 L40,68 L80,75 L120,55 L160,48 L200,40 L240,32 L280,28 L280,100 L0,100 Z" fill="url(#sparkGrad)" />
              <polyline fill="none" stroke="#003D2B" strokeWidth="2.5" points="0,72 40,68 80,75 120,55 160,48 200,40 240,32 280,28" />
              <circle cx="280" cy="28" r="5" fill="#F5D130" stroke="#003D2B" strokeWidth="2" />
            </svg>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#4A6B57" }}>
              <span>Mar 02</span>
              <span style={{ color: "#003D2B", fontWeight: 700 }}>+3.1 today</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Marquee strip ──────────────────────────────────────────────── */}
      <div className={styles.strip}>
        <div className={styles.stripTrack}>
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className={styles.stripItem}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── Features ───────────────────────────────────────────────────── */}
      <section className={styles.section} id="features">
        <div className={styles.wrap}>
          <p className={cn(styles.sectionEyebrow, styles.reveal)}>What it actually does</p>
          <h2 className={cn(styles.sectionTitle, styles.reveal, styles.d1)}>
            A scorecard that knows where strokes go.
          </h2>
          <p className={cn(styles.sectionLede, styles.reveal, styles.d2)}>
            Log every shot with its lie, distance, and result. Eagle Eyes does the math —
            comparing each shot to the PGA Tour baseline and crediting the right part of your game.
          </p>

          <div className={styles.featuresGrid}>
            {/* Large card */}
            <div className={cn(styles.feature, styles.featureLarge, styles.reveal)}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="5" /><circle cx="12" cy="12" r="1.5" fill="currentColor" />
                </svg>
              </div>
              <h3 className={styles.ftitle}>Strokes Gained, broken into four.</h3>
              <p className={styles.fbody}>
                Every shot is automatically classified — Tee, Approach, Short Game, or Putting —
                and benchmarked against PGA Tour expected strokes from the same lie and distance.
                Positive means you outperformed scratch. Negative means you didn't.
              </p>
              <div className={styles.preview}>
                <h5 className={styles.previewTitle}>Last round · Pebble Beach</h5>
                {([
                  { lab: "SG: Tee",        val: "+0.42" },
                  { lab: "SG: Approach",   val: "+1.20" },
                  { lab: "SG: Short Game", val: "+0.80" },
                  { lab: "SG: Putting",    val: "−0.62", red: true },
                ] as const).map(row => (
                  <div key={row.lab} className={styles.previewRow}>
                    <span className={styles.previewLab}>{row.lab}</span>
                    <span className={styles.previewVal} style={"red" in row ? { color: "#fca5a5" } : undefined}>{row.val}</span>
                  </div>
                ))}
                <div className={styles.previewRow} style={{ borderTop: "1.5px solid rgba(245,209,48,0.4)", paddingTop: 12 }}>
                  <span className={styles.previewLab} style={{ color: "#F5D130" }}>SG Total</span>
                  <span className={styles.previewVal} style={{ fontSize: 16 }}>+1.80</span>
                </div>
              </div>
            </div>

            <div className={cn(styles.feature, styles.reveal, styles.d1)}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4V3a1 1 0 011-1h4a1 1 0 011 1v1" /><path d="M9 10h6M9 14h6M9 18h4" />
                </svg>
              </div>
              <h3 className={styles.ftitle}>Shot-by-shot logging.</h3>
              <p className={styles.fbody}>
                Pick a starting lie, type the distance, set where the ball ended up. The next
                shot pre-fills automatically. Click <em>holed</em> when the ball drops.
              </p>
            </div>

            <div className={cn(styles.feature, styles.reveal, styles.d2)}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 21h18" /><path d="M4 17l5-6 4 3 7-9" />
                </svg>
              </div>
              <h3 className={styles.ftitle}>Trends over time.</h3>
              <p className={styles.fbody}>
                See exactly which category is climbing and which is dragging. The chart
                doesn't lie — practice the right thing.
              </p>
            </div>

            <div className={cn(styles.feature, styles.reveal, styles.d3)}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 22V4" /><path d="M5 4 L19 7 L5 11" /><circle cx="5" cy="22" r="1.2" fill="currentColor" />
                </svg>
              </div>
              <h3 className={styles.ftitle}>Six lie types, one truth.</h3>
              <p className={styles.fbody}>
                Tee, Fairway, Rough, Sand, Recovery, Green — distance in yards everywhere
                except the green, where it's feet. Every shot lands in the right bucket.
              </p>
            </div>

            <div className={cn(styles.feature, styles.reveal, styles.d4)}>
              <div className={styles.ficon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 12l3 3 5-7" /><circle cx="12" cy="12" r="9" />
                </svg>
              </div>
              <h3 className={styles.ftitle}>Yours forever, on your machine.</h3>
              <p className={styles.fbody}>
                Local-first. No subscription, no ads, no upselling. Your rounds, your data,
                your improvement.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Workflow ────────────────────────────────────────────────────── */}
      <section className={styles.section} id="workflow">
        <div className={styles.wrap}>
          <p className={cn(styles.sectionEyebrow, styles.reveal)}>Four taps to a logged round</p>
          <h2 className={cn(styles.sectionTitle, styles.reveal, styles.d1)}>
            It's faster than the scorecard in your bag.
          </h2>
          <div className={cn(styles.workflow, styles.reveal, styles.d2)}>
            <div className={styles.stepList}>
              <div className={styles.step}>
                <span className={styles.stepNum}>01</span>
                <div>
                  <h4 className={styles.stepTitle}>Add a hole.</h4>
                  <p className={styles.stepBody}>Set the par. The first shot starts on the tee at a sensible default — change it if you want.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>02</span>
                <div>
                  <h4 className={styles.stepTitle}>Log shots in flow.</h4>
                  <p className={styles.stepBody}>Each new shot starts where the last one ended. Three keystrokes per shot, max.</p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>03</span>
                <div>
                  <h4 className={styles.stepTitle}>Mark the holed shot.</h4>
                  <p className={styles.stepBody}>
                    Click <code className={styles.stepCode}>holed</code>. Eagle Eyes locks the end-lie and closes out the hole.
                  </p>
                </div>
              </div>
              <div className={styles.step}>
                <span className={styles.stepNum}>04</span>
                <div>
                  <h4 className={styles.stepTitle}>Save the round.</h4>
                  <p className={styles.stepBody}>Strokes gained are computed instantly across all four categories. The trend line updates the moment you save.</p>
                </div>
              </div>
            </div>

            <div className={styles.workflowVis}>
              <div className={styles.visOverlay} />
              <div className={styles.visContent}>
                <p className={styles.visMeta}>Round summary · live</p>
                <h3 className={styles.visH}>
                  Pebble Beach<br />
                  <span style={{ opacity: 0.6, fontSize: 18, fontWeight: 600 }}>Apr 12 · 78 (+6)</span>
                </h3>
                <div className={styles.visGrid}>
                  {([
                    { lab: "SG : Tee",        val: "+0.42", sub: "vs −0.10 last round" },
                    { lab: "SG : Approach",   val: "+1.20", sub: "vs +0.30 last round" },
                    { lab: "SG : Short Game", val: "+0.80", sub: "vs +0.10 last round" },
                    { lab: "SG : Putting",    val: "−0.62", sub: "vs +0.20 last round", red: true },
                  ] as const).map(c => (
                    <div key={c.lab} className={styles.visCard}>
                      <p className={styles.visLabel}>{c.lab}</p>
                      <p className={styles.visValue} style={"red" in c ? { color: "#fca5a5" } : undefined}>{c.val}</p>
                      <p className={styles.visSub}>{c.sub}</p>
                    </div>
                  ))}
                  <div className={cn(styles.visCard, styles.visCardFull)}>
                    <p className={styles.visLabel}>SG Total · last 8 rounds</p>
                    <svg className={styles.visSpark} viewBox="0 0 600 80" preserveAspectRatio="none">
                      <line x1="0" y1="50" x2="600" y2="50" stroke="rgba(245,209,48,0.2)" strokeDasharray="3 3" />
                      <polyline fill="none" stroke="#F5D130" strokeWidth="2.5" points="0,60 80,55 160,62 240,42 320,38 400,30 480,22 600,14" />
                      <circle cx="600" cy="14" r="5" fill="#F5D130" stroke="#fff" strokeWidth="2" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Metrics band ────────────────────────────────────────────────── */}
      <section className={styles.section} id="stats">
        <div className={styles.wrap}>
          <p className={cn(styles.sectionEyebrow, styles.reveal)}>By the numbers</p>
          <h2 className={cn(styles.sectionTitle, styles.reveal, styles.d1)}>A real baseline, not a vibe.</h2>
          <p className={cn(styles.sectionLede, styles.reveal, styles.d2)}>
            Eagle Eyes uses a simplified PGA Tour expected-strokes model spanning six lies and every
            sensible distance. No guesswork.
          </p>
          <div className={cn(styles.metricsBand, styles.reveal, styles.d3)}>
            {([
              { num: "6",    lab: "Lie types modelled"  },
              { num: "4",    lab: "SG categories"       },
              { num: "~12s", lab: "Per shot logged"     },
              { num: "0",    lab: "Subscription. Forever." },
            ] as const).map(m => (
              <div key={m.lab} className={styles.mbCell}>
                <p className={styles.mbNum}>{m.num}</p>
                <p className={styles.mbLab}>{m.lab}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pull quote ──────────────────────────────────────────────────── */}
      <section className={styles.quoteSection}>
        <div className={styles.wrap}>
          <p className={cn(styles.quote, styles.reveal)}>
            <span className={styles.quoteMark}>"</span>I thought my driver was the problem. Three weeks in,
            the chart told me my putter was costing me four shots a round.<span className={styles.quoteMark}>"</span>
          </p>
          <div className={cn(styles.quoteAuthor, styles.reveal, styles.d1)}>
            <span className={styles.quoteAv}>JM</span>
            <span>
              <b className={styles.quoteWhoName}>Jordan Maitland</b>
              <span className={styles.quoteWhoRole}>9 handicap · 14 rounds logged</span>
            </span>
          </div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className={styles.ctaSection} id="cta">
        <div className={styles.ctaBox}>
          <div className={styles.ctaInner}>
            <p className={cn(styles.ctaEyebrow, styles.reveal)}>Free · open · local-first</p>
            <h2 className={cn(styles.ctaH, styles.reveal, styles.d1)}>
              Stop guessing.<br />Start improving.
            </h2>
            <p className={cn(styles.ctaP, styles.reveal, styles.d2)}>
              Log your next round shot-by-shot. Within ten rounds you'll know exactly which part of
              your game to spend Saturday morning on.
            </p>
            <div className={cn(styles.ctaRow, styles.reveal, styles.d3)}>
              <Link className={cn(styles.btn, styles.btnYellow)} to="/register">
                <PlusIcon />
                Create your free account
              </Link>
              <a className={cn(styles.btn, styles.btnOutline)} href="#features">Learn the model</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className={styles.footer}>
        <span><span className={styles.footerBrand}>Eagle Eyes</span> · A personal golf stat tracker</span>
        <span>Created by Daniel Nguyen</span>
      </footer>
    </div>
  );
}
