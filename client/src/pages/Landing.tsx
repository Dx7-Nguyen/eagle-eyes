import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Card, CardBody, Divider } from "@heroui/react";
import { api } from "../api";
import { fmtSG } from "../lib/format";
import type { RoundSummary } from "../../../shared/types/index.js";

export function Landing() {
  const [rounds, setRounds] = useState<RoundSummary[] | null>(null);

  useEffect(() => {
    api.listRounds().then(setRounds).catch(() => {});
  }, []);

  const roundCount = rounds?.length ?? 0;
  const avgSG =
    rounds && rounds.length > 0
      ? rounds.reduce((s, r) => s + r.sgTotal, 0) / rounds.length
      : null;
  const bestCategory = rounds && rounds.length > 0 ? getBestCat(rounds) : null;

  return (
    <div className="flex flex-col gap-10">
      {/* Hero */}
      <div className="hero-section p-14">
        <div className="hero-overlay" />
        <div className="relative z-10 max-w-xl">
          <h1 className="text-[2.4rem] font-extrabold text-[#F5D130] drop-shadow-lg mb-3 leading-tight">
            Understand your golf game.
          </h1>
          <p className="text-white/90 text-lg leading-relaxed mb-8">
            Log rounds shot-by-shot, track strokes gained across every part of
            your game, and spot trends over time — so you know exactly where to
            improve.
          </p>
          <div className="flex gap-3">
            <Button
              as={Link}
              to="/new"
              size="lg"
              className="bg-[#F5D130] text-[#003D2B] font-bold hover:bg-[#CBA135]"
            >
              Log a Round
            </Button>
            <Button
              as={Link}
              to="/rounds"
              size="lg"
              variant="bordered"
              className="border-white/40 text-white bg-white/10 backdrop-blur-sm hover:bg-white/20"
            >
              View Rounds
            </Button>
          </div>
        </div>
      </div>

      {/* Stats bar — only when data exists */}
      {rounds !== null && roundCount > 0 && (
        <Card className="bg-[#003D2B] shadow-md">
          <CardBody className="flex flex-row items-center gap-7 px-7 py-5">
            <div className="flex flex-col gap-0.5">
              <span className="text-[#F5D130] text-2xl font-extrabold">{roundCount}</span>
              <span className="text-white/60 text-xs uppercase tracking-widest">Rounds logged</span>
            </div>
            <Divider orientation="vertical" className="h-10 bg-white/20" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[#F5D130] text-2xl font-extrabold">{fmtSG(avgSG!)}</span>
              <span className="text-white/60 text-xs uppercase tracking-widest">Avg SG total</span>
            </div>
            <Divider orientation="vertical" className="h-10 bg-white/20" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[#F5D130] text-2xl font-extrabold">{bestCategory}</span>
              <span className="text-white/60 text-xs uppercase tracking-widest">Strongest category</span>
            </div>
            <Button
              as={Link}
              to="/trends"
              variant="bordered"
              size="sm"
              className="ml-auto border-white/30 text-[#F5D130] hover:bg-white/10"
            >
              View Trends →
            </Button>
          </CardBody>
        </Card>
      )}

      {/* Feature cards */}
      <div className="grid grid-cols-3 gap-5">
        {[
          {
            icon: "🏌️",
            title: "Log Rounds",
            body: "Enter every shot with its starting lie, distance, and result. The app chains shots automatically — each new shot starts where the last one ended.",
            cta: "Start logging",
            to: "/new",
          },
          {
            icon: "📊",
            title: "Strokes Gained",
            body: "Every shot is benchmarked against PGA Tour baselines and categorised into Tee, Approach, Short Game, and Putting — so you see exactly how many strokes each category costs or saves.",
            cta: "View rounds",
            to: "/rounds",
          },
          {
            icon: "📈",
            title: "Track Trends",
            body: "A rolling line chart shows how your SG in each category changes round to round. Spot the patterns, focus your practice.",
            cta: "See trends",
            to: "/trends",
          },
        ].map((f) => (
          <Card key={f.title} className="border border-[#C8DDD0] hover:shadow-lg transition-shadow" shadow="none">
            <CardBody className="flex flex-col gap-3 p-6">
              <div className="text-3xl">{f.icon}</div>
              <h3 className="font-bold text-[#003D2B] text-lg m-0">{f.title}</h3>
              <p className="text-[#4A6B57] text-sm leading-relaxed flex-1">{f.body}</p>
              <Button as={Link} to={f.to} color="primary" variant="flat" size="sm" className="self-start">
                {f.cta}
              </Button>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <Card className="border border-[#C8DDD0]" shadow="none">
        <CardBody className="p-8">
          <h2 className="text-[#003D2B] font-bold text-xl mb-6">How it works</h2>
          <ol className="flex flex-col gap-5 list-none p-0 m-0">
            {[
              ["Add a hole", "Set the par and enter each shot with its lie and distance."],
              ["Mark the final shot holed", "Click 'holed' on the shot that drops — it locks endLie to HOLE."],
              ["Save the round", "Strokes gained are computed instantly across all four categories."],
              ["Check the trends page", "Watch your numbers move as you log more rounds."],
            ].map(([title, body], i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#00563F] text-[#F5D130] text-xs font-extrabold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="text-sm leading-relaxed pt-0.5">
                  <strong>{title}</strong> — {body}
                </span>
              </li>
            ))}
          </ol>
          <Button as={Link} to="/help" variant="light" color="primary" size="sm" className="mt-5 px-0">
            Read the full guide →
          </Button>
        </CardBody>
      </Card>
    </div>
  );
}

function getBestCat(rounds: RoundSummary[]): string {
  const totals = { TEE: 0, APPROACH: 0, SHORT_GAME: 0, PUTTING: 0 };
  for (const r of rounds) {
    totals.TEE += r.sgByCategory.TEE;
    totals.APPROACH += r.sgByCategory.APPROACH;
    totals.SHORT_GAME += r.sgByCategory.SHORT_GAME;
    totals.PUTTING += r.sgByCategory.PUTTING;
  }
  const best = Object.entries(totals).sort((a, b) => b[1] - a[1])[0][0];
  return { TEE: "Tee", APPROACH: "Approach", SHORT_GAME: "Short Game", PUTTING: "Putting" }[best]!;
}
