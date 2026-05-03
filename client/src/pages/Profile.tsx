import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardBody, CardHeader, Button, Chip, Divider, Input } from "@heroui/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { api } from "../api.js";
import { fmtSG, fmtDate } from "../lib/format.js";
import { useAuth } from "../context/AuthContext.js";
import type { RoundSummary, DraftSummary, TrendPoint } from "../../../shared/types/index.js";

function avg(nums: number[]) {
  if (nums.length === 0) return 0;
  return nums.reduce((s, n) => s + n, 0) / nums.length;
}

function r2(n: number) {
  return Math.round(n * 100) / 100;
}

function SGValue({ value }: { value: number }) {
  return (
    <span className={`font-mono font-semibold tabular-nums ${value >= 0 ? "text-success-600" : "text-danger-600"}`}>
      {fmtSG(value)}
    </span>
  );
}

function StatCard({
  label, value, sub, to,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  to?: string;
}) {
  const inner = (
    <Card
      shadow="none"
      className={`border border-[#C8DDD0] h-full transition-colors ${to ? "hover:border-[#003D2B] hover:bg-[#F5FBF7] cursor-pointer" : ""}`}
    >
      <CardBody className="px-5 py-4 flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#4A6B57] m-0">{label}</p>
        <div className="text-2xl font-bold text-[#003D2B] leading-tight">{value}</div>
        {sub && <p className="text-xs text-[#4A6B57] m-0">{sub}</p>}
      </CardBody>
    </Card>
  );
  return to ? <Link to={to} className="no-underline block">{inner}</Link> : inner;
}

function CategoryBar({ label, value, max }: { label: string; value: number; sub?: string; max: number }) {
  const pct = max === 0 ? 0 : Math.min(Math.abs(value) / max, 1) * 100;
  const positive = value >= 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-[#4A6B57] w-24 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-[#E8F5EE] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${positive ? "bg-success-500" : "bg-danger-400"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <SGValue value={value} />
    </div>
  );
}

export function Profile() {
  const { user, updateProfile } = useAuth();
  const [rounds, setRounds] = useState<RoundSummary[] | null>(null);
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Editable name state
  const [editName, setEditName] = useState("");
  const [nameEditing, setNameEditing] = useState(false);
  const [nameSaving, setNameSaving] = useState(false);
  const [nameSaved, setNameSaved] = useState(false);
  const [nameError, setNameError] = useState("");

  useEffect(() => {
    api.listRounds().then(setRounds).catch((e) => setError(String(e)));
    api.listDrafts().then(setDrafts).catch(() => {});
    api.trends().then(setTrends).catch(() => {});
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!rounds) return <p className="text-[#4A6B57]">Loading…</p>;

  const hasRounds = rounds.length > 0;
  const recent = rounds.slice(0, 5);

  const avgSGTotal = avg(rounds.map((r) => r.sgTotal));
  const avgScoreToPar = avg(rounds.map((r) => r.totalStrokes - r.totalPar));
  const bestRound = hasRounds
    ? rounds.reduce((best, r) => (r.sgTotal > best.sgTotal ? r : best), rounds[0])
    : null;

  const avgByCategory = {
    TEE: avg(rounds.map((r) => r.sgByCategory.TEE)),
    APPROACH: avg(rounds.map((r) => r.sgByCategory.APPROACH)),
    SHORT_GAME: avg(rounds.map((r) => r.sgByCategory.SHORT_GAME)),
    PUTTING: avg(rounds.map((r) => r.sgByCategory.PUTTING)),
  };

  const catMax = Math.max(
    ...Object.values(avgByCategory).map(Math.abs),
    0.01,
  );

  const chartData = trends.slice(-10).map((p) => ({
    label: fmtDate(p.date),
    Total: r2(p.sgTotal),
  }));

  const displayName = user?.firstName || user?.email.split("@")[0] || "there";

  async function saveName() {
    if (!editName.trim()) { setNameError("Name cannot be empty"); return; }
    setNameSaving(true);
    setNameError("");
    try {
      await updateProfile(editName.trim());
      setNameEditing(false);
      setNameSaved(true);
      setTimeout(() => setNameSaved(false), 2500);
    } catch (err) {
      setNameError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setNameSaving(false);
    }
  }

  function startEditing() {
    setEditName(user?.firstName ?? "");
    setNameError("");
    setNameEditing(true);
  }

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-[#003D2B] font-black text-2xl m-0">
            Welcome back, <span className="text-[#00563F]">{displayName}</span>
          </h2>
          <p className="text-[#4A6B57] text-sm m-0 mt-0.5">
            {hasRounds
              ? `${rounds.length} published round${rounds.length !== 1 ? "s" : ""} in your history`
              : "No rounds yet — log your first one below"}
          </p>
        </div>
        <Link
          to="/new"
          className="inline-flex items-center justify-center gap-1 bg-[#003D2B] text-[#F5D130] font-bold text-sm px-5 py-2 rounded-full shadow-sm hover:shadow-md hover:bg-[#00563F] transition-all no-underline"
        >
          + New Round
        </Link>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Rounds Logged"
          value={rounds.length}
          sub="published"
          to="/rounds"
        />
        <StatCard
          label="Avg Score to Par"
          value={
            hasRounds ? (
              <span className={avgScoreToPar <= 0 ? "text-success-600" : "text-danger-600"}>
                {avgScoreToPar >= 0 ? "+" : ""}{r2(avgScoreToPar)}
              </span>
            ) : "—"
          }
          sub={hasRounds ? "across all rounds" : "no data yet"}
          to={hasRounds ? "/rounds" : undefined}
        />
        <StatCard
          label="Avg SG Total"
          value={hasRounds ? <SGValue value={r2(avgSGTotal)} /> : "—"}
          sub={hasRounds ? "vs PGA Tour baseline" : "no data yet"}
          to={hasRounds ? "/trends" : undefined}
        />
        <StatCard
          label="Best Round"
          value={bestRound ? <SGValue value={r2(bestRound.sgTotal)} /> : "—"}
          sub={bestRound ? `${bestRound.course} · ${fmtDate(bestRound.date)}` : "no data yet"}
          to={bestRound ? `/rounds/${bestRound.id}` : undefined}
        />
      </div>

      {/* ── Account info ────────────────────────────────────────────────── */}
      <Card shadow="none" className="border border-[#C8DDD0]">
        <CardHeader className="px-5 py-3 flex items-center justify-between">
          <h3 className="text-[#003D2B] font-bold m-0">Account</h3>
          {!nameEditing && (
            <Button size="sm" variant="light" className="text-[#003D2B] font-semibold" onPress={startEditing}>
              Edit name
            </Button>
          )}
        </CardHeader>
        <Divider />
        <CardBody className="px-5 py-4 flex flex-col gap-3">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A6B57]">Email</span>
              <span className="text-sm text-[#1A2E23]">{user?.email}</span>
            </div>
            <div className="flex flex-col gap-0.5 min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A6B57]">First Name</span>
              {nameEditing ? (
                <div className="flex items-center gap-2 flex-wrap">
                  <Input
                    size="sm"
                    value={editName}
                    onValueChange={setEditName}
                    placeholder="Your first name"
                    variant="bordered"
                    className="w-44"
                    classNames={{
                      inputWrapper: "border-[#C8DDD0] hover:border-[#003D2B] focus-within:!border-[#003D2B] h-8",
                    }}
                    onKeyDown={(e) => { if (e.key === "Enter") saveName(); if (e.key === "Escape") setNameEditing(false); }}
                    autoFocus
                  />
                  <Button size="sm" className="bg-[#003D2B] text-[#F5D130] font-bold h-8" onPress={saveName} isLoading={nameSaving}>
                    Save
                  </Button>
                  <Button size="sm" variant="light" className="h-8" onPress={() => setNameEditing(false)} isDisabled={nameSaving}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <span className="text-sm text-[#1A2E23]">
                  {user?.firstName || <span className="text-[#4A6B57] italic">Not set</span>}
                </span>
              )}
              {nameError && <span className="text-xs text-danger-600">{nameError}</span>}
              {nameSaved && <span className="text-xs text-success-600">Name updated!</span>}
            </div>
          </div>
        </CardBody>
      </Card>

      {/* ── Empty state ─────────────────────────────────────────────────── */}
      {!hasRounds && (
        <Card className="border-2 border-dashed border-[#C8DDD0]" shadow="none">
          <CardBody className="flex flex-col items-center gap-3 py-10 text-center">
            <p className="text-[#003D2B] font-bold text-lg m-0">Start tracking your game</p>
            <p className="text-[#4A6B57] text-sm max-w-sm m-0">
              Log your first round shot-by-shot. Eagle Eyes will calculate strokes gained against
              a PGA Tour baseline and chart your improvement over time.
            </p>
            <Link
              to="/new"
              className="inline-flex items-center justify-center gap-1 bg-[#003D2B] text-[#F5D130] font-bold text-sm px-7 py-2.5 rounded-full shadow-sm hover:shadow-md hover:bg-[#00563F] transition-all no-underline mt-2"
            >
              Log your first round
            </Link>
          </CardBody>
        </Card>
      )}

      {/* ── Trends + SG breakdown ───────────────────────────────────────── */}
      {hasRounds && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Mini trends chart */}
          <Link to="/trends" className="no-underline md:col-span-2">
            <Card
              shadow="none"
              className="border border-[#C8DDD0] hover:border-[#003D2B] transition-colors cursor-pointer h-full"
            >
              <CardHeader className="bg-[#003D2B] px-5 py-3 rounded-t-xl flex items-center justify-between">
                <div>
                  <h3 className="text-[#F5D130] font-bold text-sm m-0">SG Total — Last 10 Rounds</h3>
                  <p className="text-white/50 text-xs m-0">Click to view full trends →</p>
                </div>
              </CardHeader>
              <CardBody className="p-4">
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={chartData} margin={{ top: 8, right: 16, bottom: 4, left: -16 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EE" />
                    <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                    <YAxis tick={{ fontSize: 10 }} />
                    <Tooltip />
                    <ReferenceLine y={0} stroke="#C8DDD0" strokeWidth={1.5} />
                    <Line
                      type="monotone"
                      dataKey="Total"
                      stroke="#003D2B"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: "#F5D130", stroke: "#003D2B" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardBody>
            </Card>
          </Link>

          {/* SG category breakdown */}
          <Link to="/trends" className="no-underline">
            <Card
              shadow="none"
              className="border border-[#C8DDD0] hover:border-[#003D2B] transition-colors cursor-pointer h-full"
            >
              <CardHeader className="bg-[#003D2B] px-5 py-3 rounded-t-xl">
                <div>
                  <h3 className="text-[#F5D130] font-bold text-sm m-0">Avg SG by Category</h3>
                  <p className="text-white/50 text-xs m-0">Click to view full trends →</p>
                </div>
              </CardHeader>
              <CardBody className="px-5 py-5 flex flex-col gap-4">
                <CategoryBar label="SG: Tee"        value={r2(avgByCategory.TEE)}        max={catMax} />
                <CategoryBar label="SG: Approach"   value={r2(avgByCategory.APPROACH)}   max={catMax} />
                <CategoryBar label="SG: Short Game" value={r2(avgByCategory.SHORT_GAME)} max={catMax} />
                <CategoryBar label="SG: Putting"    value={r2(avgByCategory.PUTTING)}    max={catMax} />
                <Divider />
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#4A6B57] uppercase tracking-wide">Avg Total</span>
                  <Chip
                    size="sm"
                    variant="flat"
                    color={avgSGTotal >= 0 ? "success" : "danger"}
                    classNames={{ content: "font-mono font-bold text-xs tabular-nums" }}
                  >
                    {fmtSG(r2(avgSGTotal))}
                  </Chip>
                </div>
              </CardBody>
            </Card>
          </Link>
        </div>
      )}

      {/* ── In-progress drafts ──────────────────────────────────────────── */}
      {drafts.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-[#003D2B] font-semibold text-sm uppercase tracking-wide m-0">In Progress</h3>
          {drafts.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between px-4 py-3 rounded-xl border border-[#F5D130]/50 bg-[#FFFDE8]"
            >
              <div className="flex flex-col gap-0.5">
                <span className="font-semibold text-[#003D2B] text-sm">{d.course || "Untitled round"}</span>
                <span className="text-xs text-[#4A6B57]">
                  {fmtDate(d.date)} · {d.holeCount} {d.holeCount === 1 ? "hole" : "holes"} logged
                </span>
              </div>
              <Button as={Link} to={`/new?draft=${d.id}`} size="sm" color="primary" variant="flat">
                Continue →
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* ── Recent rounds ───────────────────────────────────────────────── */}
      {hasRounds && (
        <Card shadow="none" className="border border-[#C8DDD0]">
          <CardHeader className="px-5 py-3 flex items-center justify-between">
            <h3 className="text-[#003D2B] font-bold m-0">Recent Rounds</h3>
            <Button as={Link} to="/rounds" size="sm" variant="light" className="text-[#003D2B] font-semibold">
              View all →
            </Button>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#003D2B]">
                  {["Date", "Course", "Score", "SG: Tee", "SG: App", "SG: Short", "SG: Putt", "SG Total"].map((h) => (
                    <th key={h} className="px-4 py-2 text-left text-[#F5D130] font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((r, i) => (
                  <tr key={r.id} className={`border-b border-[#E8F5EE] hover:bg-[#F5FBF7] transition-colors ${i % 2 === 1 ? "bg-[#FAFFFE]" : ""}`}>
                    <td className="px-4 py-2.5 text-[#4A6B57] whitespace-nowrap">{fmtDate(r.date)}</td>
                    <td className="px-4 py-2.5">
                      <Link to={`/rounds/${r.id}`} className="text-[#00563F] font-medium hover:underline">
                        {r.course}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 font-mono tabular-nums">
                      {r.totalStrokes}
                      <span className={`ml-1 text-xs ${r.totalStrokes - r.totalPar <= 0 ? "text-success-600" : "text-danger-600"}`}>
                        ({r.totalStrokes - r.totalPar >= 0 ? "+" : ""}{r.totalStrokes - r.totalPar})
                      </span>
                    </td>
                    <td className="px-4 py-2.5"><SGValue value={r.sgByCategory.TEE} /></td>
                    <td className="px-4 py-2.5"><SGValue value={r.sgByCategory.APPROACH} /></td>
                    <td className="px-4 py-2.5"><SGValue value={r.sgByCategory.SHORT_GAME} /></td>
                    <td className="px-4 py-2.5"><SGValue value={r.sgByCategory.PUTTING} /></td>
                    <td className="px-4 py-2.5">
                      <Chip
                        size="sm" variant="flat"
                        color={r.sgTotal >= 0 ? "success" : "danger"}
                        classNames={{ content: "font-mono font-bold text-xs tabular-nums" }}
                      >
                        {fmtSG(r.sgTotal)}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardBody>
        </Card>
      )}

    </div>
  );
}
