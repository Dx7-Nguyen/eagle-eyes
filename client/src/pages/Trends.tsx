import { useEffect, useState } from "react";
import { Card, CardHeader, CardBody } from "@heroui/react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from "recharts";
import { api } from "../api";
import { fmtDate } from "../lib/format";
import type { TrendPoint } from "../../../shared/types/index.js";

export function Trends() {
  const [points, setPoints] = useState<TrendPoint[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.trends().then(setPoints).catch((e) => setError(String(e)));
  }, []);

  if (error) return <p className="text-danger">{error}</p>;
  if (!points) return <p className="text-[#4A6B57]">Loading…</p>;

  if (points.length === 0) {
    return <p className="text-[#4A6B57]">No rounds yet — log one to see trends.</p>;
  }

  const data = points.map((p) => ({
    label: fmtDate(p.date),
    Tee: r2(p.sgByCategory.TEE),
    Approach: r2(p.sgByCategory.APPROACH),
    "Short Game": r2(p.sgByCategory.SHORT_GAME),
    Putting: r2(p.sgByCategory.PUTTING),
    Total: r2(p.sgTotal),
  }));

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[#003D2B] font-bold text-2xl m-0">Trends</h2>
      <Card className="border border-[#C8DDD0]" shadow="none">
        <CardHeader className="bg-[#003D2B] px-6 py-4 rounded-t-xl">
          <div>
            <h3 className="text-[#F5D130] font-bold m-0">Strokes Gained by Category</h3>
            <p className="text-white/60 text-sm m-0">vs PGA Tour scratch baseline · positive = better</p>
          </div>
        </CardHeader>
        <CardBody className="p-6">
          <ResponsiveContainer width="100%" height={380}>
            <LineChart data={data} margin={{ top: 10, right: 24, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8F5EE" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: '"Geist Mono", ui-monospace, monospace' }} />
              <YAxis tick={{ fontSize: 11, fontFamily: '"Geist Mono", ui-monospace, monospace' }} />
              <Tooltip />
              <Legend />
              <ReferenceLine y={0} stroke="#C8DDD0" strokeWidth={1.5} />
              <Line type="monotone" dataKey="Tee"        stroke="#2563eb" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Approach"   stroke="#16a34a" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Short Game" stroke="#d97706" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Putting"    stroke="#dc2626" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="Total"      stroke="#003D2B" strokeWidth={3} dot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardBody>
      </Card>
    </div>
  );
}

function r2(n: number) {
  return Math.round(n * 100) / 100;
}
