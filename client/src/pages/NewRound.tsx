import { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import {
  Input, Button, Card, CardBody, CardHeader, Divider, Chip,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
} from "@heroui/react";
import { api } from "../api";
import type { Lie, EndLie, Shot, HoleInput, CourseSearchResult } from "../../../shared/types/index.js";

const START_LIES: Lie[] = ["TEE", "FAIRWAY", "ROUGH", "SAND", "RECOVERY", "GREEN"];
const END_LIES: EndLie[] = [...START_LIES, "HOLE"];

function DistanceInput({
  value,
  disabled,
  onChange,
}: {
  value: number;
  disabled?: boolean;
  onChange: (v: number) => void;
}) {
  const [text, setText] = useState(String(value));
  // Sync when parent value changes (e.g. holeOut sets endDistance→0, or draft load)
  // Use functional updater so `text` isn't a stale dep
  useEffect(() => {
    setText((prev) => Number(prev) !== value ? String(value) : prev);
  }, [value]);

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  return (
    <input
      type="number"
      min={0}
      step="0.1"
      disabled={disabled}
      value={text}
      className="shot-input"
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        const num = text === "" || isNaN(Number(text)) ? 0 : Number(text);
        setText(String(num));
        onChangeRef.current(num);
      }}
    />
  );
}

function distUnit(lie: Lie | EndLie) {
  return lie === "GREEN" ? "ft" : "y";
}

function emptyHole(number: number): HoleInput {
  return {
    number,
    par: 4,
    shots: [{ shotNumber: 1, startLie: "TEE", startDistance: 0, endLie: "FAIRWAY", endDistance: 0 }],
  };
}

export function NewRound() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftParam = searchParams.get("draft");

  const [course, setCourse] = useState("");
  const [courseExternalId, setCourseExternalId] = useState<number | null>(null);
  const [courseInputValue, setCourseInputValue] = useState("");
  const [courseItems, setCourseItems] = useState<CourseSearchResult[]>([]);
  const [courseLoading, setCourseLoading] = useState(false);
  const [courseDropdownOpen, setCourseDropdownOpen] = useState(false);
  const selectedCourseNameRef = useRef<string | null>(null);
  const courseRequestIdRef = useRef(0);

  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [holes, setHoles] = useState<HoleInput[]>([emptyHole(1)]);
  const [draftId, setDraftId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveConfirmed, setSaveConfirmed] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load draft if ?draft=ID is present in URL
  useEffect(() => {
    if (!draftParam) return;
    const id = Number(draftParam);
    if (!Number.isFinite(id)) return;
    api.getRoundEditData(id).then((data) => {
      if (data.status !== "DRAFT") return;
      setCourse(data.course);
      setCourseInputValue(data.course);
      setCourseExternalId(data.courseExternalId ?? null);
      if (data.courseExternalId != null && data.course) {
        setCourseItems([{ id: data.courseExternalId, name: data.course }]);
        selectedCourseNameRef.current = data.course;
      }
      setDate(data.date.slice(0, 10));
      setHoles(data.holes);
      setDraftId(id);
    }).catch(() => {});
  }, [draftParam]);

  // Debounced course search against our proxy (300ms).
  // Uses a request id ref to discard out-of-order responses, plus an AbortController
  // to cancel in-flight fetches when the user keeps typing.
  useEffect(() => {
    const query = courseInputValue.trim();
    if (query.length < 2) {
      setCourseLoading(false);
      return;
    }
    if (query === selectedCourseNameRef.current) {
      // User just selected this; don't re-search.
      return;
    }

    const controller = new AbortController();
    const reqId = ++courseRequestIdRef.current;
    setCourseLoading(true);

    const timer = setTimeout(async () => {
      try {
        const results = await api.searchCourses(query);
        if (controller.signal.aborted) return;
        if (reqId !== courseRequestIdRef.current) return;
        setCourseItems(results);
        if (results.length > 0) setCourseDropdownOpen(true);
      } catch {
        // Network/abort errors → leave items as-is, swallow silently.
      } finally {
        if (reqId === courseRequestIdRef.current) setCourseLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [courseInputValue]);

  function updateHole(idx: number, patch: Partial<HoleInput>) {
    setHoles((p) => p.map((h, i) => (i === idx ? { ...h, ...patch } : h)));
    setSaveConfirmed(false);
  }

  function updateShot(hi: number, si: number, patch: Partial<Shot>) {
    setHoles((p) =>
      p.map((h, i) => {
        if (i !== hi) return h;
        return { ...h, shots: h.shots.map((s, j) => (j === si ? { ...s, ...patch } : s)) };
      }),
    );
    setSaveConfirmed(false);
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
    setSaveConfirmed(false);
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
    setSaveConfirmed(false);
  }

  function holeOut(hi: number, si: number) {
    updateShot(hi, si, { endLie: "HOLE", endDistance: 0 });
  }

  async function handleSaveProgress() {
    setError(null);
    setSaving(true);
    try {
      const input = { course, courseExternalId, date: new Date(date).toISOString(), holes };
      if (draftId) {
        await api.updateDraft(draftId, input);
      } else {
        const draft = await api.saveDraft(input);
        setDraftId(draft.id);
        navigate(`/new?draft=${draft.id}`, { replace: true });
      }
      setSaveConfirmed(true);
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  async function handlePublish() {
    setError(null);
    setSubmitting(true);
    setShowConfirm(false);
    try {
      const input = { course, courseExternalId, date: new Date(date).toISOString(), holes };
      if (draftId) {
        await api.updateDraft(draftId, input);
        await api.publishRound(draftId);
        navigate("/profile");
      } else {
        await api.createRound(input);
        navigate("/profile");
      }
    } catch (e) {
      setError(String(e));
      setSubmitting(false);
    }
  }

  const holesComplete = holes.length > 0 &&
    holes.every((h) => h.shots.length > 0 && h.shots[h.shots.length - 1].endLie === "HOLE");

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h2 className="text-[#003D2B] font-bold text-2xl m-0">
          {draftId ? "Continue Round" : "New Round"}
        </h2>
        {draftId && (
          <span className="text-xs font-medium text-[#4A6B57] bg-[#E8F5EE] px-3 py-1 rounded-full">
            Draft saved
          </span>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-300 text-red-700 text-sm px-4 py-3 rounded-xl font-medium">
          {error}
        </div>
      )}

      {/* Course + date */}
      <div className="flex gap-4 items-end">
        <div className="relative max-w-sm w-full flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#4A6B57] uppercase tracking-wide">Course</span>
          <Input
            placeholder="Pebble Beach"
            value={courseInputValue}
            onValueChange={(v) => {
              setCourseInputValue(v);
              setCourse(v);
              if (v !== selectedCourseNameRef.current) {
                setCourseExternalId(null);
                selectedCourseNameRef.current = null;
              }
              setSaveConfirmed(false);
            }}
            onFocus={() => setCourseDropdownOpen(true)}
            onBlur={() => setTimeout(() => setCourseDropdownOpen(false), 150)}
            classNames={{ inputWrapper: "border border-[#C8DDD0]" }}
            variant="bordered"
            size="sm"
            endContent={courseLoading ? (
              <span className="text-[#4A6B57] text-xs animate-pulse">…</span>
            ) : undefined}
          />
          {courseDropdownOpen && courseItems.length > 0 && (
            <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white border border-[#C8DDD0] rounded-xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
              {courseItems.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="w-full text-left px-4 py-2.5 hover:bg-[#E8F5EE] transition-colors border-b border-[#F0F7F3] last:border-0"
                  onMouseDown={() => {
                    setCourseExternalId(c.id);
                    setCourse(c.name);
                    setCourseInputValue(c.name);
                    selectedCourseNameRef.current = c.name;
                    setCourseDropdownOpen(false);
                    setSaveConfirmed(false);
                  }}
                >
                  <div className="text-sm font-medium text-[#003D2B]">{c.name}</div>
                  {c.location && <div className="text-xs text-[#4A6B57]">{c.location}</div>}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#4A6B57] uppercase tracking-wide">Date</span>
          <Input
            type="date"
          value={date}
          onValueChange={(v) => { setDate(v); setSaveConfirmed(false); }}
          classNames={{ inputWrapper: "border border-[#C8DDD0]" }}
          variant="bordered"
          size="sm"
          className="w-[180px]"
        />
        </div>
      </div>

      {/* Holes */}
      {holes.map((h, hi) => (
        <Card key={hi} className="border border-[#C8DDD0] border-l-4 border-l-[#00563F]" shadow="none">
          <CardHeader className="px-5 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[#003D2B]">Hole {h.number}</span>
              {h.shots.length > 0 && h.shots[h.shots.length - 1].endLie === "HOLE" && (
                <span className="text-xs font-medium text-success-700 bg-success-100 px-2 py-0.5 rounded-full">
                  Complete
                </span>
              )}
            </div>
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
                    <td className="px-4 py-2 font-mono tabular-nums font-medium text-[#4A6B57]">{s.shotNumber}</td>
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
                        <DistanceInput
                          value={s.startDistance}
                          onChange={(v) => updateShot(hi, si, { startDistance: v })}
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
                        <DistanceInput
                          value={s.endLie === "HOLE" ? 0 : s.endDistance}
                          disabled={s.endLie === "HOLE"}
                          onChange={(v) => updateShot(hi, si, { endDistance: v })}
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

      {/* Footer actions */}
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
          {saveConfirmed && !saving && (
            <span className="text-success-700 text-sm font-medium">Progress saved</span>
          )}
          <Button as={Link} to="/rounds" variant="light" color="default" size="sm">Cancel</Button>
          <Button
            variant="bordered"
            color="primary"
            size="sm"
            isLoading={saving}
            isDisabled={!course.trim() || submitting}
            onPress={handleSaveProgress}
          >
            Save progress
          </Button>
          <Button
            color="primary"
            size="sm"
            isLoading={submitting}
            onPress={() => setShowConfirm(true)}
          >
            Finish round
          </Button>
        </div>
      </div>

      {/* Confirm publish modal */}
      <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)} size="sm">
        <ModalContent>
          <ModalHeader className="text-[#003D2B]">
            {!course.trim() || !holesComplete ? "Round not complete" : "Publish round?"}
          </ModalHeader>
          <ModalBody>
            {!course.trim() ? (
              <p className="text-sm text-[#4A6B57]">
                Please enter a <strong className="text-[#1A2E23]">course name</strong> before finishing your round.
              </p>
            ) : !holesComplete ? (
              <>
                <p className="text-sm text-[#4A6B57]">
                  Not all holes are finished yet. For each hole, click{" "}
                  <strong className="text-[#1A2E23]">holed</strong> on the shot that went in the hole.
                </p>
                <p className="text-sm text-[#4A6B57] mt-1">
                  {holes.filter((h) => h.shots.length > 0 && h.shots[h.shots.length - 1].endLie === "HOLE").length}
                  {" "}of {holes.length} {holes.length === 1 ? "hole" : "holes"} complete.
                </p>
              </>
            ) : (
              <>
                <p className="text-sm text-[#4A6B57]">
                  You're about to publish{" "}
                  <strong className="text-[#1A2E23]">{course}</strong>
                  {" "}({holes.length} {holes.length === 1 ? "hole" : "holes"}).
                  Once published it will appear in your round history and affect your trends.
                </p>
                <p className="text-sm text-[#4A6B57] mt-1">
                  You won't be able to edit shots after publishing.
                </p>
              </>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setShowConfirm(false)} isDisabled={submitting}>
              {course.trim() && holesComplete ? "Keep editing" : "Go back"}
            </Button>
            {course.trim() && holesComplete && (
              <Button color="primary" onPress={handlePublish} isLoading={submitting}>
                Publish round
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
