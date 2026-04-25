import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input, Button, Card, CardBody, CardHeader, Divider, Chip } from "@heroui/react";
import { api } from "../api";
import type { Lie, EndLie, Shot, HoleInput } from "../../../shared/types/index.js";

const START_LIES: Lie[] = ["TEE", "FAIRWAY", "ROUGH", "SAND", "RECOVERY", "GREEN"];
const END_LIES: EndLie[] = [...START_LIES, "HOLE"];

function distUnit(lie: Lie | EndLie) {
  return lie === "GREEN" ? "ft" : "y";
}

function emptyHole(number: number): HoleInput {
  return {
    number,
    par: 4,
    shots: [{ shotNumber: 1, startLie: "TEE", startDistance: 380, endLie: "FAIRWAY", endDistance: 140 }],
  };
}

export function NewRound() {
  const navigate = useNavigate();
  const [course, setCourse] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [holes, setHoles] = useState<HoleInput[]>([emptyHole(1)]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function updateHole(idx: number, patch: Partial<HoleInput>) {
    setHoles((p) => p.map((h, i) => (i === idx ? { ...h, ...patch } : h)));
  }

  function updateShot(hi: number, si: number, patch: Partial<Shot>) {
    setHoles((p) =>
      p.map((h, i) => {
        if (i !== hi) return h;
        return { ...h, shots: h.shots.map((s, j) => (j === si ? { ...s, ...patch } : s)) };
      }),
    );
  }

  function addShot(hi: number) {
    setHoles((p) =>
      p.map((h, i) => {
        if (i !== hi) return h;
        const last = h.shots[h.shots.length - 1];
        const startLie: Lie = last.endLie === "HOLE" ? "TEE" : (last.endLie as Lie);
        return {
          ...h,
          shots: [
            ...h.shots,
            {
              shotNumber: h.shots.length + 1,
              startLie,
              startDistance: last.endDistance,
              endLie: startLie === "GREEN" ? "GREEN" : ("FAIRWAY" as EndLie),
              endDistance: 0,
            },
          ],
        };
      }),
    );
  }

  function removeShot(hi: number, si: number) {
    setHoles((p) =>
      p.map((h, i) => {
        if (i !== hi || h.shots.length === 1) return h;
        const shots = h.shots
          .filter((_, j) => j !== si)
          .map((s, k) => ({ ...s, shotNumber: k + 1 }));
        return { ...h, shots };
      }),
    );
  }

  function holeOut(hi: number, si: number) {
    updateShot(hi, si, { endLie: "HOLE", endDistance: 0 });
  }

  async function handleSubmit() {
    setError(null);
    setSubmitting(true);
    try {
      const created = await api.createRound({ course, date: new Date(date).toISOString(), holes });
      navigate(`/rounds/${created.id}`);
    } catch (e) {
      setError(String(e));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <h2 className="text-[#003D2B] font-bold text-2xl m-0">New Round</h2>

      {/* Course + date */}
      <div className="flex gap-4">
        <Input
          label="Course"
          placeholder="Pebble Beach"
          value={course}
          onValueChange={setCourse}
          classNames={{ inputWrapper: "border border-[#C8DDD0]" }}
          variant="bordered"
          size="sm"
          className="max-w-sm"
        />
        <Input
          label="Date"
          type="date"
          value={date}
          onValueChange={setDate}
          classNames={{ inputWrapper: "border border-[#C8DDD0]" }}
          variant="bordered"
          size="sm"
          className="max-w-[180px]"
        />
      </div>

      {/* Holes */}
      {holes.map((h, hi) => (
        <Card key={hi} className="border border-[#C8DDD0] border-l-4 border-l-[#00563F]" shadow="none">
          <CardHeader className="px-5 py-3 flex justify-between items-center">
            <span className="font-semibold text-[#003D2B]">Hole {h.number}</span>
            <div className="flex items-center gap-3">
              <label className="text-xs text-[#4A6B57] font-medium uppercase tracking-wide flex items-center gap-2">
                Par
                <select
                  value={h.par}
                  onChange={(e) => updateHole(hi, { par: Number(e.target.value) })}
                  className="shot-select"
                >
                  {[3, 4, 5, 6].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>
              {holes.length > 1 && (
                <Button
                  size="sm" variant="light" color="danger"
                  onPress={() => setHoles((p) => p.filter((_, i) => i !== hi).map((h2, k) => ({ ...h2, number: k + 1 })))}
                >
                  Remove
                </Button>
              )}
            </div>
          </CardHeader>
          <Divider />
          <CardBody className="p-0">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[#003D2B] text-[#F5D130]">
                  <th className="px-4 py-2 text-left font-semibold tracking-wide">#</th>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide">From</th>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide">Dist</th>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide">To</th>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide">Dist</th>
                  <th className="px-4 py-2 text-left font-semibold tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {h.shots.map((s, si) => (
                  <tr key={si} className="border-b border-[#E8F5EE] last:border-0 hover:bg-[#E8F5EE]/50">
                    <td className="px-4 py-2 font-medium text-[#4A6B57]">{s.shotNumber}</td>
                    <td className="px-4 py-2">
                      <select
                        value={s.startLie}
                        onChange={(e) => updateShot(hi, si, { startLie: e.target.value as Lie })}
                        className="shot-select"
                      >
                        {START_LIES.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-1">
                        <input
                          type="number" min={0} step="0.1"
                          value={s.startDistance}
                          onChange={(e) => updateShot(hi, si, { startDistance: Number(e.target.value) })}
                          className="shot-input"
                        />
                        <span className="text-[#4A6B57]">{distUnit(s.startLie)}</span>
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <select
                        value={s.endLie}
                        onChange={(e) => updateShot(hi, si, { endLie: e.target.value as EndLie })}
                        className="shot-select"
                      >
                        {END_LIES.map((l) => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </td>
                    <td className="px-4 py-2">
                      <span className="flex items-center gap-1">
                        <input
                          type="number" min={0} step="0.1"
                          disabled={s.endLie === "HOLE"}
                          value={s.endLie === "HOLE" ? 0 : s.endDistance}
                          onChange={(e) => updateShot(hi, si, { endDistance: Number(e.target.value) })}
                          className="shot-input"
                        />
                        <span className="text-[#4A6B57]">
                          {s.endLie === "HOLE" ? "" : distUnit(s.endLie)}
                        </span>
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex gap-1 items-center">
                        {s.endLie !== "HOLE" && (
                          <Chip
                            size="sm" variant="flat" color="success"
                            className="cursor-pointer"
                            onClick={() => holeOut(hi, si)}
                          >
                            holed
                          </Chip>
                        )}
                        {h.shots.length > 1 && (
                          <Button
                            size="sm" variant="light" color="danger"
                            isIconOnly onPress={() => removeShot(hi, si)}
                            className="min-w-6 h-6 text-base"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-4 py-3">
              <Button size="sm" variant="flat" color="primary" onPress={() => addShot(hi)}>
                + Add shot
              </Button>
            </div>
          </CardBody>
        </Card>
      ))}

      <div className="flex justify-between items-center pt-2 border-t border-[#C8DDD0]">
        <Button
          variant="bordered"
          color="primary"
          size="sm"
          onPress={() => setHoles((p) => [...p, emptyHole(p.length + 1)])}
        >
          + Add hole
        </Button>
        <div className="flex gap-3 items-center">
          {error && <span className="text-danger text-sm">{error}</span>}
          <Button as={Link} to="/rounds" variant="light" color="default" size="sm">Cancel</Button>
          <Button
            color="primary"
            size="sm"
            isLoading={submitting}
            isDisabled={!course.trim()}
            onPress={handleSubmit}
          >
            Save round
          </Button>
        </div>
      </div>
    </div>
  );
}
