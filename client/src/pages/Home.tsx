import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Button, Chip, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { api } from "../api";
import { fmtSG, fmtDate } from "../lib/format";
import type { RoundSummary, DraftSummary } from "../../../shared/types/index.js";

function SGChip({ value }: { value: number }) {
  return (
    <Chip
      size="sm"
      variant="flat"
      color={value >= 0 ? "success" : "danger"}
      classNames={{ content: "font-mono tabular-nums font-semibold text-xs" }}
    >
      {fmtSG(value)}
    </Chip>
  );
}

export function Home() {
  const [rounds, setRounds] = useState<RoundSummary[] | null>(null);
  const [drafts, setDrafts] = useState<DraftSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [target, setTarget] = useState<RoundSummary | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    api.listRounds().then(setRounds).catch((e) => setError(String(e)));
    api.listDrafts().then(setDrafts).catch(() => {});
  }, []);

  function confirmDelete(round: RoundSummary) {
    setTarget(round);
    onOpen();
  }

  async function handleDelete() {
    if (!target) return;
    setDeleting(true);
    try {
      await api.deleteRound(target.id);
      setRounds((prev) => prev?.filter((r) => r.id !== target.id) ?? null);
      onClose();
    } catch (e) {
      setError(String(e));
    } finally {
      setDeleting(false);
      setTarget(null);
    }
  }

  if (error) return <p className="text-danger">{error}</p>;
  if (!rounds) return <p className="text-[#4A6B57]">Loading…</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-[#003D2B] font-bold text-2xl m-0">Rounds</h2>
        <Button as={Link} to="/new" color="primary" size="sm">+ New Round</Button>
      </div>

      {/* In-progress drafts */}
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
              <Button
                as={Link}
                to={`/new?draft=${d.id}`}
                size="sm"
                color="primary"
                variant="flat"
              >
                Continue →
              </Button>
            </div>
          ))}
        </div>
      )}

      {rounds.length === 0 ? (
        <p className="text-[#4A6B57]">No rounds yet. Log your first round.</p>
      ) : (
        <Table
          aria-label="Rounds"
          classNames={{
            th: "bg-[#003D2B] text-[#F5D130] font-semibold text-xs uppercase tracking-wide",
            td: "text-sm",
            tr: "hover:bg-[#E8F5EE] transition-colors",
          }}
          shadow="none"
          className="border border-[#C8DDD0] rounded-xl overflow-hidden"
        >
          <TableHeader>
            <TableColumn>Date</TableColumn>
            <TableColumn>Course</TableColumn>
            <TableColumn>Score</TableColumn>
            <TableColumn>SG: Tee</TableColumn>
            <TableColumn>SG: Approach</TableColumn>
            <TableColumn>SG: Short Game</TableColumn>
            <TableColumn>SG: Putting</TableColumn>
            <TableColumn>SG Total</TableColumn>
            <TableColumn> </TableColumn>
          </TableHeader>
          <TableBody>
            {rounds.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{fmtDate(r.date)}</TableCell>
                <TableCell>
                  <Link to={`/rounds/${r.id}`} className="text-[#00563F] font-medium hover:underline">
                    {r.course}
                  </Link>
                </TableCell>
                <TableCell>
                  <span className="font-mono tabular-nums">
                    {r.totalStrokes} (
                    <span className={r.totalStrokes - r.totalPar <= 0 ? "text-success-600" : "text-danger-600"}>
                      {r.totalStrokes - r.totalPar >= 0 ? "+" : ""}{r.totalStrokes - r.totalPar}
                    </span>
                    )
                  </span>
                </TableCell>
                <TableCell><SGChip value={r.sgByCategory.TEE} /></TableCell>
                <TableCell><SGChip value={r.sgByCategory.APPROACH} /></TableCell>
                <TableCell><SGChip value={r.sgByCategory.SHORT_GAME} /></TableCell>
                <TableCell><SGChip value={r.sgByCategory.PUTTING} /></TableCell>
                <TableCell>
                  <Chip
                    size="sm" variant="flat"
                    color={r.sgTotal >= 0 ? "primary" : "danger"}
                    classNames={{ content: "font-mono tabular-nums font-semibold text-xs" }}
                  >
                    {fmtSG(r.sgTotal)}
                  </Chip>
                </TableCell>
                <TableCell>
                  <Button
                    size="sm" variant="light" color="danger"
                    onPress={() => confirmDelete(r)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="sm">
        <ModalContent>
          <ModalHeader className="text-[#003D2B]">Delete Round</ModalHeader>
          <ModalBody>
            <p className="text-sm text-[#4A6B57]">
              Are you sure you want to delete{" "}
              <strong className="text-[#1A2E23]">{target?.course}</strong> on{" "}
              {target && fmtDate(target.date)}? This cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onClose} isDisabled={deleting}>Cancel</Button>
            <Button color="danger" onPress={handleDelete} isLoading={deleting}>Delete</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
